// ─────────────────────────────────────────────
//  Design System — Colors, Typography, Spacing
// ─────────────────────────────────────────────

export const Colors = {
  // Backgrounds
  bg: '#FFFFFF',            // Clean White
  bgCard: '#F8FAFC',        // Slate 50 for flat cards
  bgCardElevated: '#FFFFFF',// White for elevated cards
  bgInput: '#F1F5F9',       // Slate 100 for inputs

  // Brand / Primary
  primary: '#09090B',       // Black for primary actions/branding
  primaryDark: '#27272A',
  primaryLight: '#52525B',

  // Semantic (Desaturated & Elegant)
  income: '#10B981',        // Emerald Green
  incomeLight: '#D1FAE5',
  expense: '#EF4444',       // Rose Red
  expenseLight: '#FEE2E2',
  transfer: '#3B82F6',      // Blue

  // Text
  textPrimary: '#0F172A',   // Slate 900
  textSecondary: '#64748B', // Slate 500
  textTertiary: '#94A3B8',  // Slate 400
  textDisabled: '#CBD5E1',  // Slate 300

  // Divider / Border
  border: '#E2E8F0',        // Slate 200
  divider: '#F1F5F9',

  // Chart colors (Premium Monochromatic & Muted)
  chartColors: [
    '#0F172A', '#334155', '#64748B', '#94A3B8',
    '#CBD5E1', '#10B981', '#3B82F6', '#6366F1',
    '#F59E0B', '#EF4444',
  ],
};

export const Typography = {
  xs: 12,
  sm: 13,
  base: 15,
  md: 17,
  lg: 19,
  xl: 24,
  '2xl': 28,
  '3xl': 34,

  weightRegular: '400' as const,
  weightMedium: '500' as const,
  weightSemiBold: '600' as const,
  weightBold: '700' as const,
  weightExtraBold: '800' as const,

  // Font families — Android system sans-serif (cleaner than default)
  fontRegular: 'sans-serif',
  fontMedium: 'sans-serif-medium',
  fontSemiBold: 'sans-serif-medium',
  fontBold: 'sans-serif-condensed',
  fontExtraBold: 'sans-serif-condensed',
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
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
};
