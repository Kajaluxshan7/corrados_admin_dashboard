import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  severity?: 'error' | 'warning' | 'info';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const SEVERITY_CONFIG = {
  error: {
    icon: <DeleteIcon sx={{ fontSize: 32, color: '#D63638' }} />,
    confirmBg: '#D63638',
    confirmHover: '#A62527',
  },
  warning: {
    icon: <WarningIcon sx={{ fontSize: 32, color: '#DBA617' }} />,
    confirmBg: '#BE5953',
    confirmHover: '#9A413C',
  },
  info: {
    icon: <InfoIcon sx={{ fontSize: 32, color: '#0073AA' }} />,
    confirmBg: '#0073AA',
    confirmHover: '#005177',
  },
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  severity = 'error',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const cfg = SEVERITY_CONFIG[severity];

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '2px',
            border: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            maxWidth: 400,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: '#1D2327',
          color: '#FFFFFF',
          fontWeight: 700,
          fontSize: '1.125rem',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {title}
        <IconButton
          size="small"
          onClick={onCancel}
          disabled={loading}
          sx={{ color: '#FFFFFF', borderRadius: '2px', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: '24px', pt: '24px', pb: 0, bgcolor: '#FFFFFF' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
          {cfg.icon}
          {typeof message === 'string' ? (
            <Typography sx={{ fontSize: '0.875rem', color: '#50575E', lineHeight: 1.55 }}>
              {message}
            </Typography>
          ) : (
            message
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: '24px', py: '12px', gap: '8px', bgcolor: '#F6F7F7', borderTop: '1px solid #E2E4E7' }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          variant="outlined"
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : undefined}
          sx={{
            bgcolor: cfg.confirmBg,
            '&:hover': { bgcolor: cfg.confirmHover },
            '&:disabled': { bgcolor: '#E2E4E7' },
          }}
        >
          {loading ? 'Processing…' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
