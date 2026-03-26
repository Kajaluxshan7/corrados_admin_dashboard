/**
 * Standard Colors for Corrado's Restaurant Admin Dashboard
 * Brand palette aligned with corrados_frontend theme
 */

export const STANDARD_COLORS = {
  // Status Colors (Industry Standard)
  status: {
    active: {
      main: '#2C5530', // Olive green - brand secondary
      light: '#EEF4EE',
      dark: '#1A3A1E',
      contrast: '#FFFFFF',
    },
    inactive: {
      main: '#9E9E9E',
      light: '#F5F5F5',
      dark: '#616161',
      contrast: '#FFFFFF',
    },
    open: {
      main: '#2C5530',
      light: '#EEF4EE',
      dark: '#1A3A1E',
      contrast: '#FFFFFF',
    },
    closed: {
      main: '#BE5953', // Terracotta - brand primary
      light: '#FAF0EF',
      dark: '#8E3830',
      contrast: '#FFFFFF',
    },
    pending: {
      main: '#C9A96E', // Warm gold
      light: '#FAF5EC',
      dark: '#A88040',
      contrast: '#2D2926',
    },
    warning: {
      main: '#C9A96E',
      light: '#FAF5EC',
      dark: '#A88040',
      contrast: '#2D2926',
    },
    error: {
      main: '#BE5953',
      light: '#FAF0EF',
      dark: '#8E3830',
      contrast: '#FFFFFF',
    },
    success: {
      main: '#2C5530',
      light: '#EEF4EE',
      dark: '#1A3A1E',
      contrast: '#FFFFFF',
    },
    info: {
      main: '#243A7D', // Brand navy
      light: '#EEF1FA',
      dark: '#162558',
      contrast: '#FFFFFF',
    },
  },

  // Brand Colors - Corrado's Restaurant
  brand: {
    primary: {
      main: '#BE5953', // Terracotta red
      light: '#D4817C',
      dark: '#8E3830',
      contrast: '#FFFFFF',
    },
    secondary: {
      main: '#2C5530', // Deep olive green
      light: '#4A7A4F',
      dark: '#1A3A1E',
      contrast: '#FFFFFF',
    },
    gold: '#C9A96E',
    sage: '#8B9D77',
    navy: '#243A7D',
    wine: '#722F37',
  },

  // UI Colors - Warm Italian editorial theme
  ui: {
    border: 'rgba(190, 89, 83, 0.1)',
    divider: 'rgba(190, 89, 83, 0.08)',
    background: '#FDF8F4',
    surface: '#FFFFFF',
    cream: '#F5EDE4',
    hover: 'rgba(190, 89, 83, 0.06)',
    cardBg: '#FFFFFF',
    warmGray: '#EDE0D8',
  },

  // Text Colors
  text: {
    primary: '#2D2926',
    secondary: '#5C524D',
    disabled: '#B0A8A2',
    hint: '#C4BBB5',
    inverse: '#FFFFFF',
  },
};

// Event Type Colors
export const EVENT_TYPE_COLORS = {
  LIVE_MUSIC: STANDARD_COLORS.status.info.main,
  SPORTS_VIEWING: STANDARD_COLORS.status.success.main,
  TRIVIA_NIGHT: STANDARD_COLORS.brand.gold,
  PRIVATE_PARTY: STANDARD_COLORS.brand.primary.main,
  KARAOKE: STANDARD_COLORS.brand.wine,
  SPECIAL_EVENT: STANDARD_COLORS.brand.navy,
};

// Quick access helpers
export const STATUS_COLORS = {
  active: STANDARD_COLORS.status.active.main,
  inactive: STANDARD_COLORS.status.inactive.main,
  open: STANDARD_COLORS.status.open.main,
  closed: STANDARD_COLORS.status.closed.main,
  pending: STANDARD_COLORS.status.pending.main,
  warning: STANDARD_COLORS.status.warning.main,
  error: STANDARD_COLORS.status.error.main,
  success: STANDARD_COLORS.status.success.main,
  info: STANDARD_COLORS.status.info.main,
  primary: STANDARD_COLORS.brand.primary.main,
  secondary: STANDARD_COLORS.brand.secondary.main,
};

export default STANDARD_COLORS;
