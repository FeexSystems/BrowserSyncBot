import React from 'react';
import { ExternalLink, Smartphone, Monitor } from 'lucide-react';

const getDeviceIcon = (device: string) => {
  if (device.includes('phone')) return Smartphone;
  return Monitor;
};

export const TabList = ({ tabs }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold mb-4">Active Tabs</h2>
    {tabs.map((tab) => {
      const DeviceIcon = getDeviceIcon(tab.device);
      
      return (
        <div key={tab.id} className="bg-black/30 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-2xl">{tab.favicon}</span>
              <div>
                <h3 className="font-medium truncate">{tab.title}</h3>
                <p className="text-sm text-gray-400 truncate">{tab.url}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <DeviceIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">{tab.device}</span>
              </div>
              <span className="text-sm text-gray-400">{tab.browser}</span>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);
