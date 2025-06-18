import activeWin from 'active-win';
import { EventEmitter } from 'events';
import { debounce } from 'lodash';
import screenshot from 'screenshot-desktop';
import { clipboard } from 'electron';
import { Config } from '../config';

interface ScreenContext {
  timestamp: string;
  activeWindow: {
    title: string;
    app: string;
    url?: string;
  };
  clipboardContent: string;
  screenshot?: Buffer;
}

class ScreenMonitor extends EventEmitter {
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private config: Config;

  constructor(config: Config) {
    super();
    this.config = config;
    console.log('ScreenMonitor initialized');
  }

  start() {
    if (this.isRunning) return;
    console.log('Starting screen monitor');
    this.isRunning = true;
    this.pollContext();
  }

  stop() {
    if (!this.isRunning) return;
    console.log('Stopping screen monitor');
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private pollContext = debounce(async () => {
    if (!this.isRunning) return;
    try {
      console.log('Polling screen context...');
      const context = await this.captureContext();
      console.log('Captured context:', context);
      this.emit('context', context);
    } catch (error) {
      console.error('Error capturing screen context:', error);
    }
    const settings = this.config.getCostSavingSettings();
    this.intervalId = setTimeout(() => this.pollContext(), settings.pollingInterval);
  }, 100);

  async captureContext(): Promise<ScreenContext> {
    try {
      const activeWindow = await activeWin();
      const clipboardContent = clipboard.readText();
      
      console.log('Active window:', activeWindow);
      console.log('Clipboard content:', clipboardContent ? 'Present' : 'Empty');

      return {
        timestamp: new Date().toISOString(),
        activeWindow: {
          title: activeWindow?.title || '',
          app: activeWindow?.owner?.name || '',
          url: (activeWindow as any)?.url // Cast to any since url is not in the type definition
        },
        clipboardContent
      };
    } catch (error) {
      console.error('Error capturing context:', error);
      return {
        timestamp: new Date().toISOString(),
        activeWindow: {
          title: '',
          app: '',
        },
        clipboardContent: ''
      };
    }
  }
}

export default ScreenMonitor; 