import React, { useState } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle, Clock, Users, Zap, Settings, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import useSimpleWebSocket from '@/hooks/useSimpleWebSocket';

export const RealTimeSyncStatus: React.FC = () => {
  const { syncStatus, currentDevice } = useAppStore();
  const [showDetails, setShowDetails] = useState(false);
  
  const {
    isConnected,
    isReconnecting,
    lastSyncTime,
    connectedDevices,
    latency,
    conflicts,
    connect,
    disconnect,
    requestFullSync,
    resolveConflict
  } = useSimpleWebSocket({
    autoConnect: true,
    onConnectionChange: (connected) => {
      console.log('WebSocket connection changed:', connected);
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    }
  });

  const getStatusIcon = () => {
    if (isReconnecting) {
      return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
    }
    
    if (conflicts.length > 0) {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
    
    if (isConnected) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    
    return <AlertCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusText = () => {
    if (isReconnecting) return 'Reconnecting...';
    if (conflicts.length > 0) return `Connected (${conflicts.length} conflicts)`;
    if (isConnected) return 'Real-time Sync Active';
    return 'Disconnected';
  };

  const getStatusColor = () => {
    if (isReconnecting) return 'text-blue-400';
    if (conflicts.length > 0) return 'text-yellow-400';
    if (isConnected) return 'text-green-400';
    return 'text-red-400';
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never synced';
    
    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (seconds < 30) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return lastSyncTime.toLocaleDateString();
  };

  const getLatencyColor = () => {
    if (latency < 100) return 'text-green-400';
    if (latency < 300) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-white/10">
      {/* Main Status */}
      <div className="p-4">
        <div className="flex items-center justify-between">
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
            {/* Connection indicator */}
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-gray-400" />
            )}
            
            {/* Connected devices count */}
            {connectedDevices.length > 0 && (
              <div className="flex items-center space-x-1 text-xs text-gray-400">
                <Users className="w-3 h-3" />
                <span>{connectedDevices.length}</span>
              </div>
            )}
            
            {/* Latency indicator */}
            {isConnected && latency > 0 && (
              <div className={`flex items-center space-x-1 text-xs ${getLatencyColor()}`}>
                <Zap className="w-3 h-3" />
                <span>{latency}ms</span>
              </div>
            )}
            
            {/* Details toggle */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2 mt-3">
          {!isConnected && !isReconnecting && (
            <button
              onClick={connect}
              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              Connect
            </button>
          )}
          
          {isConnected && (
            <>
              <button
                onClick={requestFullSync}
                className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 rounded transition-colors flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Sync Now</span>
              </button>
              
              <button
                onClick={disconnect}
                className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 rounded transition-colors"
              >
                Disconnect
              </button>
            </>
          )}
        </div>
      </div>

      {/* Detailed Status */}
      {showDetails && (
        <div className="border-t border-white/10 p-4 space-y-4">
          {/* Current Device */}
          {currentDevice && (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Current Device</h4>
              <div className="text-xs text-gray-400 space-y-1">
                <p>Name: {currentDevice.name}</p>
                <p>Type: {currentDevice.type}</p>
                <p>Browser: {currentDevice.browser}</p>
                <p>Status: {currentDevice.status}</p>
              </div>
            </div>
          )}

          {/* Connected Devices */}
          {connectedDevices.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Connected Devices ({connectedDevices.length})
              </h4>
              <div className="space-y-1">
                {connectedDevices.slice(0, 3).map((deviceId) => (
                  <div key={deviceId} className="text-xs text-gray-400 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{deviceId}</span>
                  </div>
                ))}
                {connectedDevices.length > 3 && (
                  <p className="text-xs text-gray-500">+{connectedDevices.length - 3} more</p>
                )}
              </div>
            </div>
          )}

          {/* Sync Conflicts */}
          {conflicts.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-yellow-400 mb-2 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Sync Conflicts ({conflicts.length})</span>
              </h4>
              <div className="space-y-2">
                {conflicts.slice(0, 2).map((conflict) => (
                  <div key={conflict.id} className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs">
                        <p className="text-yellow-400 font-medium">{conflict.type} conflict</p>
                        <p className="text-gray-400">Item: {conflict.itemId}</p>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => resolveConflict(conflict.id, 'local')}
                          className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded"
                        >
                          Keep Local
                        </button>
                        <button
                          onClick={() => resolveConflict(conflict.id, 'remote')}
                          className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 rounded"
                        >
                          Use Remote
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {conflicts.length > 2 && (
                  <p className="text-xs text-gray-500">+{conflicts.length - 2} more conflicts</p>
                )}
              </div>
            </div>
          )}

          {/* Connection Stats */}
          {isConnected && (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Connection Stats</h4>
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                <div>
                  <p>Latency: <span className={getLatencyColor()}>{latency}ms</span></p>
                  <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
                </div>
                <div>
                  <p>Last Sync: {formatLastSync()}</p>
                  <p>Device ID: {currentDevice?.id?.slice(-8) || 'None'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
