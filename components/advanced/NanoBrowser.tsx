import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, RefreshCw, Home, Globe, Shield, X, Maximize2, Minimize2 } from 'lucide-react';

export interface NanoBrowserProps {
  initialUrl?: string;
  width?: number;
  height?: number;
  onUrlChange?: (url: string) => void;
  onTitleChange?: (title: string) => void;
  onClose?: () => void;
  className?: string;
  showControls?: boolean;
  allowNavigation?: boolean;
}

export const NanoBrowser: React.FC<NanoBrowserProps> = ({
  initialUrl = 'https://example.com',
  width = 800,
  height = 600,
  onUrlChange,
  onTitleChange,
  onClose,
  className = '',
  showControls = true,
  allowNavigation = true
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isSecure, setIsSecure] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [title, setTitle] = useState('Loading...');
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const historyRef = useRef<string[]>([initialUrl]);
  const historyIndexRef = useRef(0);

  useEffect(() => {
    setIsSecure(url.startsWith('https://'));
    onUrlChange?.(url);
  }, [url, onUrlChange]);

  useEffect(() => {
    onTitleChange?.(title);
  }, [title, onTitleChange]);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allowNavigation) return;

    let newUrl = inputUrl.trim();
    
    // Add protocol if missing
    if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
      newUrl = `https://${newUrl}`;
    }
    
    // Add to history
    const newIndex = historyIndexRef.current + 1;
    historyRef.current = historyRef.current.slice(0, newIndex);
    historyRef.current.push(newUrl);
    historyIndexRef.current = newIndex;
    
    setUrl(newUrl);
    setInputUrl(newUrl);
    updateNavigationState();
  };

  const goBack = () => {
    if (!canGoBack || !allowNavigation) return;
    
    historyIndexRef.current--;
    const newUrl = historyRef.current[historyIndexRef.current];
    setUrl(newUrl);
    setInputUrl(newUrl);
    updateNavigationState();
  };

  const goForward = () => {
    if (!canGoForward || !allowNavigation) return;
    
    historyIndexRef.current++;
    const newUrl = historyRef.current[historyIndexRef.current];
    setUrl(newUrl);
    setInputUrl(newUrl);
    updateNavigationState();
  };

  const refresh = () => {
    if (!allowNavigation) return;
    
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentSrc;
        }
      }, 100);
    }
  };

  const goHome = () => {
    if (!allowNavigation) return;
    
    const homeUrl = 'https://www.google.com';
    setUrl(homeUrl);
    setInputUrl(homeUrl);
    
    // Add to history
    const newIndex = historyIndexRef.current + 1;
    historyRef.current = historyRef.current.slice(0, newIndex);
    historyRef.current.push(homeUrl);
    historyIndexRef.current = newIndex;
    updateNavigationState();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const updateNavigationState = () => {
    setCanGoBack(historyIndexRef.current > 0);
    setCanGoForward(historyIndexRef.current < historyRef.current.length - 1);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    
    try {
      // Try to get title from iframe (will only work for same-origin)
      if (iframeRef.current?.contentDocument) {
        const iframeTitle = iframeRef.current.contentDocument.title;
        if (iframeTitle) {
          setTitle(iframeTitle);
        }
      }
    } catch (error) {
      // Cross-origin restriction, use URL as title
      const domain = new URL(url).hostname;
      setTitle(domain);
    }
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setTitle('Failed to load');
  };

  const containerStyle = isFullscreen 
    ? { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }
    : { width, height };

  return (
    <div 
      className={`bg-gray-900 border border-gray-700 rounded-lg overflow-hidden ${className}`}
      style={containerStyle}
    >
      {/* Browser Controls */}
      {showControls && (
        <div className="flex items-center bg-gray-800 border-b border-gray-700 p-2">
          {/* Navigation Buttons */}
          <div className="flex items-center space-x-1 mr-3">
            <button
              onClick={goBack}
              disabled={!canGoBack || !allowNavigation}
              className="p-2 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            
            <button
              onClick={goForward}
              disabled={!canGoForward || !allowNavigation}
              className="p-2 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Go Forward"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={refresh}
              disabled={!allowNavigation}
              className="p-2 rounded hover:bg-gray-700 disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={goHome}
              disabled={!allowNavigation}
              className="p-2 rounded hover:bg-gray-700 disabled:opacity-50"
              title="Home"
            >
              <Home className="w-4 h-4" />
            </button>
          </div>

          {/* URL Bar */}
          <form onSubmit={handleUrlSubmit} className="flex-1 flex items-center mx-3">
            <div className="flex items-center bg-gray-700 rounded-lg px-3 py-2 flex-1">
              {isSecure ? (
                <Shield className="w-4 h-4 text-green-400 mr-2" />
              ) : (
                <Globe className="w-4 h-4 text-gray-400 mr-2" />
              )}
              
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Enter URL..."
                disabled={!allowNavigation}
                className="bg-transparent text-white placeholder-gray-400 flex-1 outline-none disabled:cursor-not-allowed"
              />
            </div>
          </form>

          {/* Control Buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded hover:bg-gray-700"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded hover:bg-red-600"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Page Title Bar */}
      <div className="bg-gray-750 px-3 py-1 text-sm text-gray-300 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          {isLoading ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          )}
          <span className="truncate">{title}</span>
        </div>
      </div>

      {/* Browser Content */}
      <div className="relative bg-white" style={{ height: isFullscreen ? 'calc(100vh - 80px)' : height - 80 }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full border-0"
          title={title}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default NanoBrowser;
