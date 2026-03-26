import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link as MuiLink,
} from '@mui/material';
import {
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircleOutline as CheckCircleIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

const cardSx = {
  width: '100%',
  maxWidth: 420,
  bgcolor: '#FFFFFF',
  borderRadius: '2px',
  border: '1px solid #CDD0D4',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  p: '40px',
};

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    height: 36,
    borderRadius: '2px',
    fontSize: '0.875rem',
    '& fieldset': { borderColor: '#CDD0D4', borderWidth: '1px' },
    '&:hover fieldset': { borderColor: '#A7AAAD' },
    '&.Mui-focused fieldset': { borderColor: '#BE5953', borderWidth: '1px', boxShadow: '0 0 0 2px rgba(190,89,83,0.15)' },
  },
  '& .MuiInputLabel-root': { display: 'none' },
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) { setError('Please enter your email address'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError('Please enter a valid email address'); return; }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F0F0F1', p: '16px' }}>
      <Box sx={cardSx}>
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
              Check your inbox
            </Typography>
            <Typography sx={{ color: '#50575E', fontSize: '0.875rem', lineHeight: 1.6, mb: '4px' }}>
              We sent reset instructions to
            </Typography>
            <Typography sx={{ fontWeight: 700, color: '#BE5953', fontSize: '0.875rem', mb: '24px' }}>
              {email}
            </Typography>
            <Typography sx={{ color: '#A7AAAD', fontSize: '0.8125rem', lineHeight: 1.6, mb: '24px' }}>
              Didn't receive it? Check your spam folder or try again.
            </Typography>
            <Button fullWidth variant="contained" component={Link} to="/login" startIcon={<ArrowBackIcon />}>
              Back to Sign In
            </Button>
          </Box>
        ) : (
          <>
            <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#1D2327', mb: '4px' }}>
              Forgot password?
            </Typography>
            <Typography sx={{ color: '#787C82', fontSize: '0.875rem', lineHeight: 1.6, mb: '24px' }}>
              Enter your email and we'll send you reset instructions.
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
                  <Typography component="label" htmlFor="email" sx={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1D2327', mb: '6px' }}>
                    Email address
                  </Typography>
                  <TextField
                    id="email" fullWidth type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required autoFocus disabled={loading}
                    placeholder="you@corrados.ca"
                    sx={fieldSx}
                  />
                </Box>

                <Button
                  type="submit" fullWidth variant="contained" disabled={loading}
                  startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <EmailIcon sx={{ fontSize: '16px !important' }} />}
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
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
