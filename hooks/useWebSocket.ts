import { useEffect, useRef, useState, useCallback } from 'react';
import { getWebSocketService, initializeWebSocket } from '@/services/websocketService';
import { useAppStore } from '@/store/useAppStore';
import { Tab, Password, HistoryItem, Device } from '@/types';
import { WebSocketMessage, SyncConflict } from '@/types/websocket';

export interface UseWebSocketOptions {
  autoConnect?: boolean;
  serverUrl?: string;
  onConnectionChange?: (connected: boolean) => void;
  onError?: (error: string) => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    autoConnect = true,
    serverUrl = 'http://localhost:3002',
    onConnectionChange,
    onError
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<string[]>([]);
  const [latency, setLatency] = useState<number>(0);

  const serviceRef = useRef<ReturnType<typeof getWebSocketService> | null>(null);
  const pingTimeRef = useRef<number>(0);

  const {
    currentDevice,
    addTab,
    updateTab,
    removeTab,
    addPassword,
    updatePassword,
    removePassword,
    addHistoryItem,
    addDevice,
    updateDevice,
    setSyncStatus,
    addSyncEvent,
    markSynced
  } = useAppStore();

  // Initialize WebSocket connection
  const connect = useCallback(async () => {
    if (!currentDevice) {
      console.warn('No current device set, cannot connect WebSocket');
      return false;
    }

    try {
      setIsReconnecting(true);
      const success = await initializeWebSocket(currentDevice.id, serverUrl);
      
      if (success) {
        serviceRef.current = getWebSocketService();
        setupEventListeners();
        setIsConnected(true);
        setSyncStatus('online');
        onConnectionChange?.(true);
      } else {
        setIsConnected(false);
        setSyncStatus('error');
        onConnectionChange?.(false);
      }
      
      setIsReconnecting(false);
      return success;
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setIsConnected(false);
      setIsReconnecting(false);
      setSyncStatus('error');
      onConnectionChange?.(false);
      onError?.(error instanceof Error ? error.message : 'Connection failed');
      return false;
    }
  }, [currentDevice, serverUrl, onConnectionChange, onError, setSyncStatus]);

