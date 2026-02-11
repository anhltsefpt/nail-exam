/**
 * Design System – 'Vibrant Rose' Theme
 *
 * Features:
 * - Primary Brand: Rose (#E8567D)
 * - Warm, earthy neutrals
 * - Semantic colors with background variants
 * - Phase colors for learning roadmap
 * - Special colors for premium, stars, streaks
 * - 4px Grid System for Spacing
 */

const palette = {
  // ── Primary Colors ──────────────────────────────
  primary: {
    rose: '#E8567D',       // CTA buttons, links, brand accent
    roseLight: '#FCC4EC',  // Backgrounds, cards, highlights
    roseDark: '#C24A62',   // Pressed states, emphasis text
    roseWhisper: '#FFF5F7', // Page backgrounds, subtle tint
  },

  // ── Neutrals ────────────────────────────────────
  neutral: {
    ink: '#2D2A26',         // Headings, primary text
    body: '#5C564E',        // Body text, secondary content
    muted: '#9E9B8C',       // Captions, placeholders, hints
    borderLight: '#C8C1B8', // Dividers, subtle borders
    surface: '#F0E8E8',     // Card borders, separators
    canvas: '#FAF8F6',      // Page background
    white: '#FFFFFF',       // Cards, modals, inputs
  },

  // ── Semantic Colors ─────────────────────────────
  semantic: {
    success: '#22C55E',     // Correct answer, passed, complete
    error: '#EF4444',       // Wrong answer, failed, alerts
    warning: '#F59E0B',     // Caution, almost passing, hints
    info: '#3B82F6',        // Tips, information, links
    successBg: '#DCFCE7',   // Correct answer card bg
    errorBg: '#FEE2E2',     // Wrong answer card bg
    warningBg: '#FEF3C7',   // Warning message bg
    infoBg: '#DBEAFE',      // Tip/info card bg
  },

  // ── Phase Colors ────────────────────────────────
  phase: {
    1: { primary: '#E8567D', light: '#FCC4EC' }, // High-Yield Foundations
    2: { primary: '#22C55E', light: '#DCFCE7' }, // Core Procedures
    3: { primary: '#3B82F6', light: '#DBEAFE' }, // Chemistry & Theory
    4: { primary: '#16A34A', light: '#DCFCE7' }, // Quick Wins
  },

  // ── Special Colors ──────────────────────────────
  special: {
    starGold: '#FBBF24',    // Star rating, streaks
    premium: '#E8567D',     // Premium badge
    premiumDark: '#1a1a2e', // Paywall hero
  },

  // Base
  transparent: 'transparent',
};

export const Colors = {
  light: {
    text: palette.neutral.ink,
    textMuted: palette.neutral.muted,
    textSecondary: palette.neutral.body,
    textInverted: palette.neutral.white,

    background: palette.neutral.canvas,
    backgroundSubtle: palette.primary.roseWhisper,

    primary: palette.primary.rose,
    primaryForeground: palette.neutral.white,
    primaryLight: palette.primary.roseLight,
    primaryDark: palette.primary.roseDark,

    secondary: palette.primary.roseLight,

    border: palette.neutral.borderLight,
    borderLight: palette.neutral.borderLight,
    input: palette.neutral.surface,

    card: palette.neutral.white,
    cardBorder: palette.neutral.surface,

    surface: palette.neutral.surface,
    canvas: palette.neutral.canvas,

    // Status
    success: palette.semantic.success,
    warning: palette.semantic.warning,
    error: palette.semantic.error,
    info: palette.semantic.info,

    successBg: palette.semantic.successBg,
    errorBg: palette.semantic.errorBg,
    warningBg: palette.semantic.warningBg,
    infoBg: palette.semantic.infoBg,

    // Phase
    phase: palette.phase,

    // Special
    starGold: palette.special.starGold,
    premium: palette.special.premium,
    premiumDark: palette.special.premiumDark,

    tint: palette.primary.rose,
    tabIconDefault: palette.neutral.muted,
    tabIconSelected: palette.primary.rose,
  },
  dark: {
    text: '#F3ECED',
    textMuted: palette.neutral.muted,
    textSecondary: '#A69B9E',
    textInverted: palette.neutral.ink,

    background: '#1E1A1B',
    backgroundSubtle: '#272223',

    primary: '#F5B3BE',
    primaryForeground: palette.neutral.ink,
    primaryLight: 'rgba(232, 86, 125, 0.18)',
    primaryDark: palette.primary.roseDark,

    secondary: palette.primary.roseLight,

    border: '#413A3C',
    borderLight: '#413A3C',
    input: '#2A2526',

    card: '#272223',
    cardBorder: '#413A3C',

    surface: '#2A2526',
    canvas: '#1E1A1B',

    // Status – adjusted for dark backgrounds
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',

    successBg: 'rgba(34, 197, 94, 0.15)',
    errorBg: 'rgba(239, 68, 68, 0.15)',
    warningBg: 'rgba(245, 158, 11, 0.15)',
    infoBg: 'rgba(59, 130, 246, 0.15)',

    // Phase
    phase: palette.phase,

    // Special
    starGold: palette.special.starGold,
    premium: '#F5B3BE',
    premiumDark: palette.special.premiumDark,

    tint: '#F5B3BE',
    tabIconDefault: '#5A5153',
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
      shadowColor: palette.neutral.body,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    m: {
      shadowColor: palette.neutral.body,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
    l: {
      shadowColor: palette.primary.roseDark,
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
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 15,
      elevation: 10,
    },
  },
};
