import React, { useState } from 'react';
import { Search, Filter, Send, Star, Folder, Plus, X, Wifi } from 'lucide-react';
import { useAppStore, useFilteredTabs } from '@/store/useAppStore';
import { Tab, Device } from '@/types';
import useWebSocket from '@/hooks/useWebSocket';

interface TabManagerProps {
  devices: Device[];
}

export const TabManager: React.FC<TabManagerProps> = ({ devices }) => {
  const tabs = useFilteredTabs();
  const { 
    sendTabToDevice, 
    removeTab, 
    createTabGroup, 
    setTabFilters,
    activeTabFilters 
  } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTabs, setSelectedTabs] = useState<Set<string>>(new Set());
  const [showSendModal, setShowSendModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupColor, setGroupColor] = useState('#3B82F6');

  const filteredTabs = tabs.filter(tab =>
    tab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tab.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleTabSelection = (tabId: string) => {
    const newSelection = new Set(selectedTabs);
    if (newSelection.has(tabId)) {
      newSelection.delete(tabId);
    } else {
      newSelection.add(tabId);
    }
    setSelectedTabs(newSelection);
  };

  const handleSendToDevice = (deviceId: string) => {
    selectedTabs.forEach(tabId => {
      sendTabToDevice(tabId, deviceId);
    });
    setSelectedTabs(new Set());
    setShowSendModal(false);
  };

  const handleCreateGroup = () => {
    if (groupName.trim()) {
      createTabGroup(groupName, groupColor, devices[0]?.id || '');
      setGroupName('');
      setShowGroupModal(false);
    }
  };

  const getDeviceName = (deviceId: string) => {
    return devices.find(d => d.id === deviceId)?.name || 'Unknown Device';
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search tabs by title or URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowGroupModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <Folder className="w-4 h-4" />
            Group
          </button>
          
          {selectedTabs.size > 0 && (
            <button
              onClick={() => setShowSendModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send ({selectedTabs.size})
            </button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {activeTabFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeTabFilters.map((filter, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-sm flex items-center gap-2"
            >
              {filter}
              <button
                onClick={() => setTabFilters(activeTabFilters.filter((_, i) => i !== index))}
                className="hover:bg-white/10 rounded-full p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Tabs Grid */}
      <div className="grid gap-4">
        {filteredTabs.map((tab) => (
          <div
            key={tab.id}
            className={`p-4 bg-black/30 border border-white/10 rounded-lg hover:border-white/20 transition-all ${
              selectedTabs.has(tab.id) ? 'ring-2 ring-blue-500 bg-blue-500/10' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={selectedTabs.has(tab.id)}
                  onChange={() => toggleTabSelection(tab.id)}
                  className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{tab.favicon || '🌐'}</span>
                    <h3 className="font-medium truncate">{tab.title}</h3>
                    {tab.isPinned && <Star className="w-4 h-4 text-yellow-500" />}
                  </div>
                  
                  <p className="text-sm text-gray-400 truncate mb-2">{tab.url}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{getDeviceName(tab.deviceId)}</span>
                    <span>{tab.browser}</span>
                    <span>Last accessed: {tab.lastAccessed.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => window.open(tab.url, '_blank')}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Open tab"
                >
                  <Send className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => removeTab(tab.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                  title="Remove tab"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredTabs.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No tabs found matching your search criteria</p>
          </div>
        )}
      </div>

      {/* Send to Device Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/10 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Send tabs to device</h3>
            
            <div className="space-y-2 mb-6">
              {devices.map((device) => (
                <button
                  key={device.id}
                  onClick={() => handleSendToDevice(device.id)}
                  className="w-full p-3 text-left bg-black/30 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{device.name}</span>
                    <span className={`w-2 h-2 rounded-full ${
                      device.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <p className="text-sm text-gray-400">{device.browser} • {device.type}</p>
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowSendModal(false)}
              className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/10 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Create Tab Group</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name..."
                  className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex gap-2">
                  {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setGroupColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        groupColor === color ? 'border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim()}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                Create Group
              </button>
              <button
                onClick={() => setShowGroupModal(false)}
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
