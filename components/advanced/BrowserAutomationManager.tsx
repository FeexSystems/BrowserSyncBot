import React, { useState, useEffect } from 'react';
import { Play, Square, Camera, Eye, Download, Trash2, Plus, Monitor, Zap, Clock } from 'lucide-react';
import { getSimpleBrowserService, MockPageSnapshot } from '@/services/simpleBrowserService';
import { useAppStore } from '@/store/useAppStore';
import { Tab } from '@/types';

interface AutomationSession {
  id: string;
  deviceId: string;
  startTime: Date;
  status: 'active' | 'inactive';
  tabCount: number;
}

interface CapturedTab extends Tab {
  screenshot?: string;
  metadata?: {
    loadTime: number;
    domElements: number;
    scripts: number;
    stylesheets: number;
  };
}

export const BrowserAutomationManager: React.FC = () => {
  const [sessions, setSessions] = useState<AutomationSession[]>([]);
  const [capturedTabs, setCapturedTabs] = useState<CapturedTab[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [newTabUrl, setNewTabUrl] = useState('https://example.com');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const { currentDevice, addTab, syncTab } = useAppStore();
  const browserService = getBrowserAutomationService({
    headless: false, // Show browser for better UX
    width: 1280,
    height: 720
  });

  useEffect(() => {
    refreshSessions();
  }, []);

  const refreshSessions = () => {
    const activeSessions = browserService.getActiveSessions();
    const sessionInfos: AutomationSession[] = activeSessions.map(sessionId => {
      const info = browserService.getSessionInfo(sessionId);
      return {
        id: sessionId,
        deviceId: info?.deviceId || 'unknown',
        startTime: info?.startTime || new Date(),
        status: 'active',
        tabCount: 0 // We'll need to track this separately
      };
    });
    setSessions(sessionInfos);
  };

  const createNewSession = async () => {
    if (!currentDevice) {
      alert('Please select a device first');
      return;
    }

    try {
      const sessionId = await browserService.createSession(currentDevice.id);
      setSelectedSession(sessionId);
      refreshSessions();
      console.log('New automation session created:', sessionId);
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to create browser session');
    }
  };

  const closeSession = async (sessionId: string) => {
    try {
      await browserService.closeSession(sessionId);
      refreshSessions();
      if (selectedSession === sessionId) {
        setSelectedSession(null);
      }
      console.log('Session closed:', sessionId);
    } catch (error) {
      console.error('Failed to close session:', error);
    }
  };

  const captureTabFromUrl = async () => {
    if (!selectedSession) {
      alert('Please select an active session first');
      return;
    }

    setIsCapturing(true);
    try {
      // Open tab in browser automation
      const tab = await browserService.openTab(selectedSession, newTabUrl);
      
      // Wait a moment for page to load
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Capture screenshot
      const screenshot = await browserService.captureScreenshot(selectedSession, tab.id);
      
      // Get page snapshot with metadata
      const snapshot = await browserService.getPageSnapshot(selectedSession, tab.id);
      
      // Create captured tab with screenshot
      const capturedTab: CapturedTab = {
        ...tab,
        screenshot: `data:image/png;base64,${screenshot}`,
        metadata: snapshot.metadata
      };
      
      setCapturedTabs(prev => [...prev, capturedTab]);
      
      // Optionally add to main tab list
      addTab(tab);
      syncTab?.('open', tab);
      
      setShowCaptureModal(false);
      setNewTabUrl('https://example.com');
      
      console.log('Tab captured successfully:', tab.title);
    } catch (error) {
      console.error('Failed to capture tab:', error);
      alert('Failed to capture tab from URL');
    } finally {
      setIsCapturing(false);
    }
  };

  const downloadScreenshot = (tab: CapturedTab) => {
    if (!tab.screenshot) return;
    
    const link = document.createElement('a');
    link.href = tab.screenshot;
    link.download = `screenshot-${tab.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const removeCapturedTab = (tabId: string) => {
    setCapturedTabs(prev => prev.filter(tab => tab.id !== tabId));
  };

  const formatDuration = (startTime: Date) => {
    const now = new Date();
    const diff = now.getTime() - startTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Browser Automation</h2>
          <p className="text-gray-400 text-sm">Automate browser interactions and capture tabs</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCaptureModal(true)}
            disabled={!selectedSession}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Camera className="w-4 h-4" />
            <span>Capture Tab</span>
          </button>
          <button
            onClick={createNewSession}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Session</span>
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-black/30 rounded-lg p-4 border border-white/10">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center space-x-2">
          <Monitor className="w-5 h-5" />
          <span>Active Sessions ({sessions.length})</span>
        </h3>
        
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Monitor className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No active browser sessions</p>
            <p className="text-sm">Create a new session to start automating</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedSession === session.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                }`}
                onClick={() => setSelectedSession(session.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-white font-medium">Session</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeSession(session.id);
                    }}
                    className="p-1 hover:bg-red-500/20 rounded text-red-400"
                  >
                    <Square className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="text-sm text-gray-400 space-y-1">
                  <p>Device: {session.deviceId.slice(-8)}</p>
                  <p className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Running: {formatDuration(session.startTime)}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Captured Tabs */}
      <div className="bg-black/30 rounded-lg p-4 border border-white/10">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center space-x-2">
          <Camera className="w-5 h-5" />
          <span>Captured Tabs ({capturedTabs.length})</span>
        </h3>
        
        {capturedTabs.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No captured tabs</p>
            <p className="text-sm">Use automation to capture tabs with screenshots</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {capturedTabs.map((tab) => (
              <div key={tab.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-600">
                {/* Screenshot */}
                {tab.screenshot && (
                  <div className="relative">
                    <img
                      src={tab.screenshot}
                      alt={tab.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <button
                        onClick={() => downloadScreenshot(tab)}
                        className="p-1 bg-black/50 hover:bg-black/70 rounded text-white"
                        title="Download Screenshot"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeCapturedTab(tab.id)}
                        className="p-1 bg-black/50 hover:bg-red-500/70 rounded text-white"
                        title="Remove"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Tab Info */}
                <div className="p-3">
                  <h4 className="font-medium text-white truncate" title={tab.title}>
                    {tab.title}
                  </h4>
                  <p className="text-sm text-gray-400 truncate" title={tab.url}>
                    {tab.url}
                  </p>
                  
                  {/* Metadata */}
                  {tab.metadata && (
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Zap className="w-3 h-3" />
                        <span>{tab.metadata.loadTime}ms</span>
                      </div>
                      <div>
                        <span>{tab.metadata.domElements} elements</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Capture Tab Modal */}
      {showCaptureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/10 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Capture New Tab</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL to Capture
                </label>
                <input
                  type="text"
                  value={newTabUrl}
                  onChange={(e) => setNewTabUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              {!selectedSession && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-400 text-sm">
                    Please select an active session first, or create a new one.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCaptureModal(false)}
                disabled={isCapturing}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={captureTabFromUrl}
                disabled={isCapturing || !selectedSession || !newTabUrl.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors flex items-center space-x-2"
              >
                {isCapturing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Capturing...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>Capture</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowserAutomationManager;
