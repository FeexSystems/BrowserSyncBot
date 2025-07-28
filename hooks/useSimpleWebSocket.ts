import { useEffect, useRef, useState, useCallback } from 'react';
import { getMockWebSocketService, initializeMockWebSocket } from '@/services/simpleWebSocketService';
import { useAppStore } from '@/store/useAppStore';
import { Tab, Password, HistoryItem } from '@/types';

export interface UseSimpleWebSocketOptions {
  autoConnect?: boolean;
  onConnectionChange?: (connected: boolean) => void;
  onError?: (error: string) => void;
}

export const useSimpleWebSocket = (options: UseSimpleWebSocketOptions = {}) => {
  const {
    autoConnect = true,
    onConnectionChange,
    onError
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [connectedDevices, setConnectedDevices] = useState<string[]>([]);
  const [latency, setLatency] = useState<number>(50); // Mock latency

  const serviceRef = useRef<ReturnType<typeof getMockWebSocketService> | null>(null);

  const {
    currentDevice,
    addTab,
    updateTab,
    removeTab,
    setSyncStatus,
    addSyncEvent,
    markSynced
  } = useAppStore();

  // Initialize WebSocket connection
  const connect = useCallback(async () => {
    if (!currentDevice || !currentDevice.id) {
      console.warn('No current device set, cannot connect WebSocket');
      onError?.('No device available for connection');
      return false;
    }

    try {
      setIsReconnecting(true);
      const success = await initializeMockWebSocket(currentDevice.id);
      
      if (success) {
        serviceRef.current = getMockWebSocketService(currentDevice.id);
        setIsConnected(true);
        setSyncStatus('online');
        onConnectionChange?.(true);
        
        // Mock some connected devices for demo
        setConnectedDevices(['device-1', 'device-2']);
        
        addSyncEvent({
          type: 'device_connected',
          deviceId: currentDevice?.id || '',
          timestamp: new Date(),
          data: { status: 'connected' }
        });
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
  }, [currentDevice, onConnectionChange, onError, setSyncStatus, addSyncEvent]);

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
      console.log(`Tab "${tab.title}" sent to device ${targetDeviceId}`);
    }
  }, []);

  // Sync operations
  const syncTab = useCallback((action: 'open' | 'close' | 'update', tab: Tab) => {
    if (serviceRef.current) {
      serviceRef.current.syncTab(action, tab);
      console.log(`Tab ${action}:`, tab.title);
    }
  }, []);

  const syncPassword = useCallback((action: 'add' | 'update' | 'delete', password: Partial<Password>) => {
    if (serviceRef.current) {
      serviceRef.current.syncPassword(action, password);
      console.log(`Password ${action}:`, password.site);
    }
  }, []);

  const syncHistory = useCallback((action: 'add' | 'clear', historyItem?: HistoryItem, deviceId?: string) => {
    if (serviceRef.current) {
      serviceRef.current.syncHistory(action, historyItem, deviceId);
      console.log(`History ${action}`);
    }
  }, []);

  const requestFullSync = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.requestFullSync();
      setLastSyncTime(new Date());
      markSynced();
      console.log('Full sync requested');
    }
  }, [markSynced]);

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
  }, [autoConnect, currentDevice?.id, isConnected]); // Only depend on stable values

  return {
    // Connection state
    isConnected,
    isReconnecting,
    lastSyncTime,
    connectedDevices,
    latency,
    
    // Conflicts (empty for mock)
    conflicts: [],
    resolveConflict: () => {},
    
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

export default useSimpleWebSocket;
