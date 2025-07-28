import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { AppState, Device, Tab, Password, HistoryItem, SyncEvent, TabGroup } from '../types';

interface AppActions {
  // Device actions
  setCurrentDevice: (device: Device) => void;
  addDevice: (device: Omit<Device, 'id'>) => void;
  updateDevice: (id: string, updates: Partial<Device>) => void;
  removeDevice: (id: string) => void;
  
  // Tab actions
  addTab: (tab: Omit<Tab, 'id'>) => void;
  updateTab: (id: string, updates: Partial<Tab>) => void;
  removeTab: (id: string) => void;
  sendTabToDevice: (tabId: string, deviceId: string) => void;
  createTabGroup: (name: string, color: string, deviceId: string) => void;
  addTabToGroup: (tabId: string, groupId: string) => void;
  removeTabFromGroup: (tabId: string, groupId: string) => void;
  
  // Password actions
  addPassword: (password: Omit<Password, 'id'>) => void;
  updatePassword: (id: string, updates: Partial<Password>) => void;
  removePassword: (id: string) => void;
  togglePasswordVisibility: () => void;
  
  // History actions
  addHistoryItem: (item: Omit<HistoryItem, 'id'>) => void;
  removeHistoryItem: (id: string) => void;
  clearHistory: (deviceId?: string) => void;
  
  // UI actions
  setActiveMainTab: (tab: 'sync' | 'passwords' | 'history') => void;
  setSyncStatus: (status: 'online' | 'offline' | 'syncing' | 'error') => void;
  setConnected: (connected: boolean) => void;
  
  // Sync actions
  addSyncEvent: (event: Omit<SyncEvent, 'id'>) => void;
  markSynced: () => void;
  
  // Search and filter actions
  setTabFilters: (filters: string[]) => void;
  setPasswordFilters: (filters: string[]) => void;
  setHistoryFilters: (filters: string[]) => void;
}

