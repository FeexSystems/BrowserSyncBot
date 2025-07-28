import React from 'react';
import { Smartphone, Monitor, Tablet, Chrome, Globe } from 'lucide-react';

const getDeviceIcon = (type: string) => {
  switch (type) {
    case 'mobile': return Smartphone;
    case 'desktop': return Monitor;
    case 'tablet': return Tablet;
    default: return Monitor;
  }
};

const getBrowserIcon = (browser: string) => {
  switch (browser.toLowerCase()) {
    case 'chrome': return Chrome;
    case 'safari': return Globe;
    default: return Globe;
  }
};

export const DeviceCard = ({ device }) => {
  const DeviceIcon = getDeviceIcon(device.type);
  const BrowserIcon = getBrowserIcon(device.browser);
  
  return (
    <div className="bg-black/30 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
            <DeviceIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium">{device.name}</h3>
            <p className="text-sm text-gray-400">{device.browser}</p>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${device.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Last sync: {device.lastSync}</span>
        <BrowserIcon className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
};
