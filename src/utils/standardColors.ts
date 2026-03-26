/**
 * Standard Colors for Corrado's Restaurant Admin Dashboard
 * WP Admin-aligned neutral palette with Corrado's terracotta brand color
 */

export const STANDARD_COLORS = {
  // Status Colors
  status: {
    active: {
      main: '#00A32A',
      light: '#EEF7EE',
      dark: '#007A1F',
      border: '#B3DFBB',
      contrast: '#FFFFFF',
    },
    inactive: {
      main: '#50575E',
      light: '#F0F0F1',
      dark: '#1D2327',
      border: '#CDD0D4',
      contrast: '#FFFFFF',
    },
    open: {
      main: '#00A32A',
      light: '#EEF7EE',
      dark: '#007A1F',
      border: '#B3DFBB',
      contrast: '#FFFFFF',
    },
    closed: {
      main: '#50575E',
      light: '#F0F0F1',
      dark: '#1D2327',
      border: '#CDD0D4',
      contrast: '#FFFFFF',
    },
    pending: {
      main: '#996800',
      light: '#FEF8EE',
      dark: '#664400',
      border: '#F5D567',
      contrast: '#1D2327',
    },
    warning: {
      main: '#DBA617',
      light: '#FEF8EE',
      dark: '#996800',
      border: '#F5D567',
      contrast: '#1D2327',
    },
    error: {
      main: '#D63638',
      light: '#FCEEEE',
      dark: '#A62527',
      border: '#E9A8A8',
      contrast: '#FFFFFF',
    },
    success: {
      main: '#00A32A',
      light: '#EEF7EE',
      dark: '#007A1F',
      border: '#B3DFBB',
      contrast: '#FFFFFF',
    },
    info: {
      main: '#0073AA',
      light: '#EEF5FA',
      dark: '#005177',
      border: '#99C8E0',
      contrast: '#FFFFFF',
    },
  },

  // Brand Colors
  brand: {
    primary: {
      main: '#BE5953',
      light: '#F5E9E8',
      dark: '#9A413C',
      border: '#D48680',
      contrast: '#FFFFFF',
    },
    secondary: {
      main: '#50575E',
      light: '#F6F7F7',
      dark: '#1D2327',
      contrast: '#FFFFFF',
    },
  },

  // UI Colors — WP Admin neutral palette
  ui: {
    border: '#E2E4E7',
    borderBase: '#CDD0D4',
    borderStrong: '#A7AAAD',
    background: '#F0F0F1',
    surface: '#FFFFFF',
    hover: '#F6F7F7',
    selected: '#F0F6FC',
    subtle: '#FAFAFA',
    sidebar: '#1D2327',
    topbar: '#1D2327',
  },

  // Text Colors
  text: {
    primary: '#1D2327',
    secondary: '#50575E',
    muted: '#787C82',
    disabled: '#A7AAAD',
    inverse: '#FFFFFF',
    inverseMuted: '#A7AAAD',
  },
};

// Event Type Colors
export const EVENT_TYPE_COLORS = {
  LIVE_MUSIC: STANDARD_COLORS.status.info.main,
  SPORTS_VIEWING: STANDARD_COLORS.status.success.main,
  TRIVIA_NIGHT: STANDARD_COLORS.status.warning.main,
  PRIVATE_PARTY: STANDARD_COLORS.brand.primary.main,
  KARAOKE: '#9A413C',
  SPECIAL_EVENT: STANDARD_COLORS.status.info.main,
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
