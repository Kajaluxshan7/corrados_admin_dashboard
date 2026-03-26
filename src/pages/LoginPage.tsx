import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  LockOutlined as LockIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Shared field style for enterprise-clean fields
const fieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#FFFFFF',
    borderRadius: '5px',
    fontSize: '0.875rem',
    '& fieldset': { borderColor: '#E8E0D8', borderWidth: '1.5px' },
    '&:hover fieldset': { borderColor: '#BE5953' },
    '&.Mui-focused fieldset': { borderColor: '#BE5953', borderWidth: '2px' },
  },
  '& .MuiInputLabel-root': { fontSize: '0.875rem' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#BE5953' },
};

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [flashMessage, setFlashMessage] = useState('');

  const { login } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const state = location.state as any;
    if (state?.message) {
      setFlashMessage(state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#F0EBE4' }}>

      {/* ── Left brand panel ─────────────────────────────── */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          flex: '0 0 420px',
          flexDirection: 'column',
          justifyContent: 'space-between',
          bgcolor: '#1D1917',
          p: 5,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 20% 80%, rgba(190,89,83,0.18) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(201,169,110,0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        {/* Logo */}
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40, height: 40,
              borderRadius: '9px',
              bgcolor: 'rgba(190,89,83,0.2)',
              border: '1px solid rgba(190,89,83,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <Box component="img" src="/corrados-logo.png" alt="C" sx={{ height: 28, objectFit: 'contain' }} />
          </Box>
          <Box>
            <Typography sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: '1rem', color: '#F5EDE4', lineHeight: 1.2 }}>
              Corrado's
            </Typography>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#6B5047' }}>
              Admin Portal
            </Typography>
          </Box>
        </Box>

        {/* Brand statement */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#BE5953', mb: 2 }}>
            Restaurant Management
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontWeight: 700,
              fontSize: '2.25rem',
              color: '#FFFFFF',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              mb: 2,
            }}
          >
            Manage your<br />restaurant with<br />
            <Box component="span" sx={{ color: '#BE5953' }}>elegance.</Box>
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', lineHeight: 1.65, maxWidth: 300 }}>
            Control your menu, specials, events, and communicate with guests — all from one place.
          </Typography>
          <Box sx={{ mt: 3.5, width: 48, height: 2, bgcolor: '#BE5953', borderRadius: 1 }} />
        </Box>

        {/* Footer */}
        <Typography sx={{ position: 'relative', zIndex: 1, color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem' }}>
          Corrado's Restaurant &amp; Bar · Whitby, ON · Est. 2010
        </Typography>
      </Box>

      {/* ── Right form panel ─────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 3, sm: 5 },
          bgcolor: '#F0EBE4',
        }}
      >
        {/* Mobile logo */}
        <Box sx={{ display: { xs: 'flex', lg: 'none' }, flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box sx={{ width: 52, height: 52, borderRadius: '12px', bgcolor: '#1D1917', border: '1px solid rgba(190,89,83,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5, overflow: 'hidden' }}>
            <Box component="img" src="/corrados-logo.png" alt="C" sx={{ height: 36, objectFit: 'contain' }} />
          </Box>
          <Typography sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, color: '#1C1917', fontSize: '1.1rem' }}>
            Corrado's Admin Portal
          </Typography>
        </Box>

        {/* Card */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 420,
            bgcolor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #E8E0D8',
            boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
            overflow: 'hidden',
          }}
        >
          {/* Card header */}
          <Box
            sx={{
              px: 3.5,
              py: 3,
              borderBottom: '1px solid #F0EBE4',
              bgcolor: '#FDFAF8',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Box sx={{ width: 32, height: 32, borderRadius: '7px', bgcolor: 'rgba(190,89,83,0.1)', border: '1px solid rgba(190,89,83,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LockIcon sx={{ fontSize: 15, color: '#BE5953' }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.975rem', color: '#1C1917', lineHeight: 1.2 }}>
                Sign In
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#9B8B80' }}>
                Access your admin dashboard
              </Typography>
            </Box>
          </Box>

          <Box sx={{ px: 3.5, py: 3 }}>
            {flashMessage && (
              <Alert severity="success" sx={{ mb: 2.5, borderRadius: '5px', fontSize: '0.845rem' }} onClose={() => setFlashMessage('')}>
                {flashMessage}
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: '5px', fontSize: '0.845rem' }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  disabled={loading}
                  size="small"
                  sx={fieldSx}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  size="small"
                  sx={fieldSx}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                            disabled={loading}
                            sx={{ color: '#9B8B80', '&:hover': { color: '#BE5953' } }}
                          >
                            {showPassword ? <VisibilityOff sx={{ fontSize: 17 }} /> : <Visibility sx={{ fontSize: 17 }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <MuiLink
                    component={RouterLink}
                    to="/forgot-password"
                    underline="hover"
                    sx={{ fontSize: '0.8rem', color: '#9B8B80', '&:hover': { color: '#BE5953' } }}
                  >
                    Forgot password?
                  </MuiLink>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <LoginIcon sx={{ fontSize: '16px !important' }} />}
                  sx={{
                    bgcolor: '#1D1917',
                    '&:hover': { bgcolor: '#BE5953' },
                    '&:disabled': { bgcolor: '#E8E0D8' },
                    borderRadius: '5px',
                    py: 1.125,
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    letterSpacing: '0.01em',
                    boxShadow: 'none',
                  }}
                >
                  {loading ? 'Signing in…' : 'Sign In'}
                </Button>
              </Box>
            </form>

            <Divider sx={{ my: 2.5, borderColor: '#F0EBE4' }} />
            <Typography sx={{ textAlign: 'center', color: '#C4BBB5', fontSize: '0.72rem' }}>
              Corrado's Restaurant &amp; Bar · Admin Portal
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
