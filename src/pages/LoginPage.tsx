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
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
    const state = location.state as { message?: string } | null;
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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#F0F0F1',
        p: '16px',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 420,
          bgcolor: '#FFFFFF',
          borderRadius: '2px',
          border: '1px solid #CDD0D4',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          p: '40px',
        }}
      >
        {/* Logo area */}
        <Box sx={{ mb: '32px', textAlign: 'center' }}>
          <Box
            component="img"
            src="/corrados-logo.png"
            alt="Corrado's"
            sx={{ height: 48, width: 'auto', objectFit: 'contain', mb: '12px', display: 'block', mx: 'auto' }}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <Typography
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontWeight: 700,
              fontSize: '1.125rem',
              color: '#1D2327',
              lineHeight: 1.3,
            }}
          >
            Corrado's Admin
          </Typography>
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#787C82',
              mt: '2px',
            }}
          >
            Restaurant Management Portal
          </Typography>
        </Box>

        {flashMessage && (
          <Alert
            severity="success"
            onClose={() => setFlashMessage('')}
            sx={{
              mb: '20px',
              borderRadius: '2px',
              borderLeft: '3px solid #00A32A',
              fontSize: '0.875rem',
            }}
          >
            {flashMessage}
          </Alert>
        )}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError('')}
            sx={{
              mb: '20px',
              borderRadius: '2px',
              borderLeft: '3px solid #D63638',
              bgcolor: '#FCEEEE',
              color: '#D63638',
              fontSize: '0.875rem',
              '& .MuiAlert-icon': { color: '#D63638' },
            }}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Box>
              <Typography
                component="label"
                htmlFor="email"
                sx={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1D2327', mb: '6px' }}
              >
                Email address
              </Typography>
              <TextField
                id="email"
                fullWidth
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                disabled={loading}
                placeholder="you@corrados.ca"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 36,
                    borderRadius: '2px',
                    fontSize: '0.875rem',
                    '& fieldset': { borderColor: '#CDD0D4', borderWidth: '1px' },
                    '&:hover fieldset': { borderColor: '#A7AAAD' },
                    '&.Mui-focused fieldset': { borderColor: '#BE5953', borderWidth: '1px', boxShadow: '0 0 0 2px rgba(190,89,83,0.15)' },
                  },
                  '& .MuiInputLabel-root': { display: 'none' },
                }}
              />
            </Box>

            <Box>
              <Typography
                component="label"
                htmlFor="password"
                sx={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1D2327', mb: '6px' }}
              >
                Password
              </Typography>
              <TextField
                id="password"
                fullWidth
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="••••••••"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 36,
                    borderRadius: '2px',
                    fontSize: '0.875rem',
                    '& fieldset': { borderColor: '#CDD0D4', borderWidth: '1px' },
                    '&:hover fieldset': { borderColor: '#A7AAAD' },
                    '&.Mui-focused fieldset': { borderColor: '#BE5953', borderWidth: '1px', boxShadow: '0 0 0 2px rgba(190,89,83,0.15)' },
                  },
                  '& .MuiInputLabel-root': { display: 'none' },
                }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          disabled={loading}
                          sx={{ color: '#787C82', borderRadius: '2px', '&:hover': { color: '#1D2327', bgcolor: '#F0F0F1' } }}
                        >
                          {showPassword ? <VisibilityOff sx={{ fontSize: 16 }} /> : <Visibility sx={{ fontSize: 16 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <MuiLink
                component={RouterLink}
                to="/forgot-password"
                underline="hover"
                sx={{ fontSize: '0.8125rem', color: '#0073AA', '&:hover': { color: '#BE5953' } }}
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
                bgcolor: '#BE5953',
                '&:hover': { bgcolor: '#A84E48' },
                '&:disabled': { bgcolor: '#E2E4E7' },
                borderRadius: '2px',
                height: 36,
                fontSize: '0.8125rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: 'none',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </Box>
        </form>

        <Typography sx={{ textAlign: 'center', color: '#A7AAAD', fontSize: '0.6875rem', mt: '24px' }}>
          Corrado's Restaurant &amp; Bar · Whitby, ON
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;
