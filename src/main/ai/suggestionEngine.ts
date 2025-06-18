import OpenAI from 'openai';
import { Config } from '../config';
import crypto from 'crypto';

interface CachedSuggestion {
  timestamp: string;
  text: string;
  context: any;
  hash: string;
}

export class SuggestionEngine {
  private openai: OpenAI | null = null;
  private audioMonitorEnabled: boolean = false;
  private requestTimestamps: number[] = [];
  private suggestionCache: Map<string, CachedSuggestion> = new Map();
  private settings: ReturnType<Config['getCostSavingSettings']>;

  constructor(private config: Config) {
    this.initializeOpenAI();
    this.settings = config.getCostSavingSettings();
  }

  private initializeOpenAI() {
    const apiKey = this.config.getOpenAIApiKey();
    console.log('Initializing OpenAI with API key:', apiKey ? 'Present' : 'Not present');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      console.log('OpenAI client initialized successfully');
    }
  }

  setAudioMonitorEnabled(enabled: boolean) {
    this.audioMonitorEnabled = enabled;
  }

  private hashContext(context: any): string {
    // Create a stable hash of the context by sorting keys
    const stableContext = JSON.stringify(context, Object.keys(context).sort());
    return crypto.createHash('md5').update(stableContext).digest('hex');
  }

  private isRateLimited(): boolean {
    const now = Date.now();
    // Remove timestamps older than 1 minute
    this.requestTimestamps = this.requestTimestamps.filter(
      timestamp => now - timestamp < 60000
    );
    return this.requestTimestamps.length >= this.settings.rateLimit;
  }

  private addRequestTimestamp(): void {
    this.requestTimestamps.push(Date.now());
    this.config.incrementRequestCount();
  }

  private cleanCache(): void {
    if (this.suggestionCache.size > this.settings.maxCacheSize) {
      // Remove oldest entries to maintain max size
      const entriesToRemove = this.suggestionCache.size - this.settings.maxCacheSize;
      const entries = Array.from(this.suggestionCache.entries());
      entries.slice(0, entriesToRemove).forEach(([key]) => {
        this.suggestionCache.delete(key);
      });
    }
  }

  async generateSuggestion(context: any): Promise<CachedSuggestion | null> {
    if (!this.openai) {
      console.error('OpenAI API key not configured');
      return null;
    }

    try {
      const contextHash = this.hashContext(context);

      // Check cache if enabled
      if (this.settings.enableCaching) {
        const cached = this.suggestionCache.get(contextHash);
        if (cached) {
          console.log('Using cached suggestion');
          return cached;
        }
      }

      // Check rate limit
      if (this.isRateLimited()) {
        console.log('Rate limit reached, skipping suggestion generation');
        return null;
      }

      console.log('Generating suggestion for context:', context);
      const prompt = this.buildPrompt(context);
      console.log('Built prompt:', prompt);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant that provides suggestions based on the user\'s current context.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      this.addRequestTimestamp();

      const messageContent = response.choices[0].message.content;
      if (!messageContent) {
        console.error('No message content in response');
        return null;
      }

      const suggestion: CachedSuggestion = {
        timestamp: new Date().toISOString(),
        text: messageContent,
        context,
        hash: contextHash,
      };

      // Cache the suggestion if enabled
      if (this.settings.enableCaching) {
        this.suggestionCache.set(contextHash, suggestion);
        this.cleanCache();
      }

      console.log('Received response from OpenAI:', messageContent);
      return suggestion;
    } catch (error) {
      console.error('Error generating suggestion:', error);
      return null;
    }
  }

  private buildPrompt(context: any): string {
    let prompt = `Based on the following context:\n\n`;

    if (context.activeWindow) {
      prompt += `Active window: ${context.activeWindow.title} (${context.activeWindow.app})\n`;
      if (context.activeWindow.url) {
        prompt += `URL: ${context.activeWindow.url}\n`;
      }
    }

    if (context.clipboardContent) {
      prompt += `\nClipboard content:\n${context.clipboardContent}\n`;
    }

    if (this.audioMonitorEnabled && context.audio?.text) {
      prompt += `\nRecent speech:\n${context.audio.text}\n`;
    }

    prompt += `\nProvide a helpful suggestion or action based on this context.`;

    return prompt;
  }
} 