import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Divider,
} from '@mui/material';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircleOutline as CheckCircleIcon,
  ErrorOutline as ErrorIcon,
  MarkEmailRead as MarkEmailReadIcon,
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
          navigate('/login', {
            state: {
              message: 'Email verified successfully! You can now log in.',
            },
          });
        }, 3000);
      } catch (err: any) {
        setSuccess(false);
        setError(
          err.response?.data?.message ||
            'Failed to verify email. The link may have expired.',
        );
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const buttonSx = {
    py: 1.5,
    fontSize: '0.938rem',
    fontWeight: 700,
    borderRadius: 2,
    backgroundColor: '#2D2926',
    letterSpacing: '0.04em',
    '&:hover': { backgroundColor: '#BE5953' },
    transition: 'background-color 0.2s ease',
  };

  const outlinedButtonSx = {
    py: 1.5,
    fontSize: '0.938rem',
    fontWeight: 700,
    borderRadius: 2,
    borderColor: '#EDE0D8',
    color: '#2D2926',
    '&:hover': {
      borderColor: '#BE5953',
      color: '#BE5953',
      bgcolor: 'rgba(190,89,83,0.04)',
    },
  };

  return (
    <Box
      sx={{ minHeight: '100vh', display: 'flex', backgroundColor: '#2D2926' }}
    >
      {/* ── Left panel - brand ── */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: '0 0 45%',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#2D2926',
          p: 6,
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              radial-gradient(circle at 20% 20%, rgba(190,89,83,0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(44,85,48,0.1) 0%, transparent 50%),
              radial-gradient(circle at 60% 30%, rgba(201,169,110,0.08) 0%, transparent 40%)
            `,
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            component="img"
            src="/corrados-logo.png"
            alt="Corrado's Restaurant"
            sx={{
              height: 56,
              width: 'auto',
              filter: 'brightness(0) invert(1)',
              opacity: 0.9,
            }}
          />
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            sx={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#BE5953',
              mb: 2,
            }}
          >
            Account Setup
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Playfair Display", "Georgia", serif',
              fontWeight: 700,
              fontSize: '2.75rem',
              color: '#FFFFFF',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              mb: 3,
            }}
          >
            Verify your
            <br />
            email to get
            <br />
            <Box component="span" sx={{ color: '#BE5953' }}>
              started.
            </Box>
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: '0.95rem',
              lineHeight: 1.7,
              maxWidth: 340,
            }}
          >
            One quick step to confirm your identity and activate your admin
            account.
          </Typography>
          <Box
            sx={{
              mt: 4,
              width: 60,
              height: 2,
              background:
                'linear-gradient(90deg, #BE5953 0%, transparent 100%)',
              borderRadius: 1,
            }}
          />
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.3)',
              fontSize: '0.78rem',
              letterSpacing: '0.04em',
            }}
          >
            Corrado's Restaurant &amp; Bar &nbsp;·&nbsp; Whitby, ON
            &nbsp;·&nbsp; Est. 2010
          </Typography>
        </Box>
      </Box>

      {/* ── Right panel - status ── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FDF8F4',
          p: { xs: 3, sm: 6 },
        }}
      >
        {/* Mobile logo */}
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Box
            component="img"
            src="/corrados-logo.png"
            alt="Corrado's Restaurant"
            sx={{ height: 52, width: 'auto', mb: 1.5 }}
          />
          <Typography
            sx={{
              fontFamily: '"Playfair Display", "Georgia", serif',
              fontWeight: 700,
              color: '#2D2926',
              fontSize: '1.1rem',
            }}
          >
            Corrado's Restaurant
          </Typography>
        </Box>

        <Box sx={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
          {loading ? (
            /* Loading */
            <>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  backgroundColor: 'rgba(190,89,83,0.1)',
                  border: '1.5px solid rgba(190,89,83,0.2)',
                  mb: 3,
                }}
              >
                <MarkEmailReadIcon sx={{ color: '#BE5953', fontSize: 26 }} />
              </Box>
              <CircularProgress
                size={28}
                sx={{ color: '#BE5953', display: 'block', mx: 'auto', mb: 3 }}
              />
              <Typography
                variant="h4"
                sx={{
                  fontFamily: '"Playfair Display", "Georgia", serif',
                  fontWeight: 700,
                  color: '#2D2926',
                  fontSize: { xs: '1.75rem', sm: '2rem' },
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  mb: 1,
                }}
              >
                Verifying your email
              </Typography>
              <Typography
                sx={{ color: '#5C524D', fontSize: '0.938rem', lineHeight: 1.6 }}
              >
                Please wait while we confirm your email address…
              </Typography>
            </>
          ) : success ? (
            /* Success */
            <>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  backgroundColor: 'rgba(44,85,48,0.1)',
                  border: '1.5px solid rgba(44,85,48,0.2)',
                  mb: 3,
                }}
              >
                <CheckCircleIcon sx={{ color: '#2C5530', fontSize: 28 }} />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: '"Playfair Display", "Georgia", serif',
                  fontWeight: 700,
                  color: '#2D2926',
                  fontSize: { xs: '1.75rem', sm: '2rem' },
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  mb: 1,
                }}
              >
                Email verified!
              </Typography>
              <Typography
                sx={{
                  color: '#5C524D',
                  fontSize: '0.938rem',
                  lineHeight: 1.6,
                  mb: 4,
                }}
              >
                {redirecting
                  ? 'Redirecting you to the sign in page…'
                  : 'Your email has been successfully verified. You can now log in.'}
              </Typography>
              {!redirecting && (
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate('/login')}
                  startIcon={<ArrowBackIcon />}
                  sx={buttonSx}
                >
                  Go to Sign In
                </Button>
              )}
              {redirecting && (
                <CircularProgress size={24} sx={{ color: '#BE5953' }} />
              )}
            </>
          ) : (
            /* Error */
            <>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  backgroundColor: '#FAF0EF',
                  border: '1.5px solid rgba(190,89,83,0.2)',
                  mb: 3,
                }}
              >
                <ErrorIcon sx={{ color: '#BE5953', fontSize: 26 }} />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: '"Playfair Display", "Georgia", serif',
                  fontWeight: 700,
                  color: '#2D2926',
                  fontSize: { xs: '1.75rem', sm: '2rem' },
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  mb: 1,
                }}
              >
                Verification failed
              </Typography>
              <Typography
                sx={{
                  color: '#5C524D',
                  fontSize: '0.938rem',
                  lineHeight: 1.6,
                  mb: 1.5,
                }}
              >
                {error}
              </Typography>
              <Typography
                sx={{
                  color: '#B0A8A2',
                  fontSize: '0.813rem',
                  lineHeight: 1.6,
                  mb: 4,
                }}
              >
                Links are valid for 10 minutes. Request a new one below.
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  flexDirection: { xs: 'column', sm: 'row' },
                }}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  to="/login"
                  startIcon={<ArrowBackIcon />}
                  sx={outlinedButtonSx}
                >
                  Sign In
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate('/forgot-password')}
                  startIcon={<RefreshIcon />}
                  sx={buttonSx}
                >
                  Request New Link
                </Button>
              </Box>
            </>
          )}

          <Divider sx={{ my: 3, borderColor: '#EDE0D8' }} />
          <Typography
            sx={{
              textAlign: 'center',
              color: '#B0A8A2',
              fontSize: '0.78rem',
              letterSpacing: '0.04em',
            }}
          >
            Corrado's Restaurant &amp; Bar &nbsp;·&nbsp; Admin Portal
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
