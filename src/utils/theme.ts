// ─────────────────────────────────────────────
//  Design System — Colors, Typography, Spacing
// ─────────────────────────────────────────────

export const Colors = {
  // Backgrounds
  bg: '#F8FAFC',            // Soft Slate 50 for clean modern app background
  bgCard: '#FFFFFF',        // Pure White for cards
  bgCardElevated: '#FFFFFF',// White for elevated cards
  bgInput: '#F1F5F9',       // Slate 100 for inputs

  // Hero Card (Dark Mode Premium accent)
  heroBg: '#0F172A',        // Slate 900 for Hero Card
  heroBorder: '#1E293B',    // Slate 800
  heroTextPrimary: '#FFFFFF',
  heroTextSecondary: '#94A3B8',

  // Brand / Primary
  primary: '#0F172A',       // Slate 900 for primary actions/branding
  primaryDark: '#020617',
  primaryLight: '#334155',

  // Semantic (Desaturated & Elegant)
  income: '#10B981',        // Emerald Green
  incomeLight: '#ECFDF5',
  incomeDark: '#059669',
  expense: '#F43F5E',       // Rose Red
  expenseLight: '#FFF1F2',
  expenseDark: '#E11D48',
  transfer: '#3B82F6',      // Blue
  transferLight: '#EFF6FF',

  // Text
  textPrimary: '#0F172A',   // Slate 900
  textSecondary: '#64748B', // Slate 500
  textTertiary: '#94A3B8',  // Slate 400
  textDisabled: '#CBD5E1',  // Slate 300

  // Divider / Border
  border: '#E2E8F0',        // Slate 200
  borderLight: '#F1F5F9',
  divider: '#F1F5F9',

  // Chart colors (Premium Monochromatic & Vibrant Accents)
  chartColors: [
    '#0F172A', '#2563EB', '#10B981', '#F59E0B',
    '#8B5CF6', '#F43F5E', '#06B6D4', '#64748B',
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
  '2xl': 32,
  full: 999,
};

export const Shadow = {
  soft: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  hero: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
};
