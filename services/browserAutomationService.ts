import puppeteer, { Browser, Page } from 'puppeteer';
import { Tab } from '@/types';

export interface BrowserAutomationOptions {
  headless?: boolean;
  width?: number;
  height?: number;
  userAgent?: string;
}

export interface PageSnapshot {
  id: string;
  url: string;
  title: string;
  screenshot: string; // base64 encoded image
  favicon?: string;
  timestamp: Date;
  metadata: {
    loadTime: number;
    domElements: number;
    scripts: number;
    stylesheets: number;
  };
}

export interface BrowserSession {
  id: string;
  browser: Browser;
  pages: Map<string, Page>;
  deviceId: string;
  startTime: Date;
}

export class BrowserAutomationService {
  private sessions: Map<string, BrowserSession> = new Map();
  private defaultOptions: BrowserAutomationOptions;

  constructor(options: BrowserAutomationOptions = {}) {
    this.defaultOptions = {
      headless: true,
      width: 1920,
      height: 1080,
      userAgent: 'BrowserSync-Bot/1.0',
      ...options
    };
  }

  // Create a new browser session
  async createSession(deviceId: string, sessionId?: string): Promise<string> {
    const id = sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const browser = await puppeteer.launch({
        headless: this.defaultOptions.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          `--window-size=${this.defaultOptions.width},${this.defaultOptions.height}`
        ],
        defaultViewport: {
          width: this.defaultOptions.width!,
          height: this.defaultOptions.height!
        }
      });

      const session: BrowserSession = {
        id,
        browser,
        pages: new Map(),
        deviceId,
        startTime: new Date()
      };

      this.sessions.set(id, session);
      console.log(`Browser session created: ${id} for device: ${deviceId}`);
      
      return id;
    } catch (error) {
      console.error('Failed to create browser session:', error);
      throw new Error(`Failed to create browser session: ${error}`);
    }
  }

  // Open a new tab/page in a session
  async openTab(sessionId: string, url: string, tabId?: string): Promise<Tab> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const id = tabId || `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const page = await session.browser.newPage();
      
      // Set user agent
      await page.setUserAgent(this.defaultOptions.userAgent || 'BrowserSync-Bot/1.0');
      
      // Set viewport
      await page.setViewport({
        width: this.defaultOptions.width!,
        height: this.defaultOptions.height!
      });

      // Navigate to URL
      const startTime = Date.now();
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      const loadTime = Date.now() - startTime;

      // Get page information
      const title = await page.title();
      const favicon = await this.extractFavicon(page);

      session.pages.set(id, page);

      const tab: Tab = {
        id,
        title,
        url,
        deviceId: session.deviceId,
        browser: 'Puppeteer',
        favicon,
        lastAccessed: new Date(),
        isPinned: false
      };

      console.log(`Tab opened: ${title} (${url}) in session ${sessionId}`);
      return tab;
    } catch (error) {
      console.error(`Failed to open tab in session ${sessionId}:`, error);
      throw new Error(`Failed to open tab: ${error}`);
    }
  }

  // Capture screenshot of a tab
  async captureScreenshot(sessionId: string, tabId: string): Promise<string> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const page = session.pages.get(tabId);
    if (!page) {
      throw new Error(`Tab ${tabId} not found in session ${sessionId}`);
    }

    try {
      const screenshot = await page.screenshot({
        type: 'png',
        encoding: 'base64',
        fullPage: false
      });

      return screenshot as string;
    } catch (error) {
      console.error(`Failed to capture screenshot:`, error);
      throw new Error(`Failed to capture screenshot: ${error}`);
    }
  }

  // Get page snapshot with metadata
  async getPageSnapshot(sessionId: string, tabId: string): Promise<PageSnapshot> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const page = session.pages.get(tabId);
    if (!page) {
      throw new Error(`Tab ${tabId} not found in session ${sessionId}`);
    }

    try {
      const startTime = Date.now();
      
      // Get page information
      const [title, url, screenshot] = await Promise.all([
        page.title(),
        page.url(),
        page.screenshot({ type: 'png', encoding: 'base64', fullPage: false })
      ]);

      // Get page metadata
      const metadata = await page.evaluate(() => {
        return {
          domElements: document.querySelectorAll('*').length,
          scripts: document.scripts.length,
          stylesheets: document.styleSheets.length
        };
      });

      const loadTime = Date.now() - startTime;
      const favicon = await this.extractFavicon(page);

      return {
        id: tabId,
        url,
        title,
        screenshot: screenshot as string,
        favicon,
        timestamp: new Date(),
        metadata: {
          loadTime,
          ...metadata
        }
      };
    } catch (error) {
      console.error(`Failed to get page snapshot:`, error);
      throw new Error(`Failed to get page snapshot: ${error}`);
    }
  }

  // Navigate tab to new URL
  async navigateTab(sessionId: string, tabId: string, url: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const page = session.pages.get(tabId);
    if (!page) {
      throw new Error(`Tab ${tabId} not found in session ${sessionId}`);
    }

    try {
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      console.log(`Tab ${tabId} navigated to: ${url}`);
    } catch (error) {
      console.error(`Failed to navigate tab:`, error);
      throw new Error(`Failed to navigate tab: ${error}`);
    }
  }

  // Close a specific tab
  async closeTab(sessionId: string, tabId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const page = session.pages.get(tabId);
    if (!page) {
      return; // Tab already closed or doesn't exist
    }

    try {
      await page.close();
      session.pages.delete(tabId);
      console.log(`Tab ${tabId} closed in session ${sessionId}`);
    } catch (error) {
      console.error(`Failed to close tab:`, error);
    }
  }

  // Close entire browser session
  async closeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return; // Session already closed or doesn't exist
    }

    try {
      // Close all pages first
      for (const [tabId, page] of session.pages) {
        try {
          await page.close();
        } catch (error) {
          console.warn(`Failed to close tab ${tabId}:`, error);
        }
      }

      // Close browser
      await session.browser.close();
      this.sessions.delete(sessionId);
      
      console.log(`Browser session ${sessionId} closed`);
    } catch (error) {
      console.error(`Failed to close session:`, error);
    }
  }

  // Get all active sessions
  getActiveSessions(): string[] {
    return Array.from(this.sessions.keys());
  }

  // Get session information
  getSessionInfo(sessionId: string): Partial<BrowserSession> | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    return {
      id: session.id,
      deviceId: session.deviceId,
      startTime: session.startTime,
      pages: new Map() // Don't expose actual page objects
    };
  }

  // Extract favicon from page
  private async extractFavicon(page: Page): Promise<string> {
    try {
      const favicon = await page.evaluate(() => {
        const link = document.querySelector('link[rel*="icon"]') as HTMLLinkElement;
        if (link && link.href) {
          return link.href;
        }
        
        // Fallback to default favicon
        return `${window.location.origin}/favicon.ico`;
      });

      return favicon || '🌐';
    } catch (error) {
      return '🌐'; // Default favicon
    }
  }

  // Cleanup all sessions
  async cleanup(): Promise<void> {
    const sessionIds = Array.from(this.sessions.keys());
    await Promise.all(sessionIds.map(id => this.closeSession(id)));
    console.log('All browser sessions cleaned up');
  }
}

// Singleton instance
let browserService: BrowserAutomationService | null = null;

export const getBrowserAutomationService = (options?: BrowserAutomationOptions): BrowserAutomationService => {
  if (!browserService) {
    browserService = new BrowserAutomationService(options);
  }
  return browserService;
};

export const initializeBrowserAutomation = (options?: BrowserAutomationOptions): BrowserAutomationService => {
  return getBrowserAutomationService(options);
};
