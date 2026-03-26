import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Link as MuiLink,
} from '@mui/material';
import {
  LockReset as LockResetIcon,
  Visibility,
  VisibilityOff,
  CheckCircleOutline as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';

const requirements = [
  'At least 8 characters',
  'One uppercase letter (A-Z)',
  'One lowercase letter (a-z)',
  'One number (0-9)',
  'One special character (!@#$%^&*)',
];

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    height: 36,
    borderRadius: '2px',
    fontSize: '0.875rem',
    backgroundColor: '#FFFFFF',
    '& fieldset': { borderColor: '#CDD0D4', borderWidth: '1px' },
    '&:hover fieldset': { borderColor: '#A7AAAD' },
    '&.Mui-focused fieldset': { borderColor: '#BE5953', borderWidth: '1px', boxShadow: '0 0 0 2px rgba(190,89,83,0.15)' },
  },
  '& .MuiInputLabel-root': { display: 'none' },
};

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [searchParams]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'Password must be at least 8 characters long';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return 'Password must contain at least one special character';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!token) { setError('Invalid reset token'); return; }
    if (!password || !confirmPassword) { setError('Please fill in all fields'); return; }
    const passwordError = validatePassword(password);
    if (passwordError) { setError(passwordError); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      let errorMessage = 'Failed to reset password. The link may have expired.';
      if (err.message) errorMessage = err.message;
      else if (err.response?.data?.message) {
        const msg = err.response.data.message;
        errorMessage = Array.isArray(msg) ? msg.join('. ') : msg;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F0F0F1', p: '16px' }}>
      <Box sx={{ width: '100%', maxWidth: 420, bgcolor: '#FFFFFF', borderRadius: '2px', border: '1px solid #CDD0D4', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', p: '40px' }}>
        {/* Logo area */}
        <Box sx={{ mb: '32px', textAlign: 'center' }}>
          <Box
            component="img"
            src="/corrados-logo.png"
            alt="Corrado's"
            sx={{ height: 48, width: 'auto', objectFit: 'contain', mb: '12px', display: 'block', mx: 'auto' }}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }}
          />
          <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: '1.125rem', color: '#1D2327' }}>
            Corrado's Admin
          </Typography>
          <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#787C82', mt: '2px' }}>
            Restaurant Management Portal
          </Typography>
        </Box>

        {success ? (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 32, color: '#00A32A', mb: '16px' }} />
            <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#1D2327', mb: '8px' }}>
              Password reset!
            </Typography>
            <Typography sx={{ color: '#50575E', fontSize: '0.875rem', lineHeight: 1.6, mb: '24px' }}>
              Your password has been changed successfully. Redirecting to sign in…
            </Typography>
            <CircularProgress size={24} sx={{ color: '#BE5953' }} />
          </Box>
        ) : (
          <>
            <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#1D2327', mb: '4px' }}>
              Set new password
            </Typography>
            <Typography sx={{ color: '#787C82', fontSize: '0.875rem', lineHeight: 1.6, mb: '24px' }}>
              Must be at least 8 characters with mixed case, number and symbol.
            </Typography>

            {error && (
              <Alert severity="error" onClose={() => setError('')}
                sx={{ mb: '20px', borderRadius: '2px', borderLeft: '3px solid #D63638', bgcolor: '#FCEEEE', color: '#D63638', fontSize: '0.875rem', '& .MuiAlert-icon': { color: '#D63638' } }}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Box>
                  <Typography component="label" htmlFor="password" sx={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1D2327', mb: '6px' }}>
                    New password
                  </Typography>
                  <TextField
                    id="password" fullWidth type={showPassword ? 'text' : 'password'}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    disabled={loading || !token} required sx={fieldSx}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" disabled={loading}
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

                <Box>
                  <Typography component="label" htmlFor="confirmPassword" sx={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1D2327', mb: '6px' }}>
                    Confirm new password
                  </Typography>
                  <TextField
                    id="confirmPassword" fullWidth type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading || !token} required sx={fieldSx}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small" disabled={loading}
                              sx={{ color: '#787C82', borderRadius: '2px', '&:hover': { color: '#1D2327', bgcolor: '#F0F0F1' } }}
                            >
                              {showConfirmPassword ? <VisibilityOff sx={{ fontSize: 16 }} /> : <Visibility sx={{ fontSize: 16 }} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Box>

                {/* Requirements */}
                <Box sx={{ p: '12px', borderRadius: '2px', bgcolor: '#FAFAFA', border: '1px solid #E2E4E7' }}>
                  <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#787C82', mb: '6px' }}>
                    Password requirements
                  </Typography>
                  {requirements.map((req) => (
                    <Typography key={req} sx={{ color: '#50575E', fontSize: '0.8125rem', lineHeight: 1.8 }}>
                      · {req}
                    </Typography>
                  ))}
                </Box>

                <Button
                  type="submit" fullWidth variant="contained" disabled={loading || !token}
                  startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <LockResetIcon sx={{ fontSize: '16px !important' }} />}
                >
                  {loading ? 'Resetting…' : 'Reset Password'}
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <MuiLink component={Link} to="/login" underline="hover"
                    sx={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8125rem', color: '#50575E', '&:hover': { color: '#BE5953' } }}
                  >
                    <ArrowBackIcon sx={{ fontSize: 14 }} />
                    Back to Sign In
                  </MuiLink>
                </Box>
              </Box>
            </form>
          </>
        )}

        <Typography sx={{ textAlign: 'center', color: '#A7AAAD', fontSize: '0.6875rem', mt: '24px' }}>
          Corrado's Restaurant &amp; Bar · Whitby, ON
        </Typography>
      </Box>
    </Box>
  );
}
