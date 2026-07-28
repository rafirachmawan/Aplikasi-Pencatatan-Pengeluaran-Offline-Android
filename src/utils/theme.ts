// ─────────────────────────────────────────────
//  Design System — Colors, Typography, Spacing
// ─────────────────────────────────────────────

export const Colors = {
  // Backgrounds
  bg: '#0F0F14',
  bgCard: '#1A1A24',
  bgCardElevated: '#212130',
  bgInput: '#13131C',

  // Brand / Primary
  primary: '#818CF8',       // Indigo
  primaryDark: '#6366F1',
  primaryLight: '#A5B4FC',

  // Semantic
  income: '#4ADE80',        // Green
  incomeLight: '#BBF7D0',
  expense: '#F87171',       // Red
  expenseLight: '#FECACA',
  transfer: '#60A5FA',      // Blue

  // Text
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  textDisabled: '#475569',

  // Divider / Border
  border: '#2D2D3D',
  divider: '#1E1E2C',

  // Chart colors (for pie chart slices)
  chartColors: [
    '#818CF8', '#F87171', '#4ADE80', '#FBBF24',
    '#60A5FA', '#F472B6', '#34D399', '#A78BFA',
    '#FB923C', '#22D3EE',
  ],
};

export const Typography = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 22,
  '2xl': 26,
  '3xl': 32,

  weightRegular: '400' as const,
  weightMedium: '500' as const,
  weightSemiBold: '600' as const,
  weightBold: '700' as const,
  weightExtraBold: '800' as const,
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
  xl: 20,
  full: 999,
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  elevated: {
    shadowColor: '#818CF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};
