'use client';

import React, { useEffect } from 'react';
import { Header } from '@/components/Header';
import { SidebarTabs } from '@/components/SidebarTabs';
import { DeviceCard } from '@/components/DeviceCard';
import { TabList } from '@/components/TabList';
import { PasswordList } from '@/components/PasswordList';
import { HistoryList } from '@/components/HistoryList';
import { TabManager } from '@/components/advanced/TabManager';
import { SyncStatus } from '@/components/advanced/SyncStatus';
import { DeviceManager } from '@/components/advanced/DeviceManager';
import { useAppStore } from '@/store/useAppStore';

export default function HomePage() {
  const {
    devices,
    activeMainTab,
    syncStatus,
    addDevice,
    addTab,
    addPassword,
    addHistoryItem,
    setActiveMainTab,
    setSyncStatus,
    setCurrentDevice
  } = useAppStore();

  // Initialize with mock data on first load
  useEffect(() => {
    if (devices.length === 0) {
      // Add mock devices
      const mockDevices = [
        { name: 'iPhone 15 Pro', type: 'mobile' as const, browser: 'Safari', lastSync: '2 min ago', status: 'online' as const, platform: 'iOS' },
        { name: 'MacBook Pro', type: 'desktop' as const, browser: 'Chrome', lastSync: '1 min ago', status: 'online' as const, platform: 'macOS' },
        { name: 'Dell Workstation', type: 'desktop' as const, browser: 'Edge', lastSync: '5 min ago', status: 'online' as const, platform: 'Windows' },
        { name: 'iPad Air', type: 'tablet' as const, browser: 'Safari', lastSync: '10 min ago', status: 'offline' as const, platform: 'iPadOS' }
      ];

      mockDevices.forEach(device => {
        addDevice(device);
      });

      // Set the first device as current
      setTimeout(() => {
        const addedDevices = useAppStore.getState().devices;
        if (addedDevices.length > 0) {
          setCurrentDevice(addedDevices[0]);

          // Add mock tabs
          addTab({
            title: 'GitHub - Repository Dashboard',
            url: 'https://github.com/dashboard',
            deviceId: addedDevices[0].id,
            browser: 'Chrome',
            favicon: '🐙',
            lastAccessed: new Date()
          });

          addTab({
            title: 'Netflix - Watch Movies',
            url: 'https://netflix.com/browse',
            deviceId: addedDevices[1]?.id || addedDevices[0].id,
            browser: 'Safari',
            favicon: '🎬',
            lastAccessed: new Date()
          });

          // Add mock password
          addPassword({
            site: 'github.com',
            url: 'https://github.com',
            username: 'john@email.com',
            encryptedPassword: 'encrypted_password_here',
            strength: 'strong',
            lastUpdated: new Date(),
            category: 'Development'
          });

          // Add mock history
          addHistoryItem({
            title: 'React Hooks Guide',
            url: 'https://reactjs.org/hooks',
            deviceId: addedDevices[0].id,
            visitTime: new Date(),
            visitCount: 10,
            favicon: '⚛️'
          });
        }
      }, 100);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Header syncStatus={syncStatus} />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Sync Status */}
        <div className="mb-6">
          <SyncStatus />
        </div>

        <SidebarTabs activeTab={activeMainTab} setActiveTab={setActiveMainTab} />

        {/* Device Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {devices.map(device => <DeviceCard key={device.id} device={device} />)}
        </div>

        {/* Main Content */}
        {activeMainTab === 'sync' && (
          <div className="space-y-8">
            <TabManager devices={devices} />
            <DeviceManager />
          </div>
        )}

        {activeMainTab === 'passwords' && (
          <PasswordList
            passwords={[]}
            showPasswords={false}
            toggleVisibility={() => {}}
          />
        )}

        {activeMainTab === 'history' && <HistoryList history={[]} />}
      </div>
    </div>
  );
}
