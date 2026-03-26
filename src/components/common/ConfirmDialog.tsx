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
  Error as ErrorIcon,
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
    icon: <ErrorIcon />,
    iconColor: '#BE5953',
    iconBg: 'rgba(190,89,83,0.1)',
    confirmBg: '#BE5953',
    confirmHover: '#A84E48',
  },
  warning: {
    icon: <WarningIcon />,
    iconColor: '#C9A96E',
    iconBg: 'rgba(201,169,110,0.1)',
    confirmBg: '#BE5953',
    confirmHover: '#A84E48',
  },
  info: {
    icon: <InfoIcon />,
    iconColor: '#243A7D',
    iconBg: 'rgba(36,58,125,0.08)',
    confirmBg: '#243A7D',
    confirmHover: '#1A2B5F',
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
            borderRadius: '8px',
            border: '1px solid #E8E0D8',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 2.5,
          pt: 2.5,
          pb: 0,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              bgcolor: cfg.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: cfg.iconColor,
              flexShrink: 0,
              '& svg': { fontSize: 18 },
            }}
          >
            {cfg.icon}
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#1C1917' }}>
            {title}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onCancel}
          disabled={loading}
          sx={{ color: '#9B8B80', mt: -0.25, '&:hover': { color: '#1C1917' } }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2.5, pt: 1.5, pb: 0 }}>
        {typeof message === 'string' ? (
          <Typography sx={{ fontSize: '0.875rem', color: '#6B5C52', lineHeight: 1.55 }}>
            {message}
          </Typography>
        ) : (
          message
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 2, gap: 1 }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          variant="outlined"
          sx={{
            borderRadius: '5px',
            px: 2,
            fontSize: '0.845rem',
            fontWeight: 600,
            textTransform: 'none',
            borderColor: '#EDE0D8',
            color: '#6B5C52',
            '&:hover': { borderColor: '#BE5953', color: '#BE5953', bgcolor: 'transparent' },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : undefined}
          sx={{
            borderRadius: '5px',
            px: 2,
            fontSize: '0.845rem',
            fontWeight: 700,
            textTransform: 'none',
            bgcolor: cfg.confirmBg,
            '&:hover': { bgcolor: cfg.confirmHover },
            '&:disabled': { bgcolor: '#E8E0D8' },
            boxShadow: 'none',
          }}
        >
          {loading ? 'Processing…' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
