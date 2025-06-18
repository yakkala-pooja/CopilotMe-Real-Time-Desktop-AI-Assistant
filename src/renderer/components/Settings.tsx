import React, { useState, useEffect } from 'react';
import {
  Paper,
  TextField,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Typography,
  Divider,
  Box,
  Slider,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Key as KeyIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Cached as CachedIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface Settings {
  openaiApiKey: string;
  enableAudioMonitor: boolean;
  costSavingSettings: {
    rateLimit: number;
    pollingInterval: number;
    enableCaching: boolean;
    maxCacheSize: number;
  };
}

interface UsageStats {
  requestCount: number;
  lastReset: string;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    openaiApiKey: '',
    enableAudioMonitor: false,
    costSavingSettings: {
      rateLimit: 30,
      pollingInterval: 5000,
      enableCaching: true,
      maxCacheSize: 100,
    },
  });
  const [usageStats, setUsageStats] = useState<UsageStats>({
    requestCount: 0,
    lastReset: new Date().toISOString(),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const theme = useTheme();

  useEffect(() => {
    const { ipcRenderer } = window.require('electron');
    ipcRenderer.invoke('get-settings').then((savedSettings: Settings) => {
      setSettings(savedSettings);
    });
    ipcRenderer.invoke('get-usage-stats').then((stats: UsageStats) => {
      setUsageStats(stats);
    });
  }, []);

  const handleSave = async () => {
    if (!settings.openaiApiKey) {
      setError('Please enter your OpenAI API key');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const { ipcRenderer } = window.require('electron');
      await ipcRenderer.invoke('save-settings', settings);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
      }, 1500);
    } catch (err) {
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatPollingInterval = (value: number) => {
    return value < 1000 ? `${value}ms` : `${value / 1000}s`;
  };

  useEffect(() => {
    // Auto-save settings when they change
    const saveTimeout = setTimeout(handleSave, 500);
    return () => clearTimeout(saveTimeout);
  }, [settings]);

  return (
    <Box>
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            borderRadius: 2,
          }}
        >
          {error}
        </Alert>
      )}
      {saved && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 2,
            borderRadius: 2,
          }}
        >
          Settings saved successfully!
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <KeyIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="h6">API Configuration</Typography>
          </Box>
          <TextField
            fullWidth
            variant="outlined"
            label="OpenAI API Key"
            type="password"
            value={settings.openaiApiKey}
            onChange={(e) =>
              setSettings({ ...settings, openaiApiKey: e.target.value })
            }
            error={!settings.openaiApiKey}
            helperText={!settings.openaiApiKey ? 'API key is required' : ''}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <SpeedIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="h6">Performance & Cost Settings</Typography>
          </Box>
          
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Rate Limit (requests per minute)
              </Typography>
              <Tooltip title="Maximum number of API requests allowed per minute">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Slider
              value={settings.costSavingSettings.rateLimit}
              onChange={(_, value) =>
                setSettings({
                  ...settings,
                  costSavingSettings: {
                    ...settings.costSavingSettings,
                    rateLimit: value as number,
                  },
                })
              }
              min={1}
              max={60}
              valueLabelDisplay="auto"
              sx={{
                '& .MuiSlider-thumb': {
                  width: 16,
                  height: 16,
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Polling Interval
              </Typography>
              <Tooltip title="Time between each check for new content">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Slider
              value={settings.costSavingSettings.pollingInterval}
              onChange={(_, value) =>
                setSettings({
                  ...settings,
                  costSavingSettings: {
                    ...settings.costSavingSettings,
                    pollingInterval: value as number,
                  },
                })
              }
              min={1000}
              max={30000}
              step={1000}
              valueLabelDisplay="auto"
              valueLabelFormat={formatPollingInterval}
              sx={{
                '& .MuiSlider-thumb': {
                  width: 16,
                  height: 16,
                },
              }}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CachedIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="subtitle1">Caching Settings</Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.costSavingSettings.enableCaching}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      costSavingSettings: {
                        ...settings.costSavingSettings,
                        enableCaching: e.target.checked,
                      },
                    })
                  }
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.main,
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2" color="text.secondary">
                  Enable Suggestion Caching
                </Typography>
              }
            />
          </Box>

          {settings.costSavingSettings.enableCaching && (
            <Box sx={{ mb: 3, ml: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Max Cache Size (entries)
                </Typography>
                <Tooltip title="Maximum number of suggestions to keep in cache">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Slider
                value={settings.costSavingSettings.maxCacheSize}
                onChange={(_, value) =>
                  setSettings({
                    ...settings,
                    costSavingSettings: {
                      ...settings.costSavingSettings,
                      maxCacheSize: value as number,
                    },
                  })
                }
                min={10}
                max={1000}
                step={10}
                valueLabelDisplay="auto"
                sx={{
                  '& .MuiSlider-thumb': {
                    width: 16,
                    height: 16,
                  },
                }}
              />
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <MemoryIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="subtitle1">Usage Statistics</Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 1,
              color: theme.palette.text.secondary,
            }}>
              <Typography variant="body2">
                Requests made: {usageStats.requestCount}
              </Typography>
              <Typography variant="body2">
                Last reset: {new Date(usageStats.lastReset).toLocaleString()}
              </Typography>
            </Box>
          </Box>

          {saving && (
            <Box sx={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
            }}>
              <CircularProgress />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings; 