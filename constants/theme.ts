/**
 * SaaS Design System - 'Pastel Pink' Theme
 *
 * Features:
 * - Primary Brand: Soft Rose (#F2A7B3)
 * - Eye-friendly, low-exposure colors throughout
 * - Dark Mode: Warm Dark (#1E1A1B)
 * - 4px Grid System for Spacing
 */

const palette = {
  // Brand – Pastel Pink
  primary: {
    50: '#FFF5F6',
    100: '#FEEAED',
    200: '#FCD5DB',
    300: '#F8BFC8',
    400: '#F5B3BE',
    500: '#F2A7B3', // Main Brand – Soft Rose
    600: '#D98E99',
    700: '#B87280',
    800: '#965A67',
    900: '#74434E',
  },
  // Accent (Dusty Rose) – subtle accent
  secondary: {
    DEFAULT: '#D4869A', // Dusty Rose
    light: '#E8A8B8',
    dark: '#B86E82',
  },
  // Semantic – soft, eye-friendly variants
  success: '#7EC8A4', // Soft Sage
  warning: '#F0C97E', // Soft Amber
  error: '#E8878C', // Muted Coral
  info: '#8DB4E8', // Pastel Blue
  // Neutrals (Warm Slate)
  slate: {
    50: '#FAF8F8',
    100: '#F3F0F0',
    200: '#E6E1E2',
    300: '#D1CACC',
    400: '#A69B9E',
    500: '#7A7073',
    600: '#5A5153',
    700: '#413A3C',
    800: '#2A2526',
    900: '#1A1617',
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

    background: '#FFFFFF',
    backgroundSubtle: '#F8FAFC',

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
    text: '#F3ECED', // Warm off-white
    textMuted: palette.slate[400],
    textInverted: palette.slate[900],

    background: '#1E1A1B', // Warm Dark with pink undertone
    backgroundSubtle: '#272223', // Slightly lighter warm dark

    primary: '#F5B3BE', // Slightly lighter for dark mode readability
    primaryForeground: palette.slate[900],
    primaryLight: 'rgba(242, 167, 179, 0.18)', // Glass effect

    secondary: palette.secondary.light,

    border: palette.slate[700],
    input: palette.slate[800],

    card: '#272223',
    cardBorder: palette.slate[700],

    // Status – softer for dark backgrounds
    success: '#9AD8BA', // Soft mint
    warning: '#F5D9A0', // Soft gold
    error: '#EDA4A8', // Soft coral

    tint: '#F5B3BE',
    tabIconDefault: palette.slate[600],
    tabIconSelected: '#F5B3BE',
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
