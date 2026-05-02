/**
 * LearnVerse Design System
 * Warm light theme inspired by Smart Learn / Chegg UI
 * Orange primary accent with creamy backgrounds
 */

export const Colors = {
  light: {
    text: '#1A1A2E',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    background: '#FFF8F0',
    card: '#FFFFFF',
    cardElevated: '#FFF0E5',
    tint: '#FF6B35',
    border: '#F0E6DB',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#FF6B35',
  },
  dark: {
    text: '#1A1A2E',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    background: '#FFF8F0',
    card: '#FFFFFF',
    cardElevated: '#FFF0E5',
    tint: '#FF6B35',
    border: '#F0E6DB',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#FF6B35',
  },
};

export const Palette = {
  // Primary — warm orange
  primary: '#FF6B35',
  primaryLight: '#FF8C5A',
  primaryDark: '#E85A2A',

  // Gradients (start, end)
  gradientPrimary: ['#FF6B35', '#FF8C5A'] as const,
  gradientWarm: ['#FF6B35', '#FFB84D'] as const,
  gradientCool: ['#00BFA6', '#00D4AA'] as const,
  gradientSuccess: ['#10B981', '#34D399'] as const,
  gradientKids: ['#FF6B9D', '#C084FC'] as const,
  gradientGold: ['#FFB84D', '#FF6B35'] as const,
  gradientDark: ['#1A1A2E', '#2D2D44'] as const,
  gradientAI: ['#E8F5E8', '#F0FFF0'] as const,

  // Accent colors
  success: '#10B981',
  successLight: '#34D399',
  warning: '#FFB84D',
  warningLight: '#FBBF24',
  danger: '#EF4444',
  dangerLight: '#F87171',
  info: '#00BFA6',
  infoLight: '#00D4AA',
  purple: '#8B5CF6',
  purpleLight: '#A78BFA',
  pink: '#EC4899',
  pinkLight: '#F472B6',
  orange: '#FF6B35',
  teal: '#00BFA6',

  // Backgrounds (warm light theme)
  bg: '#FFF8F0',
  bgCard: '#FFFFFF',
  bgCardElevated: '#FFF0E5',
  bgOverlay: 'rgba(26, 26, 46, 0.5)',
  bgAI: '#F0F7F0',
  bgCream: '#FFF5EB',
  bgSubtle: '#FAF5F0',

  // Text
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textAccent: '#FF6B35',

  // Borders
  border: '#F0E6DB',
  borderLight: '#F5EDE5',
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
    shadowColor: '#C8B8A8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#C8B8A8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#C8B8A8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  }),
};
