import { Tab } from '@/types';

export interface SimpleBrowserOptions {
  width?: number;
  height?: number;
  userAgent?: string;
}

export interface MockPageSnapshot {
  id: string;
  url: string;
  title: string;
  screenshot: string; // Mock base64 encoded image
  favicon?: string;
  timestamp: Date;
  metadata: {
    loadTime: number;
    domElements: number;
    scripts: number;
    stylesheets: number;
  };
}

export class SimpleBrowserService {
  private options: SimpleBrowserOptions;
  private sessions: Map<string, any> = new Map();

  constructor(options: SimpleBrowserOptions = {}) {
    this.options = {
      width: 1280,
      height: 720,
      userAgent: 'BrowserSync-Bot/1.0',
      ...options
    };
  }

  // Create a mock session
  async createSession(deviceId: string, sessionId?: string): Promise<string> {
    const id = sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const session = {
      id,
      deviceId,
      startTime: new Date(),
      tabs: new Map()
    };

    this.sessions.set(id, session);
    console.log(`Mock browser session created: ${id} for device: ${deviceId}`);
    
    return id;
  }

  // Simulate opening a tab
  async openTab(sessionId: string, url: string, tabId?: string): Promise<Tab> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const id = tabId || `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Extract domain for title
    let title = 'Loading...';
    let favicon = '🌐';
    
    try {
      const urlObj = new URL(url);
      title = urlObj.hostname.replace('www.', '');
      
      // Mock favicons for common sites
      if (urlObj.hostname.includes('google')) favicon = '🔍';
      else if (urlObj.hostname.includes('github')) favicon = '🐙';
      else if (urlObj.hostname.includes('youtube')) favicon = '🎬';
      else if (urlObj.hostname.includes('reddit')) favicon = '🔶';
      else if (urlObj.hostname.includes('twitter')) favicon = '🐦';
      else if (urlObj.hostname.includes('linkedin')) favicon = '💼';
      else if (urlObj.hostname.includes('stackoverflow')) favicon = '📚';
      else if (urlObj.hostname.includes('mdn') || urlObj.hostname.includes('mozilla')) favicon = '📖';
    } catch (error) {
      title = 'Invalid URL';
    }

    const tab: Tab = {
      id,
      title,
      url,
      deviceId: session.deviceId,
      browser: 'SimpleBrowser',
      favicon,
      lastAccessed: new Date(),
      isPinned: false
    };

    session.tabs.set(id, tab);
    console.log(`Mock tab opened: ${title} (${url}) in session ${sessionId}`);
    
    return tab;
  }

  // Generate a mock screenshot
  async captureScreenshot(sessionId: string, tabId: string): Promise<string> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const tab = session.tabs.get(tabId);
    if (!tab) {
      throw new Error(`Tab ${tabId} not found in session ${sessionId}`);
    }

    // Simulate capture time
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate a mock screenshot (simple colored rectangle as base64)
    const canvas = document.createElement('canvas');
    canvas.width = this.options.width!;
    canvas.height = this.options.height!;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Create a gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add some mock content
      ctx.fillStyle = 'white';
      ctx.font = '24px Arial';
      ctx.fillText(tab.title, 50, 100);
      
      ctx.font = '16px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText(tab.url, 50, 140);
      
      // Add mock browser elements
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(50, 200, canvas.width - 100, 40);
      ctx.fillRect(50, 260, canvas.width - 200, 30);
      ctx.fillRect(50, 310, canvas.width - 150, 30);
    }

    return canvas.toDataURL('image/png').split(',')[1]; // Return base64 without data URL prefix
  }

  // Generate mock page snapshot
  async getPageSnapshot(sessionId: string, tabId: string): Promise<MockPageSnapshot> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const tab = session.tabs.get(tabId);
    if (!tab) {
      throw new Error(`Tab ${tabId} not found in session ${sessionId}`);
    }

    const screenshot = await this.captureScreenshot(sessionId, tabId);

    return {
      id: tabId,
      url: tab.url,
      title: tab.title,
      screenshot,
      favicon: tab.favicon,
      timestamp: new Date(),
      metadata: {
        loadTime: Math.floor(Math.random() * 3000) + 500, // 500-3500ms
        domElements: Math.floor(Math.random() * 1000) + 100,
        scripts: Math.floor(Math.random() * 20) + 1,
        stylesheets: Math.floor(Math.random() * 10) + 1
      }
    };
  }

  // Mock navigation
  async navigateTab(sessionId: string, tabId: string, url: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const tab = session.tabs.get(tabId);
    if (!tab) {
      throw new Error(`Tab ${tabId} not found in session ${sessionId}`);
    }

    // Simulate navigation time
    await new Promise(resolve => setTimeout(resolve, 1000));

    tab.url = url;
    tab.lastAccessed = new Date();
    
    console.log(`Mock tab ${tabId} navigated to: ${url}`);
  }

  // Close tab
  async closeTab(sessionId: string, tabId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    session.tabs.delete(tabId);
    console.log(`Mock tab ${tabId} closed in session ${sessionId}`);
  }

  // Close session
  async closeSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
    console.log(`Mock browser session ${sessionId} closed`);
  }

  // Get active sessions
  getActiveSessions(): string[] {
    return Array.from(this.sessions.keys());
  }

  // Get session info
  getSessionInfo(sessionId: string): any {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    return {
      id: session.id,
      deviceId: session.deviceId,
      startTime: session.startTime,
      tabCount: session.tabs.size
    };
  }

  // Cleanup
  async cleanup(): Promise<void> {
    this.sessions.clear();
    console.log('All mock browser sessions cleaned up');
  }
}

// Singleton instance
let simpleBrowserService: SimpleBrowserService | null = null;

export const getSimpleBrowserService = (options?: SimpleBrowserOptions): SimpleBrowserService => {
  if (!simpleBrowserService) {
    simpleBrowserService = new SimpleBrowserService(options);
  }
  return simpleBrowserService;
};

export const initializeSimpleBrowser = (options?: SimpleBrowserOptions): SimpleBrowserService => {
  return getSimpleBrowserService(options);
};
