/**
 * LearnVerse Design System
 * Premium dark theme with vibrant accents
 */

export const Colors = {
  light: {
    text: '#1e293b',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    background: '#f8fafc',
    card: '#ffffff',
    cardElevated: '#f1f5f9',
    tint: '#3b82f6',
    border: '#e2e8f0',
    tabIconDefault: '#94a3b8',
    tabIconSelected: '#3b82f6',
  },
  dark: {
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    background: '#0f172a',
    card: '#1e293b',
    cardElevated: '#334155',
    tint: '#3b82f6',
    border: '#334155',
    tabIconDefault: '#64748b',
    tabIconSelected: '#3b82f6',
  },
};

export const Palette = {
  // Primary
  primary: '#3b82f6',
  primaryLight: '#60a5fa',
  primaryDark: '#2563eb',

  // Gradients (start, end)
  gradientPrimary: ['#3b82f6', '#8b5cf6'] as const,
  gradientWarm: ['#f97316', '#ef4444'] as const,
  gradientCool: ['#06b6d4', '#3b82f6'] as const,
  gradientSuccess: ['#10b981', '#06b6d4'] as const,
  gradientKids: ['#f472b6', '#a855f7'] as const,
  gradientGold: ['#f59e0b', '#ef4444'] as const,
  gradientDark: ['#1e293b', '#0f172a'] as const,

  // Accent colors
  success: '#10b981',
  successLight: '#34d399',
  warning: '#f59e0b',
  warningLight: '#fbbf24',
  danger: '#ef4444',
  dangerLight: '#f87171',
  info: '#06b6d4',
  infoLight: '#22d3ee',
  purple: '#8b5cf6',
  purpleLight: '#a78bfa',
  pink: '#ec4899',
  pinkLight: '#f472b6',
  orange: '#f97316',
  teal: '#14b8a6',

  // Backgrounds (dark theme)
  bg: '#0f172a',
  bgCard: '#1e293b',
  bgCardElevated: '#334155',
  bgOverlay: 'rgba(15, 23, 42, 0.85)',

  // Text
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',

  // Borders
  border: '#334155',
  borderLight: '#475569',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const Typography = {
  // Font weights as string for RN StyleSheet
  hero: {
    fontSize: 32,
    fontWeight: '800' as const,
    lineHeight: 40,
  },
  h1: {
    fontSize: 28,
    fontWeight: '800' as const,
    lineHeight: 36,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontWeight: '700' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18,
  },
  small: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '700' as const,
    lineHeight: 22,
  },
  price: {
    fontSize: 18,
    fontWeight: '800' as const,
    lineHeight: 24,
  },
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  }),
};
