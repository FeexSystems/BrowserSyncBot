export interface Device {
  id: string;
  name: string;
  type: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  lastSync: string;
  status: 'online' | 'offline' | 'syncing';
  platform?: string;
  version?: string;
}

export interface Tab {
  id: string;
  title: string;
  url: string;
  deviceId: string;
  browser: string;
  favicon?: string;
  lastAccessed: Date;
  isPinned?: boolean;
  groupId?: string;
}

export interface TabGroup {
  id: string;
  name: string;
  color: string;
  deviceId: string;
  tabIds: string[];
}

export interface Password {
  id: string;
  site: string;
  url: string;
  username: string;
  encryptedPassword: string;
  strength: 'weak' | 'medium' | 'strong';
  lastUpdated: Date;
  lastUsed?: Date;
  category?: string;
  notes?: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  url: string;
  deviceId: string;
  visitTime: Date;
  visitCount: number;
  favicon?: string;
  category?: string;
}

export interface SyncEvent {
  id: string;
  type: 'tab_opened' | 'tab_closed' | 'tab_updated' | 'password_added' | 'password_updated' | 'device_connected' | 'device_disconnected';
  deviceId: string;
  timestamp: Date;
  data: any;
}

export interface AppState {
  // Device management
  currentDevice: Device | null;
  devices: Device[];
  
  // Tab management
  tabs: Tab[];
  tabGroups: TabGroup[];
  activeTabFilters: string[];
  
  // Password management
  passwords: Password[];
  showPasswords: boolean;
  passwordFilters: string[];
  
  // History management
  history: HistoryItem[];
  historyFilters: string[];
  
  // UI state
  activeMainTab: 'sync' | 'passwords' | 'history';
  isConnected: boolean;
  syncStatus: 'online' | 'offline' | 'syncing' | 'error';
  lastSyncTime: Date | null;
  
  // Real-time events
  recentEvents: SyncEvent[];
}
