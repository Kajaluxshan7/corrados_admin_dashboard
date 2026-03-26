import React from 'react';
import { Box, CircularProgress, Typography, LinearProgress } from '@mui/material';

interface LoadingStateProps {
  message?: string;
  variant?: 'circular' | 'linear' | 'skeleton';
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading…',
  variant = 'circular',
  size = 'medium',
  fullScreen = false,
}) => {
  const sizeMap = { small: 28, medium: 44, large: 60 };
  const sz = sizeMap[size];

  const containerSx = fullScreen
    ? {
        position: 'fixed' as const,
        inset: 0,
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(253,248,244,0.9)',
        zIndex: 9999,
        gap: 2,
      }
    : {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        gap: 2,
      };

  return (
    <Box sx={containerSx}>
      {variant === 'linear' ? (
        <Box sx={{ width: '100%', maxWidth: 320 }}>
          <LinearProgress
            sx={{
              height: 3,
              borderRadius: 2,
              backgroundColor: 'rgba(190,89,83,0.12)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 2,
                backgroundColor: '#BE5953',
              },
            }}
          />
        </Box>
      ) : (
        <CircularProgress
          size={sz}
          thickness={3.5}
          sx={{ color: '#BE5953' }}
        />
      )}
      {message && (
        <Typography
          sx={{
            color: '#8B9D77',
            fontSize: size === 'small' ? '0.813rem' : '0.938rem',
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingState;
