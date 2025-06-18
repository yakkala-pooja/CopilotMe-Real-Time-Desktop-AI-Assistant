import Store from 'electron-store';

interface CostSavingSettings {
  rateLimit: number; // Maximum requests per minute
  pollingInterval: number; // Milliseconds between polls
  enableCaching: boolean;
  maxCacheSize: number; // Maximum number of cached suggestions
}

const DEFAULT_SETTINGS: CostSavingSettings = {
  rateLimit: 30, // 30 requests per minute
  pollingInterval: 5000, // 5 seconds
  enableCaching: true,
  maxCacheSize: 100
};

export class Config {
  private store: Store;

  constructor() {
    this.store = new Store();
    // Initialize default settings if not exist
    if (!this.store.get('costSavingSettings')) {
      this.store.set('costSavingSettings', DEFAULT_SETTINGS);
    }
  }

  getOpenAIApiKey(): string {
    return this.store.get('openaiApiKey', '') as string;
  }

  setOpenAIApiKey(apiKey: string): void {
    this.store.set('openaiApiKey', apiKey);
  }

  getCostSavingSettings(): CostSavingSettings {
    return this.store.get('costSavingSettings', DEFAULT_SETTINGS) as CostSavingSettings;
  }

  setCostSavingSettings(settings: Partial<CostSavingSettings>): void {
    const currentSettings = this.getCostSavingSettings();
    this.store.set('costSavingSettings', { ...currentSettings, ...settings });
  }

  getUsageStats(): { requestCount: number; lastReset: string } {
    return this.store.get('usageStats', { requestCount: 0, lastReset: new Date().toISOString() });
  }

  incrementRequestCount(): void {
    const stats = this.getUsageStats();
    this.store.set('usageStats', {
      ...stats,
      requestCount: stats.requestCount + 1
    });
  }

  resetUsageStats(): void {
    this.store.set('usageStats', {
      requestCount: 0,
      lastReset: new Date().toISOString()
    });
  }
}

export const hasValidOpenAIApiKey = (): boolean => {
  const apiKey = Config.prototype.getOpenAIApiKey.call(new Config());
  return apiKey !== undefined && apiKey.length > 0;
}; 