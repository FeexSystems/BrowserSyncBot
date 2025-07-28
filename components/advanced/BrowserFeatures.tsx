import React, { useState } from 'react';
import { Monitor, Camera, Globe, Zap, Settings, Eye, Code } from 'lucide-react';
import { NanoBrowser } from './NanoBrowser';
import { BrowserAutomationManager } from './BrowserAutomationManager';
import { useAppStore } from '@/store/useAppStore';

type FeatureTab = 'preview' | 'automation' | 'testing' | 'settings';

export const BrowserFeatures: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<FeatureTab>('preview');
  const [previewUrl, setPreviewUrl] = useState('https://example.com');
  const [showNanoBrowser, setShowNanoBrowser] = useState(false);

  const { addTab, syncTab, currentDevice } = useAppStore();

  const features = [
    {
      id: 'preview' as FeatureTab,
      label: 'Tab Preview',
      icon: Eye,
      description: 'Preview websites in embedded nano browser'
    },
    {
      id: 'automation' as FeatureTab,
      label: 'Automation',
      icon: Zap,
      description: 'Automate browser interactions and capture tabs'
    },
    {
      id: 'testing' as FeatureTab,
      label: 'Testing',
      icon: Code,
      description: 'Test cross-device compatibility'
    },
    {
      id: 'settings' as FeatureTab,
      label: 'Settings',
      icon: Settings,
      description: 'Configure browser features'
    }
  ];

  const handlePreviewUrlChange = (url: string) => {
    setPreviewUrl(url);
    
    // Optionally add to tabs
    if (currentDevice) {
      const newTab = {
        title: 'Loading...',
        url,
        deviceId: currentDevice.id,
        browser: 'NanoBrowser',
        favicon: '🌐',
        lastAccessed: new Date()
      };
      
      addTab(newTab);
      syncTab?.('open', newTab);
    }
  };

  const handlePreviewTitleChange = (title: string) => {
    console.log('Preview title changed:', title);
  };

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case 'preview':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Tab Preview</h3>
                <p className="text-gray-400 text-sm">Preview websites before adding them to your sync list</p>
              </div>
              <button
                onClick={() => setShowNanoBrowser(!showNanoBrowser)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Globe className="w-4 h-4" />
                <span>{showNanoBrowser ? 'Hide' : 'Show'} Preview</span>
              </button>
            </div>

            {showNanoBrowser && (
              <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                <NanoBrowser
                  initialUrl={previewUrl}
                  width={800}
                  height={600}
                  onUrlChange={handlePreviewUrlChange}
                  onTitleChange={handlePreviewTitleChange}
                  onClose={() => setShowNanoBrowser(false)}
                  className="mx-auto"
                  showControls={true}
                  allowNavigation={true}
                />
              </div>
            )}

            {/* Quick Preview Links */}
            <div className="bg-black/30 rounded-lg p-4 border border-white/10">
              <h4 className="text-md font-medium text-white mb-3">Quick Preview</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: 'Google', url: 'https://google.com' },
                  { name: 'GitHub', url: 'https://github.com' },
                  { name: 'YouTube', url: 'https://youtube.com' },
                  { name: 'Reddit', url: 'https://reddit.com' },
                  { name: 'Twitter', url: 'https://twitter.com' },
                  { name: 'LinkedIn', url: 'https://linkedin.com' },
                  { name: 'Stack Overflow', url: 'https://stackoverflow.com' },
                  { name: 'MDN Docs', url: 'https://developer.mozilla.org' }
                ].map((site) => (
                  <button
                    key={site.name}
                    onClick={() => {
                      setPreviewUrl(site.url);
                      setShowNanoBrowser(true);
                    }}
                    className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left"
                  >
                    <div className="text-white font-medium text-sm">{site.name}</div>
                    <div className="text-gray-400 text-xs truncate">{site.url}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'automation':
        return <BrowserAutomationManager />;

      case 'testing':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Cross-Device Testing</h3>
              <p className="text-gray-400 text-sm">Test how websites appear across different devices and browsers</p>
            </div>

            <div className="bg-black/30 rounded-lg p-4 border border-white/10">
              <h4 className="text-md font-medium text-white mb-4">Device Simulation</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'iPhone 15 Pro', width: 393, height: 852, type: 'mobile' },
                  { name: 'iPad Air', width: 820, height: 1180, type: 'tablet' },
                  { name: 'MacBook Pro', width: 1512, height: 982, type: 'desktop' },
                  { name: 'Galaxy S24', width: 360, height: 780, type: 'mobile' },
                  { name: 'Surface Pro', width: 912, height: 1368, type: 'tablet' },
                  { name: 'Desktop 4K', width: 1920, height: 1080, type: 'desktop' }
                ].map((device) => (
                  <div key={device.name} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-white">{device.name}</h5>
                      <Monitor className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>Resolution: {device.width} × {device.height}</p>
                      <p>Type: {device.type}</p>
                    </div>
                    <button
                      onClick={() => {
                        setPreviewUrl('https://example.com');
                        setShowNanoBrowser(true);
                      }}
                      className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                    >
                      Test Preview
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-4 border border-white/10">
              <h4 className="text-md font-medium text-white mb-4">Performance Testing</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                  <span className="text-white">Page Load Speed</span>
                  <span className="text-green-400">Good (2.3s)</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                  <span className="text-white">Mobile Responsiveness</span>
                  <span className="text-green-400">Optimized</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                  <span className="text-white">Cross-Browser Compatibility</span>
                  <span className="text-yellow-400">Needs Testing</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Browser Settings</h3>
              <p className="text-gray-400 text-sm">Configure automation and preview settings</p>
            </div>

            <div className="space-y-4">
              {/* Preview Settings */}
              <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                <h4 className="text-md font-medium text-white mb-4">Preview Settings</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-white">Show Navigation Controls</label>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-white">Allow Navigation</label>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-white">Auto-sync Previewed Tabs</label>
                    <input type="checkbox" className="rounded" />
                  </div>
                </div>
              </div>

              {/* Automation Settings */}
              <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                <h4 className="text-md font-medium text-white mb-4">Automation Settings</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-white">Headless Mode</label>
                    <input type="checkbox" className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-white">Auto-capture Screenshots</label>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Default Viewport</label>
                    <select className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white">
                      <option>1920 × 1080 (Desktop)</option>
                      <option>1280 × 720 (HD)</option>
                      <option>393 × 852 (iPhone)</option>
                      <option>820 × 1180 (iPad)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Performance Settings */}
              <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                <h4 className="text-md font-medium text-white mb-4">Performance</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white mb-2">Max Concurrent Sessions</label>
                    <input 
                      type="number" 
                      defaultValue={3} 
                      min={1} 
                      max={10}
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Session Timeout (minutes)</label>
                    <input 
                      type="number" 
                      defaultValue={30} 
                      min={5} 
                      max={120}
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Feature Tabs */}
      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-2 border border-white/10">
        <div className="flex space-x-1">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => setActiveFeature(feature.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all flex-1 ${
                activeFeature === feature.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <feature.icon className="w-4 h-4" />
              <div className="text-left">
                <span className="font-medium block">{feature.label}</span>
                <span className="text-xs opacity-75 hidden md:block">{feature.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Feature Content */}
      <div className="min-h-[600px]">
        {renderFeatureContent()}
      </div>
    </div>
  );
};

export default BrowserFeatures;
