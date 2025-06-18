import React, { useState, useEffect } from 'react';
import { Box, Container, Button, Typography, Paper } from '@mui/material';
import SuggestionOverlay from './components/SuggestionOverlay';
import Settings from './components/Settings';

interface Suggestion {
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

const App: React.FC = () => {
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [showSettings, setShowSettings] = useState(true);

  useEffect(() => {
    const { ipcRenderer } = window.require('electron');

    ipcRenderer.on('display-suggestion', (_, newSuggestion: Suggestion) => {
      setSuggestion(newSuggestion);
    });

    return () => {
      ipcRenderer.removeAllListeners('display-suggestion');
    };
  }, []);

  return (
    <Container>
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to CopilotMe
        </Typography>
        
        <Button 
          variant="contained" 
          onClick={() => setShowSettings(true)}
          sx={{ mb: 2 }}
        >
          Open Settings
        </Button>

        {!suggestion && (
          <Paper elevation={3} sx={{ p: 3, maxWidth: 600, width: '100%', bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom>
              Getting Started
            </Typography>
            <Typography variant="body1" paragraph>
              CopilotMe is your AI-powered desktop assistant that provides contextual suggestions based on your activities.
            </Typography>
            <Typography variant="body1" paragraph>
              To begin:
            </Typography>
            <Typography component="ol" sx={{ pl: 2 }}>
              <li>Configure your OpenAI API key in Settings</li>
              <li>Enable audio monitoring if you want voice-based suggestions</li>
              <li>Start using your computer normally - CopilotMe will provide helpful suggestions based on your context</li>
            </Typography>
          </Paper>
        )}
      </Box>
      
      <Settings open={showSettings} onClose={() => setShowSettings(false)} />
      {suggestion && <SuggestionOverlay suggestion={suggestion} />}
    </Container>
  );
};

export default App; 