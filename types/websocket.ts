export interface WebSocketMessage {
  id: string;
  type: WebSocketMessageType;
  deviceId: string;
  timestamp: Date;
  data: any;
  targetDevices?: string[]; // If specified, only send to these devices
}

export type WebSocketMessageType = 
  // Connection events
  | 'device_connect'
  | 'device_disconnect'
  | 'device_heartbeat'
  
  // Tab events
  | 'tab_opened'
  | 'tab_closed' 
  | 'tab_updated'
  | 'tab_focused'
  | 'tab_send_to_device'
  | 'tab_group_created'
  | 'tab_group_updated'
  
  // Password events
  | 'password_added'
  | 'password_updated'
  | 'password_deleted'
  | 'password_sync_request'
  
  // History events
  | 'history_added'
  | 'history_cleared'
  
  // Sync events
  | 'sync_request'
  | 'sync_response'
  | 'sync_conflict'
  | 'sync_complete'
  
  // System events
  | 'error'
  | 'ping'
  | 'pong';

export interface DeviceConnection {
  deviceId: string;
  socketId: string;
  lastSeen: Date;
  isActive: boolean;
  metadata: {
    userAgent: string;
    platform: string;
    browser: string;
    version: string;
  };
}

export interface SyncConflict {
  id: string;
  type: 'tab' | 'password' | 'history';
  itemId: string;
  localVersion: any;
  remoteVersion: any;
  timestamp: Date;
  deviceId: string;
}

export interface WebSocketConfig {
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  syncBatchSize: number;
  conflictResolutionStrategy: 'local_wins' | 'remote_wins' | 'timestamp_wins' | 'manual';
}

export interface SyncState {
  isConnected: boolean;
  isReconnecting: boolean;
  lastSyncTime: Date | null;
  pendingMessages: WebSocketMessage[];
  conflicts: SyncConflict[];
  connectedDevices: DeviceConnection[];
  reconnectAttempts: number;
  latency: number;
}
