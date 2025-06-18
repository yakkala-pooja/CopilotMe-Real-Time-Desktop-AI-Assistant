import { EventEmitter } from 'events';
import WhisperTranscriber from '../audio/whisperTranscriber';

interface AudioContext {
  timestamp: string;
  text: string;
}

class AudioMonitor extends EventEmitter {
  private isRunning: boolean = false;
  private transcriber: WhisperTranscriber;
  private mediaRecorder: any = null;
  private audioChunks: Float32Array[] = [];
  private sampleRate: number = 16000; // Whisper expects 16kHz audio

  constructor() {
    super();
    this.transcriber = new WhisperTranscriber();
  }

  async initialize(): Promise<void> {
    try {
      await this.transcriber.downloadModelIfNeeded();
      await this.transcriber.initialize();
      console.log('Audio monitor initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio monitor:', error);
      throw error;
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      let audioData = new Float32Array(0);

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const newData = new Float32Array(audioData.length + inputData.length);
        newData.set(audioData);
        newData.set(inputData, audioData.length);
        audioData = newData;

        // Process audio when we have enough samples (3 seconds)
        if (audioData.length >= this.sampleRate * 3) {
          this.processAudio(audioData);
          audioData = new Float32Array(0);
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      this.isRunning = true;
      console.log('Audio monitor started');
    } catch (error) {
      console.error('Failed to start audio monitor:', error);
      throw error;
    }
  }

  stop(): void {
    if (!this.isRunning) return;

    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    }

    this.isRunning = false;
    this.audioChunks = [];
    console.log('Audio monitor stopped');
  }

  private async processAudio(audioData: Float32Array): Promise<void> {
    try {
      const text = await this.transcriber.transcribe(audioData);
      if (text.trim()) {
        const context: AudioContext = {
          timestamp: new Date().toISOString(),
          text: text.trim()
        };
        this.emit('speech', context);
      }
    } catch (error) {
      console.error('Failed to process audio:', error);
    }
  }
}

export default AudioMonitor;

export interface AudioTranscription {
  timestamp: string;
  text: string;
}

const audioMonitor = new AudioMonitor();

export function setupAudioMonitor() {
  // Audio monitoring is optional, so we don't auto-start it
  return audioMonitor;
}

export { audioMonitor }; 