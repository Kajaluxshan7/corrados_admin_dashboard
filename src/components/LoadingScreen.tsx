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
        bgcolor: '#1D2327',
        gap: 0,
      }}
    >
      <Box
        component="img"
        src="/corrados-logo.png"
        alt="Corrado's"
        sx={{ height: 40, width: 'auto', objectFit: 'contain', mb: '20px' }}
        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
          e.currentTarget.style.display = 'none';
        }}
      />

      <Typography
        sx={{
          fontFamily: '"Inter", sans-serif',
          fontWeight: 700,
          fontSize: '1.125rem',
          color: '#FFFFFF',
          mb: '4px',
        }}
      >
        Corrado's
      </Typography>
      <Typography
        sx={{
          fontSize: '0.625rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#72777C',
          mb: '24px',
        }}
      >
        Admin Portal
      </Typography>

      <Box sx={{ width: 160 }}>
        <LinearProgress
          sx={{
            height: 2,
            borderRadius: 0,
            bgcolor: 'rgba(255,255,255,0.1)',
            '& .MuiLinearProgress-bar': { bgcolor: '#BE5953', borderRadius: 0 },
          }}
        />
      </Box>
    </Box>
  );
};

export default LoadingScreen;
