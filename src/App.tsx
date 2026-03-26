import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import AppRoutes from './components/AppRoutes';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#BE5953',
      light: '#D4817C',
      dark: '#8E3830',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#2C5530',
      light: '#4A7A4F',
      dark: '#1A3A1E',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5EDE4',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2D2926',
      secondary: '#5C524D',
      disabled: '#B0A8A2',
    },
    grey: {
      50: '#FDF8F4',
      100: '#F5EDE4',
      200: '#EDE0D5',
      300: '#E0D0C4',
      400: '#C9B8AA',
      500: '#A89080',
      600: '#7A6358',
      700: '#5C4A40',
      800: '#3D3028',
      900: '#2D2926',
    },
    success: {
      main: '#2C5530',
      light: '#4A7A4F',
      dark: '#1A3A1E',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#C9A96E',
      light: '#DFC08A',
      dark: '#A88040',
    },
    error: {
      main: '#EF4444',
      light: '#FCA5A5',
      dark: '#DC2626',
    },
    info: {
      main: '#243A7D',
      light: '#4A62B0',
      dark: '#162558',
    },
    divider: '#EDE0D8',
  },
  typography: {
    fontFamily: '"Lato", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontFamily: '"Playfair Display", "Georgia", serif',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: '#2D2926',
    },
    h2: {
      fontFamily: '"Playfair Display", "Georgia", serif',
      fontWeight: 700,
      letterSpacing: '-0.01em',
      color: '#2D2926',
    },
    h3: {
      fontFamily: '"Playfair Display", "Georgia", serif',
      fontWeight: 600,
      color: '#2D2926',
    },
    h4: {
      fontFamily: '"Playfair Display", "Georgia", serif',
      fontWeight: 600,
      color: '#2D2926',
    },
    h5: {
      fontFamily: '"Lato", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 600,
      color: '#2D2926',
    },
    h6: {
      fontFamily: '"Lato", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 600,
      color: '#2D2926',
    },
    body1: {
      fontFamily: '"Lato", "Helvetica Neue", Arial, sans-serif',
      fontSize: '1rem',
      lineHeight: 1.65,
    },
    body2: {
      fontFamily: '"Lato", "Helvetica Neue", Arial, sans-serif',
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontFamily: '"Lato", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 700,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
    subtitle1: {
      fontFamily: '"Lato", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    subtitle2: {
      fontFamily: '"Lato", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 600,
      fontSize: '0.875rem',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
    },
    caption: {
      fontFamily: '"Lato", "Helvetica Neue", Arial, sans-serif',
      fontSize: '0.75rem',
      lineHeight: 1.4,
    },
  },
  shape: {
    borderRadius: 6,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.05)',
    '0 2px 6px rgba(0,0,0,0.07)',
    '0 4px 12px rgba(0,0,0,0.07)',
    '0 6px 18px rgba(0,0,0,0.08)',
    '0 8px 24px rgba(0,0,0,0.09)',
    '0 12px 32px rgba(0,0,0,0.10)',
    '0 16px 40px rgba(0,0,0,0.11)',
    '0 20px 48px rgba(0,0,0,0.12)',
    '0 24px 56px rgba(0,0,0,0.12)',
    '0 28px 64px rgba(0,0,0,0.12)',
    '0 32px 72px rgba(0,0,0,0.12)',
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
          scrollbarColor: '#D4C8C0 transparent',
        },
        body: {
          fontFamily: '"Lato", "Helvetica Neue", Arial, sans-serif',
          '&::-webkit-scrollbar': { width: '6px', height: '6px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: '#D4C8C0', borderRadius: '3px', '&:hover': { background: '#B0A8A2' } },
        },
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: '#D4C8C0 transparent',
          '&::-webkit-scrollbar': { width: '6px', height: '6px' },
          '&::-webkit-scrollbar-thumb': { background: '#D4C8C0', borderRadius: '3px' },
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
        paper: { zIndex: 1400 },
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
          backgroundColor: '#FFFFFF',
          backgroundImage: 'none',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          borderBottom: '1px solid rgba(190,89,83,0.1)',
          color: '#2D2926',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid rgba(190,89,83,0.08)',
          boxShadow: '2px 0 12px rgba(0,0,0,0.04)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
          border: '1px solid #EDE0D8',
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
          position: 'relative',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 700,
          fontSize: '0.875rem',
          padding: '9px 22px',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
          transition: 'all 0.15s ease',
        },
        contained: {
          backgroundColor: '#BE5953',
          '&:hover': { backgroundColor: '#8E3830' },
        },
        outlined: {
          borderWidth: '1.5px',
          borderColor: '#BE5953',
          color: '#BE5953',
          '&:hover': {
            borderWidth: '1.5px',
            backgroundColor: 'rgba(190,89,83,0.06)',
            borderColor: '#8E3830',
            color: '#8E3830',
          },
        },
        text: {
          color: '#BE5953',
          '&:hover': { backgroundColor: 'rgba(190,89,83,0.06)' },
        },
      },
      defaultProps: { disableElevation: true },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 5,
          fontWeight: 600,
          fontSize: '0.8rem',
          height: '26px',
        },
        filled: {
          backgroundColor: 'rgba(190,89,83,0.09)',
          color: '#8E3830',
          border: '1px solid rgba(190,89,83,0.15)',
        },
        outlined: {
          borderWidth: '1.5px',
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
          boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
          border: '1px solid #EDE0D8',
        },
        elevation2: {
          boxShadow: '0 4px 14px rgba(0,0,0,0.07)',
          border: '1px solid #EDE0D8',
        },
        elevation3: {
          boxShadow: '0 8px 24px rgba(0,0,0,0.09)',
          border: '1px solid rgba(190,89,83,0.1)',
        },
        rounded: { borderRadius: 10 },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          transition: 'background-color 0.15s ease',
          '&.Mui-selected': {
            backgroundColor: 'rgba(190,89,83,0.08)',
            '&:hover': { backgroundColor: 'rgba(190,89,83,0.12)' },
          },
          '&:hover': { backgroundColor: 'rgba(190,89,83,0.05)' },
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: '"Playfair Display", "Georgia", serif',
          fontWeight: 700,
          fontSize: '1.05rem',
          color: '#2D2926',
          letterSpacing: '-0.01em',
          padding: '20px 24px 10px',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '12px 24px',
          '& .MuiTextField-root': { marginBottom: 0 },
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '12px 24px 20px',
          gap: 8,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        root: { zIndex: 1300 },
        paper: {
          borderRadius: 10,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          border: '1px solid #EDE0D8',
          background: '#FFFFFF',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
            backgroundColor: '#FFFFFF',
            '& fieldset': {
              borderColor: '#E0D4CC',
              borderWidth: '1.5px',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(190,89,83,0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#BE5953',
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#BE5953',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        outlined: {
          borderRadius: 6,
        },
      },
      defaultProps: {
        MenuProps: { sx: { zIndex: 1400 } },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 3,
          backgroundColor: 'rgba(190,89,83,0.1)',
          height: 4,
        },
        bar: { borderRadius: 3 },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(45,41,38,0.45)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#FDFAF8',
          '& .MuiTableCell-root': {
            fontWeight: 700,
            color: '#A89080',
            fontSize: '0.66rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            borderBottom: '1px solid #EDE0D8',
            paddingTop: 10,
            paddingBottom: 10,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #F5EDE4',
          color: '#2D2926',
          fontSize: '0.875rem',
          padding: '12px 16px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.1s ease',
          '&:hover': {
            backgroundColor: '#FDFAF8',
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
          fontFamily: '"Lato", "Helvetica Neue", Arial, sans-serif',
          fontWeight: 600,
          textTransform: 'none',
          letterSpacing: '0.02em',
          fontSize: '0.875rem',
          minHeight: 44,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#BE5953',
          height: 2,
          borderRadius: 1,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: '#BE5953',
            '& + .MuiSwitch-track': { backgroundColor: '#BE5953' },
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          fontSize: '0.875rem',
          color: '#2D2926',
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <ScrollToTop />
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
