import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

const LoadingScreen: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: '#1D1917',
        gap: 0,
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '14px',
          bgcolor: 'rgba(190,89,83,0.2)',
          border: '1px solid rgba(190,89,83,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2.5,
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src="/corrados-logo.png"
          alt="Corrado's"
          sx={{ height: 44, width: 'auto', objectFit: 'contain' }}
        />
      </Box>

      <Typography
        sx={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontWeight: 700,
          fontSize: '1.2rem',
          color: '#F5EDE4',
          mb: 0.5,
          letterSpacing: '-0.01em',
        }}
      >
        Corrado's
      </Typography>
      <Typography
        sx={{
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#6B5047',
          mb: 3,
        }}
      >
        Admin Portal
      </Typography>

      <Box sx={{ width: 180 }}>
        <LinearProgress
          sx={{
            height: 3,
            borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.1)',
            '& .MuiLinearProgress-bar': { bgcolor: '#BE5953', borderRadius: 2 },
          }}
        />
      </Box>
    </Box>
  );
};

export default LoadingScreen;
