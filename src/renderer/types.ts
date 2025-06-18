export interface Suggestion {
  timestamp: string;
  text: string;
  context: {
    screen: {
      activeWindow: {
        title: string;
        app: string;
      };
    } | null;
    audio: {
      text: string;
    } | null;
  };
} 