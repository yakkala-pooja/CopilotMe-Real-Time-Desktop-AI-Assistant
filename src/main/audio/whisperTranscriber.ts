import path from 'path';
import { app } from 'electron';

interface WhisperWrapper {
  loadModel(modelPath: string): void;
  transcribe(audioData: Float32Array): string;
}

class WhisperTranscriber {
  private whisper: WhisperWrapper | null = null;
  private modelPath: string;
  private isInitialized: boolean = false;

  constructor() {
    // Model will be in the app's user data directory
    this.modelPath = path.join(app.getPath('userData'), 'models', 'ggml-base.en.bin');
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load the native module
      const whisperModule = require('../build/Release/whisper.node');
      this.whisper = new (whisperModule.WhisperWrapper as { new(): WhisperWrapper })();

      // Load the model
      this.whisper.loadModel(this.modelPath);
      this.isInitialized = true;
      console.log('Whisper transcriber initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Whisper transcriber:', error);
      throw error;
    }
  }

  async transcribe(audioData: Float32Array): Promise<string> {
    if (!this.isInitialized || !this.whisper) {
      throw new Error('Whisper transcriber not initialized');
    }

    try {
      return this.whisper.transcribe(audioData);
    } catch (error) {
      console.error('Failed to transcribe audio:', error);
      throw error;
    }
  }

  async downloadModelIfNeeded(): Promise<void> {
    const fs = require('fs');
    const https = require('https');
    const modelDir = path.dirname(this.modelPath);

    // Create models directory if it doesn't exist
    if (!fs.existsSync(modelDir)) {
      fs.mkdirSync(modelDir, { recursive: true });
    }

    // Check if model exists
    if (fs.existsSync(this.modelPath)) {
      console.log('Model already exists');
      return;
    }

    console.log('Downloading Whisper model...');

    // URL for the base English model
    const modelUrl = 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin';

    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(this.modelPath);
      https.get(modelUrl, (response: any) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log('Model downloaded successfully');
          resolve();
        });
      }).on('error', (err: Error) => {
        fs.unlink(this.modelPath, () => {});
        reject(err);
      });
    });
  }
}

export default WhisperTranscriber; 