import { v4 as uuidv4 } from 'uuid';
import { WebSocketMessage, WebSocketMessageType } from '@/types/websocket';
import { Tab, Password, HistoryItem } from '@/types';

export class SimpleWebSocketService {
  private ws: WebSocket | null = null;
  private deviceId: string;
  private isConnected = false;
  private messageQueue: WebSocketMessage[] = [];
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;

  constructor(deviceId: string) {
    this.deviceId = deviceId;
  }

  async connect(serverUrl: string = 'ws://localhost:3002'): Promise<boolean> {
    try {
      if (this.ws?.readyState === WebSocket.OPEN) {
        return true;
      }

      this.ws = new WebSocket(serverUrl);

      return new Promise((resolve, reject) => {
        if (!this.ws) {
          reject(new Error('Failed to create WebSocket'));
          return;
        }

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.processMessageQueue();
          this.emit('connection_established', { deviceId: this.deviceId });
          resolve(true);
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnected = false;
          this.emit('connection_lost', { code: event.code, reason: event.reason });
          this.handleReconnection();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', { error: 'Connection error' });
          reject(error);
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleIncomingMessage(message);
          } catch (error) {
            console.error('Failed to parse message:', error);
          }
        };

        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
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
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
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

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.messageQueue.push(message);
      console.log('Message queued:', type);
      return false;
    }

    try {
      this.ws.send(JSON.stringify(message));
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
    if (message.deviceId === this.deviceId) {
      return;
    }

    console.log('Received message:', message.type, message.data);
    
    this.emit(message.type, {
      ...message.data,
      sourceDeviceId: message.deviceId,
      timestamp: message.timestamp
    });

    this.emit('message', message);
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('reconnection_failed', { attempts: this.reconnectAttempts });
      return;
    }

    this.reconnectAttempts++;
    console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    
    setTimeout(() => {
      if (!this.isConnected) {
        this.connect();
      }
    }, this.reconnectInterval);
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift();
      if (message) {
        try {
          this.ws.send(JSON.stringify(message));
        } catch (error) {
          console.error('Failed to send queued message:', error);
          this.messageQueue.unshift(message);
          break;
        }
      }
    }
  }

  get connected(): boolean {
    return this.isConnected;
  }

  get queueSize(): number {
    return this.messageQueue.length;
  }
}

// Mock server for development (will be replaced with real server)
let mockService: SimpleWebSocketService | null = null;

export const getMockWebSocketService = (deviceId?: string): SimpleWebSocketService => {
  if (!mockService && deviceId) {
    mockService = new SimpleWebSocketService(deviceId);
  }
  
  if (!mockService) {
    throw new Error('Mock WebSocket service not initialized. Provide a deviceId on first call.');
  }
  
  return mockService;
};

export const initializeMockWebSocket = async (deviceId: string): Promise<boolean> => {
  console.log('Mock WebSocket initialized for development');
  // For now, just return true to simulate connection
  // In production, this would connect to a real WebSocket server
  return true;
};
