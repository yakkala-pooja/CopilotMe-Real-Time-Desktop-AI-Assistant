# CopilotMe: Real-Time Desktop AI Assistant

CopilotMe is an intelligent desktop assistant that provides context-aware suggestions based on your current activities. It monitors your screen content, clipboard, and optionally audio input to offer relevant assistance in real-time.

## Features

### Context-Aware Suggestions
- **Active Window Monitoring**: Tracks the currently active window and application
- **Clipboard Integration**: Monitors clipboard content for context
- **Audio Monitoring** (Optional): Can process speech input for additional context
- **Real-time Updates**: Provides suggestions as your context changes

### Cost-Efficient Design
- **Rate Limiting**: Configurable requests per minute to manage API usage
- **Smart Caching**: Caches similar suggestions to reduce API calls
- **Usage Tracking**: Monitor API usage and estimated costs
- **Configurable Polling**: Adjust monitoring frequency to balance responsiveness and cost

### Modern UI
- **Material Design**: Clean, modern interface using Material-UI
- **Dark Theme**: Easy on the eyes
- **Responsive Layout**: Adapts to different window sizes
- **Non-intrusive Suggestions**: Overlay display that doesn't interrupt your workflow

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/CopilotMe-Real-Time-Desktop-AI-Assistant.git
cd CopilotMe-Real-Time-Desktop-AI-Assistant
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

4. Start the application:
```bash
npm run dev  # For development
npm start    # For production
```

## Configuration

### API Settings
- **OpenAI API Key**: Required for generating suggestions
- **Model Selection**: Uses GPT-3.5-turbo by default

### Cost Management Settings
- **Rate Limit**: Set maximum requests per minute (1-60)
- **Polling Interval**: Configure context check frequency (1-30 seconds)
- **Cache Size**: Set maximum number of cached suggestions (10-500)
- **Enable/Disable Caching**: Toggle suggestion caching

### Monitoring Settings
- **Audio Monitor**: Enable/disable speech input processing
- **Usage Statistics**: Track API calls and estimated costs

## Technical Architecture

### Main Process (Electron)
- **Screen Monitor**: Captures active window and clipboard data
- **Audio Monitor**: Handles speech input processing
- **Suggestion Engine**: Manages OpenAI API interactions
- **Configuration**: Handles settings and persistence

### Renderer Process (React)
- **Main Window**: Primary application interface
- **Settings Dialog**: Configuration management
- **Suggestion Overlay**: Non-intrusive suggestion display

### Key Technologies
- **Electron**: Cross-platform desktop application framework
- **React**: UI framework
- **TypeScript**: Type-safe development
- **Material-UI**: Modern component library
- **OpenAI API**: AI-powered suggestions
- **Webpack**: Build and bundling

## Development

### Project Structure
```
src/
├── main/
│   ├── ai/
│   │   └── suggestionEngine.ts
│   ├── monitors/
│   │   ├── audioMonitor.ts
│   │   └── screenMonitor.ts
│   ├── config.ts
│   └── main.ts
├── renderer/
│   ├── components/
│   │   ├── MainWindow.tsx
│   │   ├── Settings.tsx
│   │   └── SuggestionOverlay.tsx
│   ├── App.tsx
│   └── index.tsx
└── types/
    └── screenshot-desktop.d.ts
```

### Build Scripts
- `npm run dev`: Start development environment
- `npm run build`: Build production version
- `npm start`: Run production version
- `npm run package`: Create distributable packages

## Performance Optimization

### API Usage
- Implements rate limiting to prevent excessive API calls
- Caches similar suggestions to reduce redundant requests
- Configurable polling intervals to balance responsiveness and cost

### Memory Management
- Efficient context tracking with debounced updates
- Automatic cache cleanup when size limit is reached
- Proper cleanup of system resources

## Security Considerations

- API keys stored securely using electron-store
- No sensitive data transmitted without user consent
- Local-only processing of screen and clipboard content
- Optional audio monitoring with explicit user permission

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the GPT API
- Electron community for the excellent framework
- Material-UI team for the component library

## Support

For issues and feature requests, please use the GitHub issue tracker.
