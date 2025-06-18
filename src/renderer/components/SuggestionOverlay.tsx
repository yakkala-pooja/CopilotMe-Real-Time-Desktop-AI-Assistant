import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  IconButton, 
  Collapse,
  useTheme,
  Fade,
  Tooltip,
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  Computer as ComputerIcon,
  Mic as MicIcon,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material';
import { Suggestion } from '../types';

interface SuggestionOverlayProps {
  suggestion: Suggestion;
}

const SuggestionOverlay: React.FC<SuggestionOverlayProps> = ({ suggestion }) => {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();

  return (
    <Fade in={true}>
      <Paper
        elevation={6}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          maxWidth: '400px',
          borderRadius: 3,
          overflow: 'hidden',
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(18, 18, 18, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ 
          p: 2,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
        }}>
          <LightbulbIcon 
            sx={{ 
              color: theme.palette.primary.main,
              mt: 0.5,
            }} 
          />
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: 400,
                lineHeight: 1.5,
              }}
            >
              {suggestion.text}
            </Typography>
          </Box>
        </Box>

        {(suggestion.context.screen || suggestion.context.audio) && (
          <>
            <Box 
              sx={{ 
                px: 2, 
                pb: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <Tooltip title={expanded ? "Hide details" : "Show details"}>
                <IconButton 
                  size="small"
                  onClick={() => setExpanded(!expanded)}
                  sx={{
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                >
                  <ExpandMoreIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Collapse in={expanded}>
              <Box 
                sx={{ 
                  px: 2, 
                  pb: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                {suggestion.context.screen && (
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                  }}>
                    <ComputerIcon 
                      sx={{ 
                        color: theme.palette.text.secondary,
                        fontSize: '1.2rem',
                        mt: 0.3,
                      }} 
                    />
                    <Box>
                      <Typography 
                        variant="caption" 
                        component="div"
                        sx={{ 
                          color: theme.palette.text.secondary,
                          fontWeight: 500,
                          mb: 0.5,
                        }}
                      >
                        Active Window
                      </Typography>
                      <Typography 
                        variant="body2"
                        sx={{ mb: 0.5 }}
                      >
                        {suggestion.context.screen.activeWindow.title}
                      </Typography>
                      <Typography 
                        variant="caption"
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        {suggestion.context.screen.activeWindow.app}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {suggestion.context.audio && (
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                  }}>
                    <MicIcon 
                      sx={{ 
                        color: theme.palette.text.secondary,
                        fontSize: '1.2rem',
                        mt: 0.3,
                      }} 
                    />
                    <Box>
                      <Typography 
                        variant="caption" 
                        component="div"
                        sx={{ 
                          color: theme.palette.text.secondary,
                          fontWeight: 500,
                          mb: 0.5,
                        }}
                      >
                        Audio Context
                      </Typography>
                      <Typography variant="body2">
                        {suggestion.context.audio.text}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Collapse>
          </>
        )}
      </Paper>
    </Fade>
  );
};

export default SuggestionOverlay; 