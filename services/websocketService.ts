import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { WebSocketMessage, WebSocketMessageType, DeviceConnection, SyncConflict, WebSocketConfig, SyncState } from '@/types/websocket';
import { Device, Tab, Password, HistoryItem } from '@/types';

export class WebSocketService {
  private socket: Socket | null = null;
  private config: WebSocketConfig;
  private deviceId: string;
  private isInitialized = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  constructor(deviceId: string, config?: Partial<WebSocketConfig>) {
    this.deviceId = deviceId;
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      syncBatchSize: 50,
      conflictResolutionStrategy: 'timestamp_wins',
      ...config
    };
  }

  async connect(serverUrl: string = 'http://localhost:3002'): Promise<boolean> {
    try {
      if (this.socket?.connected) {
        return true;
      }

      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        query: {
          deviceId: this.deviceId,
          userAgent: navigator.userAgent,
          platform: navigator.platform
        }
      });

      return new Promise((resolve, reject) => {
        if (!this.socket) {
          reject(new Error('Failed to create socket'));
          return;
        }

        this.socket.on('connect', () => {
          console.log('WebSocket connected:', this.socket?.id);
          this.isInitialized = true;
          this.startHeartbeat();
          this.processMessageQueue();
          this.emit('connection_established', { deviceId: this.deviceId });
          resolve(true);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('WebSocket disconnected:', reason);
          this.emit('connection_lost', { reason });
          this.handleReconnection();
        });

        this.socket.on('error', (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', { error: error.message });
          reject(error);
        });

        this.socket.on('message', (message: WebSocketMessage) => {
          this.handleIncomingMessage(message);
        });

        this.socket.on('sync_request', (data) => {
          this.emit('sync_request', data);
        });

        this.socket.on('device_connected', (device: DeviceConnection) => {
          this.emit('device_connected', device);
        });

        this.socket.on('device_disconnected', (deviceId: string) => {
          this.emit('device_disconnected', { deviceId });
        });

        this.socket.on('conflict_detected', (conflict: SyncConflict) => {
          this.emit('conflict_detected', conflict);
        });

        setTimeout(() => {
          if (!this.socket?.connected) {
            reject(new Error('Connection timeout'));
          }
        }, 10000);
      });
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      return false;
    }
  }

  disconnect(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.isInitialized = false;
    this.messageQueue = [];
  }

  sendMessage(type: WebSocketMessageType, data: any, targetDevices?: string[]): boolean {
    const message: WebSocketMessage = {
      id: uuidv4(),
      type,
      deviceId: this.deviceId,
      timestamp: new Date(),
      data,
      targetDevices
    };

    if (!this.socket?.connected) {
      // Queue message for when connection is restored
      this.messageQueue.push(message);
      console.log('Message queued:', type);
      return false;
    }

    try {
      this.socket.emit('message', message);
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      this.messageQueue.push(message);
      return false;
    }
  }

  // High-level sync methods
  syncTab(action: 'open' | 'close' | 'update', tab: Tab): void {
    const messageType: WebSocketMessageType = action === 'open' ? 'tab_opened' 
      : action === 'close' ? 'tab_closed' 
      : 'tab_updated';
    
    this.sendMessage(messageType, { tab });
  }

  syncPassword(action: 'add' | 'update' | 'delete', password: Partial<Password>): void {
    const messageType: WebSocketMessageType = action === 'add' ? 'password_added'
      : action === 'update' ? 'password_updated'
      : 'password_deleted';
    
    this.sendMessage(messageType, { password });
  }

  syncHistory(action: 'add' | 'clear', historyItem?: HistoryItem, deviceId?: string): void {
    if (action === 'add' && historyItem) {
      this.sendMessage('history_added', { historyItem });
    } else if (action === 'clear') {
      this.sendMessage('history_cleared', { deviceId });
    }
  }

  sendTabToDevice(tab: Tab, targetDeviceId: string): void {
    this.sendMessage('tab_send_to_device', { tab }, [targetDeviceId]);
  }

  requestFullSync(): void {
    this.sendMessage('sync_request', { 
      timestamp: new Date(),
      types: ['tabs', 'passwords', 'history']
    });
  }

  // Event listener management
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  private handleIncomingMessage(message: WebSocketMessage): void {
    // Prevent processing our own messages
    if (message.deviceId === this.deviceId) {
      return;
    }

    console.log('Received message:', message.type, message.data);
    
    // Emit the specific message type
    this.emit(message.type, {
      ...message.data,
      sourceDeviceId: message.deviceId,
      timestamp: message.timestamp
    });

    // Also emit a general message event
    this.emit('message', message);
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.sendMessage('ping', { timestamp: new Date() });
      }
    }, this.config.heartbeatInterval);
  }

  private handleReconnection(): void {
    if (this.reconnectTimeout) {
      return; // Already attempting to reconnect
    }

    let attempts = 0;
    const reconnect = () => {
      if (attempts >= this.config.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.emit('reconnection_failed', { attempts });
        return;
      }

      attempts++;
      console.log(`Reconnection attempt ${attempts}/${this.config.maxReconnectAttempts}`);
      
      this.reconnectTimeout = setTimeout(() => {
        if (this.socket && !this.socket.connected) {
          this.socket.connect();
          this.reconnectTimeout = null;
          
          // If still not connected, try again
          setTimeout(() => {
            if (!this.socket?.connected) {
              reconnect();
            }
          }, 2000);
        }
      }, this.config.reconnectInterval);
    };

    reconnect();
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.socket?.connected) {
      const message = this.messageQueue.shift();
      if (message) {
        try {
          this.socket.emit('message', message);
        } catch (error) {
          console.error('Failed to send queued message:', error);
          // Put it back at the front of the queue
          this.messageQueue.unshift(message);
          break;
        }
      }
    }
  }

  // Getters
  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  get queueSize(): number {
    return this.messageQueue.length;
  }

  get connectionId(): string | undefined {
    return this.socket?.id;
  }
}

// Singleton instance
let webSocketService: WebSocketService | null = null;

export const getWebSocketService = (deviceId?: string): WebSocketService => {
  if (!webSocketService && deviceId) {
    webSocketService = new WebSocketService(deviceId);
  }
  
  if (!webSocketService) {
    throw new Error('WebSocket service not initialized. Provide a deviceId on first call.');
  }
  
  return webSocketService;
};

export const initializeWebSocket = async (deviceId: string, serverUrl?: string): Promise<boolean> => {
  const service = getWebSocketService(deviceId);
  return await service.connect(serverUrl);
};
