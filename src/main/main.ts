import { app as electronApp, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import ScreenMonitor from './monitors/screenMonitor';
import { SuggestionEngine } from './ai/suggestionEngine';
import { Config } from './config';
import Store from 'electron-store';

const whisper = require('./build/Release/whisper.node');
const wrapper = new whisper.WhisperWrapper();

class App {
  private mainWindow: BrowserWindow | null = null;
  private screenMonitor: ScreenMonitor;
  private suggestionEngine: SuggestionEngine;
  private config: Config;
  private store: Store;

  constructor() {
    this.config = new Config();
    this.store = new Store();
    this.screenMonitor = new ScreenMonitor(this.config);
    this.suggestionEngine = new SuggestionEngine(this.config);

    this.screenMonitor.on('context', async (context) => {
      try {
        const suggestion = await this.suggestionEngine.generateSuggestion(context);
        if (suggestion && this.mainWindow) {
          this.mainWindow.webContents.send('display-suggestion', suggestion);
        }
      } catch (error) {
        console.error('Error generating suggestion:', error);
      }
    });

    ipcMain.on('accept-suggestion', (_, suggestion) => {
      console.log('Suggestion accepted:', suggestion);
    });

    ipcMain.handle('get-settings', () => {
      return {
        openaiApiKey: this.config.getOpenAIApiKey(),
        enableAudioMonitor: this.store.get('enableAudioMonitor', false),
        costSavingSettings: this.config.getCostSavingSettings(),
      };
    });

    ipcMain.handle('save-settings', (_, settings: any) => {
      this.config.setOpenAIApiKey(settings.openaiApiKey);
      this.store.set('enableAudioMonitor', settings.enableAudioMonitor);
      this.config.setCostSavingSettings(settings.costSavingSettings);

      // Restart monitors with new settings
      this.screenMonitor.stop();
      this.screenMonitor.start();

      // Reinitialize suggestion engine with new settings
      this.suggestionEngine = new SuggestionEngine(this.config);
    });

    ipcMain.handle('get-usage-stats', () => {
      return this.config.getUsageStats();
    });

    ipcMain.handle('reset-usage-stats', () => {
      this.config.resetUsageStats();
      return this.config.getUsageStats();
    });
  }

  async start() {
    await electronApp.whenReady();
    this.createWindow();

    this.screenMonitor.start();

    electronApp.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        electronApp.quit();
      }
    });

    electronApp.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow();
      }
    });

    // IPC handlers for renderer communication
    ipcMain.on('update-settings', (event, settings) => {
      // Handle settings updates
    });
  }

  private createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    // Load the index.html file
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    // Open the DevTools in development mode
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.webContents.openDevTools();
    }
  }
}

const app = new App();
app.start();

export { BrowserWindow }; 