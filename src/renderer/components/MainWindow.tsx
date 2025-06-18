import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  ThemeProvider,
  createTheme,
  CssBaseline,
  useMediaQuery,
  Fade,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Lightbulb as LightbulbIcon,
  Settings as SettingsIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { ipcRenderer } from 'electron';
import Settings from './Settings';

interface Suggestion {
  timestamp: string;
  text: string;
  context: any;
}

export default function MainWindow() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
          primary: {
            main: '#2196f3',
          },
          secondary: {
            main: '#f50057',
          },
          background: {
            default: prefersDarkMode ? '#121212' : '#f5f5f5',
            paper: prefersDarkMode ? '#1e1e1e' : '#ffffff',
          },
        },
        typography: {
          fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
          h4: {
            fontWeight: 600,
          },
          h6: {
            fontWeight: 500,
          },
        },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                boxShadow: prefersDarkMode 
                  ? '0 4px 6px rgba(0, 0, 0, 0.2)'
                  : '0 4px 6px rgba(0, 0, 0, 0.1)',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 12,
              },
            },
          },
        },
      }),
    [prefersDarkMode],
  );

  useEffect(() => {
    // Listen for suggestions from the main process
    ipcRenderer.on('suggestion', (_, suggestion: Suggestion) => {
      setSuggestions(prev => [suggestion, ...prev].slice(0, 10)); // Keep last 10 suggestions
    });

    return () => {
      ipcRenderer.removeAllListeners('suggestion');
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box sx={{ 
          mt: 4, 
          mb: 8,
          position: 'relative',
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 4,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LightbulbIcon sx={{ 
                fontSize: 40, 
                mr: 2,
                color: theme.palette.primary.main 
              }} />
              <Box>
                <Typography variant="h4" gutterBottom sx={{ mb: 0.5 }}>
                  CopilotMe
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    fontWeight: 400,
                  }}
                >
                  Your real-time AI desktop assistant
                </Typography>
              </Box>
            </Box>
            <Tooltip title="Settings">
              <IconButton 
                onClick={() => setShowSettings(!showSettings)}
                sx={{ 
                  backgroundColor: theme.palette.action.hover,
                  '&:hover': {
                    backgroundColor: theme.palette.action.selected,
                  },
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Fade in={showSettings}>
            <Box sx={{ mb: 4 }}>
              {showSettings && <Settings />}
            </Box>
          </Fade>

          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ 
                p: 2, 
                display: 'flex', 
                alignItems: 'center',
                borderBottom: 1,
                borderColor: 'divider',
              }}>
                <AccessTimeIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  Recent Suggestions
                </Typography>
              </Box>
              <List sx={{ p: 0 }}>
                {suggestions.map((suggestion, index) => (
                  <React.Fragment key={suggestion.timestamp + index}>
                    <ListItem sx={{ px: 3, py: 2 }}>
                      <ListItemText
                        primary={
                          <Typography variant="body1" sx={{ mb: 0.5 }}>
                            {suggestion.text}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            {new Date(suggestion.timestamp).toLocaleString()}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < suggestions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
                {suggestions.length === 0 && (
                  <ListItem sx={{ px: 3, py: 4 }}>
                    <ListItemText
                      primary={
                        <Typography 
                          variant="body1" 
                          align="center"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          No suggestions yet
                        </Typography>
                      }
                      secondary={
                        <Typography 
                          variant="body2" 
                          align="center"
                          sx={{ mt: 1, color: theme.palette.text.disabled }}
                        >
                          Suggestions will appear here as you use your computer
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </ThemeProvider>
  );
} 