import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export const SyncStatus: React.FC = () => {
  const { 
    syncStatus, 
    isConnected, 
    lastSyncTime, 
    recentEvents,
    setSyncStatus,
    setConnected 
  } = useAppStore();
  
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (syncStatus === 'syncing') {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [syncStatus]);

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'syncing':
        return <RefreshCw className={`w-4 h-4 text-blue-500 ${isAnimating ? 'animate-spin' : ''}`} />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <WifiOff className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'online':
        return 'Connected & Synced';
      case 'syncing':
        return 'Syncing...';
      case 'error':
        return 'Sync Error';
      default:
        return 'Offline';
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'online':
        return 'text-green-400';
      case 'syncing':
        return 'text-blue-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never synced';
    
    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return lastSyncTime.toLocaleDateString();
  };

  const mockReconnect = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('online');
      setConnected(true);
    }, 2000);
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className={`font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </h3>
            <p className="text-xs text-gray-400">
              Last sync: {formatLastSync()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-gray-400" />
          )}
          
          {syncStatus === 'error' && (
            <button
              onClick={mockReconnect}
              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>

      {/* Recent Events */}
      {recentEvents.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Recent Activity
          </h4>
          
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {recentEvents.slice(-5).reverse().map((event) => (
              <div key={event.id} className="text-xs text-gray-400 flex items-center justify-between">
                <span className="capitalize">
                  {event.type.replace('_', ' ')}
                  {event.data?.title && `: ${event.data.title.slice(0, 30)}...`}
                  {event.data?.site && `: ${event.data.site}`}
                </span>
                <span className="text-gray-500">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sync Progress Indicator */}
      {syncStatus === 'syncing' && (
        <div className="mt-3">
          <div className="w-full bg-gray-700 rounded-full h-1">
            <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      )}
    </div>
  );
};