type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentDevice: null,
    devices: [],
    tabs: [],
    tabGroups: [],
    activeTabFilters: [],
    passwords: [],
    showPasswords: false,
    passwordFilters: [],
    history: [],
    historyFilters: [],
    activeMainTab: 'sync',
    isConnected: false,
    syncStatus: 'offline',
    lastSyncTime: null,
    recentEvents: [],

    // Device actions
    setCurrentDevice: (device) => set({ currentDevice: device }),
    
    addDevice: (deviceData) => {
      const device: Device = { ...deviceData, id: uuidv4() };
      set((state) => ({ 
        devices: [...state.devices, device],
        recentEvents: [...state.recentEvents, {
          id: uuidv4(),
          type: 'device_connected',
          deviceId: device.id,
          timestamp: new Date(),
          data: device
        }].slice(-50) // Keep only last 50 events
      }));
    },
    
    updateDevice: (id, updates) => set((state) => ({
      devices: state.devices.map(device => 
        device.id === id ? { ...device, ...updates } : device
      ),
      currentDevice: state.currentDevice?.id === id 
        ? { ...state.currentDevice, ...updates } 
        : state.currentDevice
    })),
    
    removeDevice: (id) => set((state) => ({
      devices: state.devices.filter(device => device.id !== id),
      tabs: state.tabs.filter(tab => tab.deviceId !== id),
      history: state.history.filter(item => item.deviceId !== id),
      currentDevice: state.currentDevice?.id === id ? null : state.currentDevice,
      recentEvents: [...state.recentEvents, {
        id: uuidv4(),
        type: 'device_disconnected',
        deviceId: id,
        timestamp: new Date(),
        data: null
      }].slice(-50)
    })),

    // Tab actions
    addTab: (tabData) => {
      const tab: Tab = { ...tabData, id: uuidv4(), lastAccessed: new Date() };
      set((state) => ({ 
        tabs: [...state.tabs, tab],
        recentEvents: [...state.recentEvents, {
          id: uuidv4(),
          type: 'tab_opened',
          deviceId: tab.deviceId,
          timestamp: new Date(),
          data: tab
        }].slice(-50)
      }));
    },
    
    updateTab: (id, updates) => set((state) => ({
      tabs: state.tabs.map(tab => 
        tab.id === id ? { ...tab, ...updates } : tab
      ),
      recentEvents: [...state.recentEvents, {
        id: uuidv4(),
        type: 'tab_updated',
        deviceId: state.tabs.find(t => t.id === id)?.deviceId || '',
        timestamp: new Date(),
        data: { id, updates }
      }].slice(-50)
    })),
    
    removeTab: (id) => {
      const tab = get().tabs.find(t => t.id === id);
      set((state) => ({
        tabs: state.tabs.filter(tab => tab.id !== id),
        tabGroups: state.tabGroups.map(group => ({
          ...group,
          tabIds: group.tabIds.filter(tabId => tabId !== id)
        })),
        recentEvents: tab ? [...state.recentEvents, {
          id: uuidv4(),
          type: 'tab_closed',
          deviceId: tab.deviceId,
          timestamp: new Date(),
          data: tab
        }].slice(-50) : state.recentEvents
      }));
    },
    
    sendTabToDevice: (tabId, deviceId) => {
      const tab = get().tabs.find(t => t.id === tabId);
      if (tab) {
        const newTab: Tab = { ...tab, id: uuidv4(), deviceId, lastAccessed: new Date() };
        set((state) => ({ tabs: [...state.tabs, newTab] }));
      }
    },
    
    createTabGroup: (name, color, deviceId) => {
      const group: TabGroup = {
        id: uuidv4(),
        name,
        color,
        deviceId,
        tabIds: []
      };
      set((state) => ({ tabGroups: [...state.tabGroups, group] }));
    },
    
    addTabToGroup: (tabId, groupId) => set((state) => ({
      tabGroups: state.tabGroups.map(group =>
        group.id === groupId 
          ? { ...group, tabIds: [...group.tabIds, tabId] }
          : group
      )
    })),
    
    removeTabFromGroup: (tabId, groupId) => set((state) => ({
      tabGroups: state.tabGroups.map(group =>
        group.id === groupId 
          ? { ...group, tabIds: group.tabIds.filter(id => id !== tabId) }
          : group
      )
    })),

    // Password actions
    addPassword: (passwordData) => {
      const password: Password = { 
        ...passwordData, 
        id: uuidv4(),
        lastUpdated: new Date()
      };
      set((state) => ({ 
        passwords: [...state.passwords, password],
        recentEvents: [...state.recentEvents, {
          id: uuidv4(),
          type: 'password_added',
          deviceId: state.currentDevice?.id || '',
          timestamp: new Date(),
          data: { site: password.site }
        }].slice(-50)
      }));
    },
    
    updatePassword: (id, updates) => set((state) => ({
      passwords: state.passwords.map(password => 
        password.id === id 
          ? { ...password, ...updates, lastUpdated: new Date() } 
          : password
      ),
      recentEvents: [...state.recentEvents, {
        id: uuidv4(),
        type: 'password_updated',
        deviceId: state.currentDevice?.id || '',
        timestamp: new Date(),
        data: { id, updates }
      }].slice(-50)
    })),
    
    removePassword: (id) => set((state) => ({
      passwords: state.passwords.filter(password => password.id !== id)
    })),
    
    togglePasswordVisibility: () => set((state) => ({
      showPasswords: !state.showPasswords
    })),

    // History actions
    addHistoryItem: (itemData) => {
      const item: HistoryItem = { 
        ...itemData, 
        id: uuidv4(),
        visitTime: new Date()
      };
      set((state) => ({ history: [...state.history, item] }));
    },
    
    removeHistoryItem: (id) => set((state) => ({
      history: state.history.filter(item => item.id !== id)
    })),
    
    clearHistory: (deviceId) => set((state) => ({
      history: deviceId 
        ? state.history.filter(item => item.deviceId !== deviceId)
        : []
    })),

    // UI actions
    setActiveMainTab: (tab) => set({ activeMainTab: tab }),
    setSyncStatus: (status) => set({ syncStatus: status }),
    setConnected: (connected) => set({ isConnected: connected }),

    // Sync actions
    addSyncEvent: (eventData) => {
      const event: SyncEvent = { ...eventData, id: uuidv4() };
      set((state) => ({ 
        recentEvents: [...state.recentEvents, event].slice(-50)
      }));
    },
    
    markSynced: () => set({ lastSyncTime: new Date() }),

    // Filter actions
    setTabFilters: (filters) => set({ activeTabFilters: filters }),
    setPasswordFilters: (filters) => set({ passwordFilters: filters }),
    setHistoryFilters: (filters) => set({ historyFilters: filters }),
  }))
);

// Selectors for computed values
export const useFilteredTabs = () => {
  return useAppStore((state) => {
    const { tabs, activeTabFilters } = state;
    if (activeTabFilters.length === 0) return tabs;
    
    return tabs.filter(tab => 
      activeTabFilters.some(filter => 
        tab.title.toLowerCase().includes(filter.toLowerCase()) ||
        tab.url.toLowerCase().includes(filter.toLowerCase()) ||
        tab.browser.toLowerCase().includes(filter.toLowerCase())
      )
    );
  });
};

export const useFilteredPasswords = () => {
  return useAppStore((state) => {
    const { passwords, passwordFilters } = state;
    if (passwordFilters.length === 0) return passwords;
    
    return passwords.filter(password => 
      passwordFilters.some(filter => 
        password.site.toLowerCase().includes(filter.toLowerCase()) ||
        password.username.toLowerCase().includes(filter.toLowerCase())
      )
    );
  });
};

export const useFilteredHistory = () => {
  return useAppStore((state) => {
    const { history, historyFilters } = state;
    if (historyFilters.length === 0) return history;
    
    return history.filter(item => 
      historyFilters.some(filter => 
        item.title.toLowerCase().includes(filter.toLowerCase()) ||
        item.url.toLowerCase().includes(filter.toLowerCase())
      )
    );
  });
};
