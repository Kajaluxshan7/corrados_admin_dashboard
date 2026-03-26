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
  Divider,
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
      setError(
        'Invalid or missing reset token. Please request a new password reset link.',
      );
    }
  }, [searchParams]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'Password must be at least 8 characters long';
    if (!/[A-Z]/.test(pwd))
      return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(pwd))
      return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd))
      return 'Password must contain at least one special character';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!token) {
      setError('Invalid reset token');
      return;
    }
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

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

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#FFFFFF',
      borderRadius: 2,
      '& fieldset': { borderColor: '#EDE0D8', borderWidth: '1.5px' },
      '&:hover fieldset': { borderColor: '#D4817C' },
      '&.Mui-focused fieldset': { borderColor: '#BE5953', borderWidth: '2px' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#BE5953' },
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
            Account Recovery
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
            Create a new
            <br />
            password with
            <br />
            <Box component="span" sx={{ color: '#BE5953' }}>
              confidence.
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
            Choose a strong password to keep your admin account safe and secure.
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

      {/* ── Right panel - form ── */}
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

        <Box sx={{ width: '100%', maxWidth: 400 }}>
          {success ? (
            /* Success state */
            <Box sx={{ textAlign: 'center' }}>
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
                Password reset!
              </Typography>
              <Typography
                sx={{
                  color: '#5C524D',
                  fontSize: '0.938rem',
                  lineHeight: 1.6,
                  mb: 4,
                }}
              >
                Your password has been changed successfully. Redirecting you to
                the sign in page…
              </Typography>
              <Button
                fullWidth
                variant="contained"
                component={Link}
                to="/login"
                startIcon={<ArrowBackIcon />}
                sx={{
                  py: 1.5,
                  fontSize: '0.938rem',
                  fontWeight: 700,
                  borderRadius: 2,
                  backgroundColor: '#2D2926',
                  letterSpacing: '0.04em',
                  '&:hover': { backgroundColor: '#BE5953' },
                  transition: 'background-color 0.2s ease',
                }}
              >
                Go to Sign In
              </Button>
            </Box>
          ) : (
            /* Form state */
            <>
              <Box sx={{ mb: 4 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    backgroundColor: 'rgba(190,89,83,0.1)',
                    border: '1.5px solid rgba(190,89,83,0.2)',
                    mb: 2,
                  }}
                >
                  <LockResetIcon sx={{ color: '#BE5953', fontSize: 20 }} />
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
                    mb: 0.75,
                  }}
                >
                  Set new password
                </Typography>
                <Typography
                  sx={{
                    color: '#5C524D',
                    fontSize: '0.938rem',
                    lineHeight: 1.6,
                  }}
                >
                  Must be at least 8 characters with mixed case, number and
                  symbol.
                </Typography>
              </Box>

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    border: '1px solid rgba(190,89,83,0.2)',
                    bgcolor: '#FAF0EF',
                    color: '#8E3830',
                    '& .MuiAlert-icon': { color: '#BE5953' },
                  }}
                  onClose={() => setError('')}
                >
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="New password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading || !token}
                    required
                    sx={inputSx}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              disabled={loading}
                              sx={{
                                color: '#B0A8A2',
                                '&:hover': {
                                  color: '#BE5953',
                                  bgcolor: 'rgba(190,89,83,0.06)',
                                },
                              }}
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Confirm new password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading || !token}
                    required
                    sx={inputSx}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              edge="end"
                              disabled={loading}
                              sx={{
                                color: '#B0A8A2',
                                '&:hover': {
                                  color: '#BE5953',
                                  bgcolor: 'rgba(190,89,83,0.06)',
                                },
                              }}
                            >
                              {showConfirmPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  {/* Requirements */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #EDE0D8',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#BE5953',
                        mb: 1,
                      }}
                    >
                      Password requirements
                    </Typography>
                    {requirements.map((req) => (
                      <Typography
                        key={req}
                        sx={{
                          color: '#5C524D',
                          fontSize: '0.813rem',
                          lineHeight: 1.8,
                        }}
                      >
                        · {req}
                      </Typography>
                    ))}
                  </Box>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading || !token}
                    startIcon={
                      loading ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <LockResetIcon sx={{ fontSize: '1rem' }} />
                      )
                    }
                    sx={{
                      mt: 0.5,
                      py: 1.5,
                      fontSize: '0.938rem',
                      fontWeight: 700,
                      borderRadius: 2,
                      backgroundColor: '#2D2926',
                      letterSpacing: '0.04em',
                      '&:hover': { backgroundColor: '#BE5953' },
                      '&:disabled': { backgroundColor: '#EDE0D8' },
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    {loading ? 'Resetting…' : 'Reset Password'}
                  </Button>

                  <Box sx={{ textAlign: 'center' }}>
                    <MuiLink
                      component={Link}
                      to="/login"
                      underline="hover"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        fontSize: '0.875rem',
                        color: '#5C524D',
                        fontWeight: 500,
                        '&:hover': { color: '#BE5953' },
                      }}
                    >
                      <ArrowBackIcon sx={{ fontSize: 15 }} />
                      Back to Sign In
                    </MuiLink>
                  </Box>
                </Box>
              </form>
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
