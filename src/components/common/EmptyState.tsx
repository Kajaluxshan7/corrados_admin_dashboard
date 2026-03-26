import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Inbox as InboxIcon } from '@mui/icons-material';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 4,
        textAlign: 'center',
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E4E7',
        borderRadius: '2px',
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '12px',
          bgcolor: 'rgba(190,89,83,0.08)',
          border: '1px solid rgba(190,89,83,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2.5,
          color: 'rgba(190,89,83,0.5)',
          '& svg': { fontSize: 30 },
        }}
      >
        {icon ?? <InboxIcon />}
      </Box>

      <Typography
        sx={{ fontWeight: 700, fontSize: '1rem', color: '#1D2327', mb: 0.75 }}
      >
        {title}
      </Typography>

      {description && (
        <Typography
          sx={{
            fontSize: '0.845rem',
            color: '#787C82',
            maxWidth: 380,
            lineHeight: 1.5,
            mb: action ? 2.5 : 0,
          }}
        >
          {description}
        </Typography>
      )}

      {action && (
        <Button
          variant="contained"
          startIcon={action.icon}
          onClick={action.onClick}
          sx={{
            bgcolor: '#BE5953',
            '&:hover': { bgcolor: '#A84E48' },
            borderRadius: '2px',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.845rem',
            px: 2.5,
            boxShadow: 'none',
          }}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
