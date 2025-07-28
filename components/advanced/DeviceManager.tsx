import React, { useState } from 'react';
import { Plus, Settings, Smartphone, Monitor, Tablet, Wifi, WifiOff, MoreVertical, Trash2, Edit } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Device } from '@/types';

export const DeviceManager: React.FC = () => {
  const { 
    devices, 
    currentDevice, 
    addDevice, 
    updateDevice, 
    removeDevice, 
    setCurrentDevice 
  } = useAppStore();
  
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [showDeviceMenu, setShowDeviceMenu] = useState<string | null>(null);
  
  const [newDevice, setNewDevice] = useState({
    name: '',
    type: 'desktop' as 'mobile' | 'desktop' | 'tablet',
    browser: 'Chrome',
    platform: '',
    version: ''
  });

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="w-5 h-5" />;
      case 'tablet': return <Tablet className="w-5 h-5" />;
      default: return <Monitor className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'syncing': return 'bg-blue-500 animate-pulse';
      default: return 'bg-gray-400';
    }
  };

  const handleAddDevice = () => {
    if (newDevice.name.trim()) {
      addDevice({
        ...newDevice,
        lastSync: 'Never',
        status: 'offline'
      });
      setNewDevice({
        name: '',
        type: 'desktop',
        browser: 'Chrome',
        platform: '',
        version: ''
      });
      setShowAddDevice(false);
    }
  };

  const handleEditDevice = (device: Device) => {
    setEditingDevice(device);
    setShowDeviceMenu(null);
  };

  const handleUpdateDevice = () => {
    if (editingDevice) {
      updateDevice(editingDevice.id, {
        name: editingDevice.name,
        browser: editingDevice.browser,
        platform: editingDevice.platform,
        version: editingDevice.version
      });
      setEditingDevice(null);
    }
  };

  const handleRemoveDevice = (deviceId: string) => {
    removeDevice(deviceId);
    setShowDeviceMenu(null);
  };

  const handleSetAsCurrent = (device: Device) => {
    setCurrentDevice(device);
    updateDevice(device.id, { status: 'online', lastSync: 'Now' });
    setShowDeviceMenu(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Connected Devices</h2>
        <button
          onClick={() => setShowAddDevice(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Device
        </button>
      </div>

      {/* Current Device */}
      {currentDevice && (
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
              {getDeviceIcon(currentDevice.type)}
            </div>
            <div>
              <h3 className="font-medium text-blue-400">Current Device</h3>
              <p className="text-sm text-gray-300">{currentDevice.name}</p>
            </div>
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <p>{currentDevice.browser} • {currentDevice.platform || currentDevice.type}</p>
            <p>Last sync: {currentDevice.lastSync}</p>
          </div>
        </div>
      )}

      {/* Device Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map((device) => (
          <div
            key={device.id}
            className={`bg-black/30 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all relative ${
              currentDevice?.id === device.id ? 'ring-2 ring-blue-500/50' : ''
            }`}
          >
            {/* Device Menu */}
            <button
              onClick={() => setShowDeviceMenu(showDeviceMenu === device.id ? null : device.id)}
              className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showDeviceMenu === device.id && (
              <div className="absolute top-8 right-2 bg-gray-900 border border-white/20 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
                <button
                  onClick={() => handleSetAsCurrent(device)}
                  className="w-full text-left px-3 py-2 hover:bg-white/10 text-sm flex items-center gap-2"
                >
                  <Wifi className="w-3 h-3" />
                  Set as Current
                </button>
                <button
                  onClick={() => handleEditDevice(device)}
                  className="w-full text-left px-3 py-2 hover:bg-white/10 text-sm flex items-center gap-2"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => handleRemoveDevice(device.id)}
                  className="w-full text-left px-3 py-2 hover:bg-red-500/20 text-sm text-red-400 flex items-center gap-2"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
                  device.status === 'online' ? 'bg-gradient-to-r from-green-500 to-blue-600' : 'bg-gray-600'
                }`}>
                  {getDeviceIcon(device.type)}
                </div>
                <div>
                  <h3 className="font-medium">{device.name}</h3>
                  <p className="text-sm text-gray-400">{device.browser}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {device.status === 'online' ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-gray-400" />
                )}
                <div className={`w-3 h-3 rounded-full ${getStatusColor(device.status)}`} />
              </div>
            </div>

            <div className="text-xs text-gray-400 space-y-1">
              <p className="capitalize">{device.type} • {device.platform || 'Unknown OS'}</p>
              <p>Last sync: {device.lastSync}</p>
              <p className="capitalize">Status: {device.status}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Device Modal */}
      {showAddDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/10 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Device</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Device Name</label>
                <input
                  type="text"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                  placeholder="My Device"
                  className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Device Type</label>
                <select
                  value={newDevice.type}
                  onChange={(e) => setNewDevice({ ...newDevice, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="desktop">Desktop</option>
                  <option value="mobile">Mobile</option>
                  <option value="tablet">Tablet</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Browser</label>
                <select
                  value={newDevice.browser}
                  onChange={(e) => setNewDevice({ ...newDevice, browser: e.target.value })}
                  className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Chrome">Chrome</option>
                  <option value="Firefox">Firefox</option>
                  <option value="Safari">Safari</option>
                  <option value="Edge">Edge</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Platform (Optional)</label>
                <input
                  type="text"
                  value={newDevice.platform}
                  onChange={(e) => setNewDevice({ ...newDevice, platform: e.target.value })}
                  placeholder="Windows, macOS, Linux, iOS, Android"
                  className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleAddDevice}
                disabled={!newDevice.name.trim()}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                Add Device
              </button>
              <button
                onClick={() => setShowAddDevice(false)}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Device Modal */}
      {editingDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/10 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Device</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Device Name</label>
                <input
                  type="text"
                  value={editingDevice.name}
                  onChange={(e) => setEditingDevice({ ...editingDevice, name: e.target.value })}
                  className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Browser</label>
                <select
                  value={editingDevice.browser}
                  onChange={(e) => setEditingDevice({ ...editingDevice, browser: e.target.value })}
                  className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Chrome">Chrome</option>
                  <option value="Firefox">Firefox</option>
                  <option value="Safari">Safari</option>
                  <option value="Edge">Edge</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Platform</label>
                <input
                  type="text"
                  value={editingDevice.platform || ''}
                  onChange={(e) => setEditingDevice({ ...editingDevice, platform: e.target.value })}
                  placeholder="Windows, macOS, Linux, iOS, Android"
                  className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleUpdateDevice}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingDevice(null)}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