  // Setup event listeners for incoming WebSocket events
  const setupEventListeners = useCallback(() => {
    const service = serviceRef.current;
    if (!service) return;

    // Connection events
    service.on('connection_established', () => {
      setIsConnected(true);
      setSyncStatus('online');
      addSyncEvent({
        type: 'device_connected',
        deviceId: currentDevice?.id || '',
        timestamp: new Date(),
        data: { status: 'connected' }
      });
    });

    service.on('connection_lost', () => {
      setIsConnected(false);
      setSyncStatus('offline');
    });

    service.on('error', ({ error }) => {
      onError?.(error);
      setSyncStatus('error');
    });

    // Device events
    service.on('device_connected', (device) => {
      setConnectedDevices(prev => [...prev, device.deviceId]);
      addSyncEvent({
        type: 'device_connected',
        deviceId: device.deviceId,
        timestamp: new Date(),
        data: device
      });
    });

    service.on('device_disconnected', ({ deviceId }) => {
      setConnectedDevices(prev => prev.filter(id => id !== deviceId));
      addSyncEvent({
        type: 'device_disconnected',
        deviceId,
        timestamp: new Date(),
        data: null
      });
    });

    // Tab sync events
    service.on('tab_opened', ({ tab, sourceDeviceId }) => {
      addTab({
        ...tab,
        deviceId: sourceDeviceId,
        lastAccessed: new Date(tab.lastAccessed)
      });
    });

    service.on('tab_closed', ({ tab }) => {
      removeTab(tab.id);
    });

    service.on('tab_updated', ({ tab, sourceDeviceId }) => {
      updateTab(tab.id, {
        ...tab,
        deviceId: sourceDeviceId,
        lastAccessed: new Date(tab.lastAccessed)
      });
    });

    service.on('tab_send_to_device', ({ tab }) => {
      if (tab && currentDevice) {
        addTab({
          ...tab,
          id: undefined, // Generate new ID
          deviceId: currentDevice.id,
          lastAccessed: new Date()
        });
        
        // Show notification
        addSyncEvent({
          type: 'tab_opened',
          deviceId: currentDevice.id,
          timestamp: new Date(),
          data: { tab, action: 'received' }
        });
      }
    });

    // Password sync events
    service.on('password_added', ({ password }) => {
      addPassword({
        ...password,
        lastUpdated: new Date(password.lastUpdated)
      });
    });

    service.on('password_updated', ({ password }) => {
      updatePassword(password.id, {
        ...password,
        lastUpdated: new Date(password.lastUpdated)
      });
    });

    service.on('password_deleted', ({ password }) => {
      removePassword(password.id);
    });

    // History sync events
    service.on('history_added', ({ historyItem }) => {
      addHistoryItem({
        ...historyItem,
        visitTime: new Date(historyItem.visitTime)
      });
    });

    // Sync events
    service.on('sync_request', () => {
      // Handle incoming sync request
      requestFullSync();
    });

    service.on('sync_complete', () => {
      setLastSyncTime(new Date());
      markSynced();
    });

    // Conflict detection
    service.on('conflict_detected', (conflict: SyncConflict) => {
      setConflicts(prev => [...prev, conflict]);
    });

    // Latency measurement
    service.on('ping', () => {
      service.sendMessage('pong', { timestamp: new Date() });
    });

    service.on('pong', ({ timestamp }) => {
      const latency = Date.now() - new Date(timestamp).getTime();
      setLatency(latency);
    });

  }, [currentDevice, addTab, updateTab, removeTab, addPassword, updatePassword, removePassword, addHistoryItem, setSyncStatus, addSyncEvent, markSynced, onError]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.disconnect();
      serviceRef.current = null;
    }
    setIsConnected(false);
    setSyncStatus('offline');
    onConnectionChange?.(false);
  }, [setSyncStatus, onConnectionChange]);

  // Send tab to another device
  const sendTabToDevice = useCallback((tab: Tab, targetDeviceId: string) => {
    if (serviceRef.current) {
      serviceRef.current.sendTabToDevice(tab, targetDeviceId);
    }
  }, []);

  // Sync operations
  const syncTab = useCallback((action: 'open' | 'close' | 'update', tab: Tab) => {
    if (serviceRef.current) {
      serviceRef.current.syncTab(action, tab);
    }
  }, []);

  const syncPassword = useCallback((action: 'add' | 'update' | 'delete', password: Partial<Password>) => {
    if (serviceRef.current) {
      serviceRef.current.syncPassword(action, password);
    }
  }, []);

  const syncHistory = useCallback((action: 'add' | 'clear', historyItem?: HistoryItem, deviceId?: string) => {
    if (serviceRef.current) {
      serviceRef.current.syncHistory(action, historyItem, deviceId);
    }
  }, []);

  const requestFullSync = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.requestFullSync();
    }
  }, []);

  // Resolve conflict
  const resolveConflict = useCallback((conflictId: string, resolution: 'local' | 'remote') => {
    setConflicts(prev => prev.filter(c => c.id !== conflictId));
    // TODO: Apply resolution logic
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && currentDevice && !isConnected) {
      connect();
    }

    return () => {
      if (serviceRef.current) {
        disconnect();
      }
    };
  }, [autoConnect, currentDevice, connect, disconnect, isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (serviceRef.current) {
        serviceRef.current.disconnect();
      }
    };
  }, []);

  return {
    // Connection state
    isConnected,
    isReconnecting,
    lastSyncTime,
    connectedDevices,
    latency,
    
    // Conflicts
    conflicts,
    resolveConflict,
    
    // Connection control
    connect,
    disconnect,
    
    // Sync operations
    syncTab,
    syncPassword,
    syncHistory,
    sendTabToDevice,
    requestFullSync,
    
    // Service reference
    service: serviceRef.current
  };
};

export default useWebSocket;
