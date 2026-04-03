import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import AppRoutes from './components/AppRoutes';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#BE5953',
      light: '#D48680',
      dark: '#9A413C',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#50575E',
      light: '#787C82',
      dark: '#1D2327',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F0F0F1',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1D2327',
      secondary: '#50575E',
      disabled: '#A7AAAD',
    },
    grey: {
      50: '#FAFAFA',
      100: '#F6F7F7',
      200: '#F0F0F1',
      300: '#E2E4E7',
      400: '#CDD0D4',
      500: '#A7AAAD',
      600: '#787C82',
      700: '#50575E',
      800: '#2C3338',
      900: '#1D2327',
    },
    success: {
      main: '#00A32A',
      light: '#EEF7EE',
      dark: '#007A1F',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#DBA617',
      light: '#FEF8EE',
      dark: '#996800',
    },
    error: {
      main: '#D63638',
      light: '#FCEEEE',
      dark: '#A62527',
    },
    info: {
      main: '#0073AA',
      light: '#EEF5FA',
      dark: '#005177',
    },
    divider: '#E2E4E7',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
    h1: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 700,
      fontSize: '1.375rem',
      lineHeight: 1.3,
      color: '#1D2327',
    },
    h2: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 700,
      fontSize: '1.125rem',
      lineHeight: 1.3,
      color: '#1D2327',
    },
    h3: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.4,
      color: '#1D2327',
    },
    h4: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: '0.875rem',
      lineHeight: 1.4,
      color: '#1D2327',
    },
    h5: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: '0.875rem',
      color: '#1D2327',
    },
    h6: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: '0.875rem',
      color: '#1D2327',
    },
    body1: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    body2: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '0.8125rem',
      lineHeight: 1.5,
    },
    button: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: '0.8125rem',
      textTransform: 'none',
      letterSpacing: '0',
    },
    subtitle1: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    subtitle2: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: '0.75rem',
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
    },
    caption: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '0.6875rem',
      lineHeight: 1.4,
    },
  },
  shape: {
    borderRadius: 0,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)',
    '0 2px 8px rgba(0,0,0,0.08)',
    '0 4px 12px rgba(0,0,0,0.08)',
    '0 4px 16px rgba(0,0,0,0.12)',
    '0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)',
    '0 8px 24px rgba(0,0,0,0.15)',
    '0 12px 32px rgba(0,0,0,0.15)',
    '0 16px 40px rgba(0,0,0,0.15)',
    '0 20px 48px rgba(0,0,0,0.15)',
    '0 24px 56px rgba(0,0,0,0.15)',
    '0 28px 64px rgba(0,0,0,0.15)',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
  ],
  zIndex: {
    mobileStepper: 1000,
    fab: 1050,
    speedDial: 1050,
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 99999,
    tooltip: 1600,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          scrollbarWidth: 'thin',
          scrollbarColor: '#CDD0D4 transparent',
        },
        body: {
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          '&::-webkit-scrollbar': { width: '6px', height: '6px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: '#CDD0D4', borderRadius: '0', '&:hover': { background: '#A7AAAD' } },
        },
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: '#CDD0D4 transparent',
          '&::-webkit-scrollbar': { width: '6px', height: '6px' },
          '&::-webkit-scrollbar-thumb': { background: '#CDD0D4', borderRadius: '0' },
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: { zIndex: 99999 },
      },
      defaultProps: {
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
      },
    },
    MuiModal: {
      styleOverrides: { root: { zIndex: 1300 } },
    },
    MuiMenu: {
      styleOverrides: {
        root: { zIndex: 1400 },
        paper: {
          zIndex: 1400,
          borderRadius: '2px',
          border: '1px solid #E2E4E7',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          '& .MuiMenuItem-root': {
            fontSize: '0.875rem',
            '&:hover': { backgroundColor: '#F6F7F7' },
          },
        },
      },
    },
    MuiPopover: {
      styleOverrides: { root: { zIndex: 1400 } },
    },
    MuiAutocomplete: {
      defaultProps: {
        slotProps: {
          popper: { sx: { zIndex: 1400 } },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: { popper: { zIndex: 1500 } },
    },
    MuiPopper: {
      styleOverrides: { root: { zIndex: 1400 } },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1D2327',
          backgroundImage: 'none',
          boxShadow: 'none',
          borderBottom: 'none',
          color: '#FFFFFF',
          height: '46px',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1D2327',
          borderRight: 'none',
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '2px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)',
          border: '1px solid #E2E4E7',
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
          position: 'relative',
          transition: 'border-color 150ms ease',
          '&:hover': {
            borderColor: '#CDD0D4',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '2px',
          fontWeight: 600,
          fontSize: '0.8125rem',
          padding: '0 14px',
          height: '32px',
          minHeight: '32px',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
          transition: 'background-color 100ms ease, border-color 100ms ease, color 100ms ease',
        },
        contained: {
          backgroundColor: '#BE5953',
          color: '#FFFFFF',
          '&:hover': { backgroundColor: '#9A413C' },
          '&:active': { backgroundColor: '#7E3330' },
        },
        outlined: {
          borderWidth: '1px',
          borderColor: '#CDD0D4',
          color: '#1D2327',
          backgroundColor: 'transparent',
          '&:hover': {
            borderWidth: '1px',
            backgroundColor: '#F6F7F7',
            borderColor: '#A7AAAD',
          },
        },
        text: {
          color: '#0073AA',
          '&:hover': { backgroundColor: '#F6F7F7', textDecoration: 'underline' },
        },
        containedError: {
          backgroundColor: '#D63638',
          '&:hover': { backgroundColor: '#A62527' },
        },
      },
      defaultProps: { disableElevation: true },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: '2px',
          color: '#787C82',
          '&:hover': {
            color: '#1D2327',
            backgroundColor: '#F0F0F1',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '2px',
          fontWeight: 700,
          fontSize: '0.6875rem',
          height: '22px',
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
        },
        filled: {
          backgroundColor: '#F0F0F1',
          color: '#50575E',
          border: '1px solid #CDD0D4',
        },
        outlined: {
          borderWidth: '1px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#FFFFFF',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)',
          border: '1px solid #E2E4E7',
        },
        elevation2: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #E2E4E7',
        },
        elevation3: {
          boxShadow: '0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)',
          border: 'none',
        },
        rounded: { borderRadius: '2px' },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '0',
          transition: 'background-color 100ms ease',
          '&.Mui-selected': {
            backgroundColor: '#BE5953',
            color: '#FFFFFF',
            '& .MuiListItemIcon-root': { color: '#FFFFFF' },
            '& .MuiListItemText-primary': { color: '#FFFFFF' },
            '&:hover': { backgroundColor: '#9A413C' },
          },
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.07)' },
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: '"Inter", sans-serif',
          fontWeight: 700,
          fontSize: '1.125rem',
          color: '#FFFFFF',
          backgroundColor: '#1D2327',
          padding: '16px 24px',
          letterSpacing: '0',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '24px',
          backgroundColor: '#FFFFFF',
          '& .MuiTextField-root': { marginBottom: 0 },
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '12px 24px',
          gap: 8,
          backgroundColor: '#F6F7F7',
          borderTop: '1px solid #E2E4E7',
          justifyContent: 'flex-end',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        root: { zIndex: 1300 },
        paper: {
          borderRadius: '2px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          border: 'none',
          background: '#FFFFFF',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '2px',
            backgroundColor: '#FFFFFF',
            fontSize: '0.875rem',
            height: '36px',
            '& fieldset': {
              borderColor: '#CDD0D4',
              borderWidth: '1px',
            },
            '&:hover fieldset': {
              borderColor: '#A7AAAD',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#BE5953',
              borderWidth: '1px',
              boxShadow: '0 0 0 2px rgba(190,89,83,0.15)',
            },
            '&.MuiInputBase-multiline': {
              height: 'auto',
              minHeight: '100px',
            },
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#1D2327',
            transform: 'none',
            position: 'static',
            '&.Mui-focused': {
              color: '#1D2327',
            },
          },
          '& .MuiFormHelperText-root': {
            fontSize: '0.75rem',
            color: '#787C82',
            marginTop: '4px',
            '&.Mui-error': { color: '#D63638' },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        outlined: {
          borderRadius: '2px',
          fontSize: '0.875rem',
        },
      },
      defaultProps: {
        MenuProps: { sx: { zIndex: 1400 } },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: '0',
          backgroundColor: '#E2E4E7',
          height: 3,
        },
        bar: { borderRadius: '0' },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F6F7F7',
          '& .MuiTableCell-root': {
            fontWeight: 700,
            color: '#50575E',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            borderBottom: '1px solid #CDD0D4',
            paddingTop: 10,
            paddingBottom: 10,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #F0F0F1',
          color: '#1D2327',
          fontSize: '0.875rem',
          padding: '0 16px',
          height: '44px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 150ms ease',
          '&:hover': {
            backgroundColor: '#F6F7F7',
          },
          '&.Mui-selected': {
            backgroundColor: '#F0F6FC',
          },
          '&:last-child td': {
            borderBottom: 'none',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: '"Inter", sans-serif',
          fontWeight: 600,
          textTransform: 'none',
          letterSpacing: '0',
          fontSize: '0.8125rem',
          minHeight: 40,
          color: '#50575E',
          '&.Mui-selected': {
            color: '#BE5953',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: '#F6F7F7',
          borderBottom: '1px solid #E2E4E7',
          minHeight: 40,
        },
        indicator: {
          backgroundColor: '#BE5953',
          height: 2,
          borderRadius: '0',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 36,
          height: 20,
          padding: 0,
          '& .MuiSwitch-switchBase': {
            padding: 2,
            '&.Mui-checked': {
              transform: 'translateX(16px)',
              color: '#FFFFFF',
              '& + .MuiSwitch-track': { backgroundColor: '#BE5953', opacity: 1 },
            },
          },
          '& .MuiSwitch-thumb': {
            width: 16,
            height: 16,
            borderRadius: '2px',
          },
          '& .MuiSwitch-track': {
            borderRadius: '2px',
            backgroundColor: '#CDD0D4',
            opacity: 1,
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          fontSize: '0.875rem',
          color: '#1D2327',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          borderRadius: '0',
          color: '#CDD0D4',
          '&.Mui-checked': { color: '#BE5953' },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#E2E4E7',
        },
      },
    },
  },
});

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <ScrollToTop />
          <AuthProvider>
            <WebSocketProvider>
              <ToastProvider>
                <AppRoutes />
              </ToastProvider>
            </WebSocketProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
