import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
} from '@mui/material';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircleOutline as CheckCircleIcon,
  ErrorOutline as ErrorIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { api } from '../utils/api';

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setError('Invalid verification link. No token provided.');
        setLoading(false);
        return;
      }

      try {
        await api.post('/auth/verify-email', { token });
        setSuccess(true);
        setError('');
        setRedirecting(true);
        setTimeout(() => {
          navigate('/login', { state: { message: 'Email verified successfully! You can now log in.' } });
        }, 3000);
      } catch (err: any) {
        setSuccess(false);
        setError(err.response?.data?.message || 'Failed to verify email. The link may have expired.');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F0F0F1', p: '16px' }}>
      <Box sx={{ width: '100%', maxWidth: 420, bgcolor: '#FFFFFF', borderRadius: '2px', border: '1px solid #CDD0D4', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', p: '40px', textAlign: 'center' }}>
        {/* Logo area */}
        <Box sx={{ mb: '32px' }}>
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
            Email Verification
          </Typography>
        </Box>

        {loading ? (
          <>
            <CircularProgress size={28} sx={{ color: '#BE5953', display: 'block', mx: 'auto', mb: '20px' }} />
            <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#1D2327', mb: '8px' }}>
              Verifying your email
            </Typography>
            <Typography sx={{ color: '#50575E', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Please wait while we confirm your email address…
            </Typography>
          </>
        ) : success ? (
          <>
            <CheckCircleIcon sx={{ fontSize: 32, color: '#00A32A', mb: '16px' }} />
            <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#1D2327', mb: '8px' }}>
              Email verified!
            </Typography>
            <Typography sx={{ color: '#50575E', fontSize: '0.875rem', lineHeight: 1.6, mb: '24px' }}>
              {redirecting
                ? 'Redirecting you to the sign in page…'
                : 'Your email has been successfully verified. You can now log in.'}
            </Typography>
            {redirecting ? (
              <CircularProgress size={24} sx={{ color: '#BE5953' }} />
            ) : (
              <Button fullWidth variant="contained" onClick={() => navigate('/login')} startIcon={<ArrowBackIcon />}>
                Go to Sign In
              </Button>
            )}
          </>
        ) : (
          <>
            <ErrorIcon sx={{ fontSize: 32, color: '#D63638', mb: '16px' }} />
            <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#1D2327', mb: '8px' }}>
              Verification failed
            </Typography>
            <Typography sx={{ color: '#50575E', fontSize: '0.875rem', lineHeight: 1.6, mb: '8px' }}>
              {error}
            </Typography>
            <Typography sx={{ color: '#A7AAAD', fontSize: '0.8125rem', lineHeight: 1.6, mb: '24px' }}>
              Links are valid for 10 minutes. Request a new one below.
            </Typography>
            <Box sx={{ display: 'flex', gap: '12px', flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button fullWidth variant="outlined" component={Link} to="/login" startIcon={<ArrowBackIcon />}>
                Sign In
              </Button>
              <Button fullWidth variant="contained" onClick={() => navigate('/forgot-password')} startIcon={<RefreshIcon />}>
                Request New Link
              </Button>
            </Box>
          </>
        )}

        <Typography sx={{ color: '#A7AAAD', fontSize: '0.6875rem', mt: '32px' }}>
          Corrado's Restaurant &amp; Bar · Whitby, ON
        </Typography>
      </Box>
    </Box>
  );
}
