/**
 * SaaS Design System - 'Vibrant Premium' Theme
 *
 * Features:
 * - Primary Brand: Vibrant Premium (#F880FA)
 * - Dark Mode: Deep Sleek (#121212)
 * - 4px Grid System for Spacing
 */

const palette = {
  // Brand
  // Brand
  primary: {
    50: '#FEF2FF',
    100: '#FDE6FE',
    200: '#FCCCFD',
    300: '#FAB3FC',
    400: '#F999FB',
    500: '#F880FA', // Main Brand
    600: '#D960DB',
    700: '#BA40BC',
    800: '#9B209D',
    900: '#7C007E',
  },
  // Accent (Pink/Rose) - for 'Wow' factors
  secondary: {
    DEFAULT: '#DB2777', // Pink-600
    light: '#F472B6',
    dark: '#BE185D',
  },
  // Semantic
  success: '#10B981', // Emerald-500
  warning: '#F59E0B', // Amber-500
  error: '#EF4444', // Red-500
  info: '#3B82F6', // Blue-500
  // Neutrals (Slate)
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  // Base
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const Colors = {
  light: {
    text: palette.slate[900],
    textMuted: palette.slate[500],
    textInverted: palette.white,

    background: palette.white,
    backgroundSubtle: palette.slate[50],

    primary: palette.primary[500],
    primaryForeground: palette.white,
    primaryLight: palette.primary[100],

    secondary: palette.secondary.DEFAULT,

    border: palette.slate[200],
    input: palette.slate[100],

    card: palette.white,
    cardBorder: palette.slate[200], // For outlined cards

    // Status
    success: palette.success,
    warning: palette.warning,
    error: palette.error,

    tint: palette.primary[500],
    tabIconDefault: palette.slate[400],
    tabIconSelected: palette.primary[500],
  },
  dark: {
    text: palette.slate[50],
    textMuted: palette.slate[400],
    textInverted: palette.slate[900],

    background: '#121212', // True Dark
    backgroundSubtle: '#1E1E24', // Slightly lighter

    primary: palette.primary[500], // Slightly lighter for dark mode visibility
    primaryForeground: palette.white,
    primaryLight: 'rgba(248, 128, 250, 0.2)', // Glass effect

    secondary: palette.secondary.light,

    border: palette.slate[800],
    input: palette.slate[800],

    card: '#1E1E24',
    cardBorder: palette.slate[700],

    // Status
    success: '#34D399', // Emerald-400
    warning: '#FBBF24', // Amber-400
    error: '#F87171', // Red-400

    tint: palette.primary[500],
    tabIconDefault: palette.slate[600],
    tabIconSelected: palette.primary[500],
  },
};

export const Spacing = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const Radius = {
  s: 4,
  m: 8,
  l: 12,
  xl: 16,
  full: 9999,
};

export const Typography = {
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  sizes: {
    xs: { fontSize: 12, lineHeight: 16 },
    s: { fontSize: 14, lineHeight: 20 },
    m: { fontSize: 16, lineHeight: 24 },
    l: { fontSize: 20, lineHeight: 28 },
    xl: { fontSize: 24, lineHeight: 32 },
    xxl: { fontSize: 32, lineHeight: 40 },
  },
};

export const Shadows = {
  light: {
    sm: {
      shadowColor: palette.slate[500],
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    m: {
      shadowColor: palette.slate[500],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
    l: {
      shadowColor: palette.primary[900], // Colored shadow for premium feel
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
      elevation: 10,
    },
  },
  dark: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 2,
    },
    m: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 4,
    },
    l: {
      shadowColor: '#000', // Deep black shadows for dark mode
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 15,
      elevation: 10,
    },
  },
};
