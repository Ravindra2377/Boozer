// ─────────────────────────────────────────────────────────────────────────────
// Boozer × CompareX Clear Commerce Design Tokens
// Forest green actions · Emerald mint accents · Quiet dark obsidian paper surfaces
// ─────────────────────────────────────────────────────────────────────────────

export const lightColors = {
  // Core backgrounds & surfaces
  primary: '#16845B',
  primaryLight: '#4FAF86',
  primaryDark: '#0D4F3C',
  primaryMint: '#65C99C',

  background: '#F7F8F7',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardAlt: '#F1F4F1',
  border: '#DFE6E1',
  borderLight: '#EBF0EC',
  divider: '#DFE6E1',
  line: '#DFE6E1',
  lineStrong: '#C9D5CD',

  // Glassmorphism
  glassSurface: 'rgba(255, 255, 255, 0.75)',
  glassBorder: 'rgba(255, 255, 255, 0.85)',
  glassHighlight: 'rgba(255, 255, 255, 0.50)',
  glassShadow: 'rgba(22, 132, 91, 0.08)',

  // Accents & Semantics
  accent: '#16845B',
  accentGold: '#D97706',
  savings: '#059669',
  savingsLight: 'rgba(5, 150, 105, 0.12)',
  warning: '#F59E0B',
  error: '#EF4444',
  tomato: '#DC4C3E',
  tomatoLight: '#FDECEA',
  info: '#3B82F6',

  // Text
  textPrimary: '#18201C',
  textSecondary: '#66706A',
  textTertiary: '#929B95',
  textInverse: '#FFFFFF',

  // Gradients
  gradientHero: ['#0D4F3C', '#16845B', '#3A9D76'],
  gradientCard: ['#FFFFFF', '#FAFCFA'],
  gradientAccent: ['#116149', '#16845B'],
  gradientSavings: ['#059669', '#047857'],
  gradientGlass: ['rgba(255,255,255,0.95)', 'rgba(248,250,252,0.85)'],

  // Legacy mappings for backwards-compatibility
  midnight: '#F7F8F7',
  plumDeep: '#FFFFFF',
  plumSurface: '#FFFFFF',
  cardGlass: '#FFFFFF',
  cardBorder: '#DFE6E1',
  cardBorderActive: 'rgba(22, 132, 91, 0.5)',
  gold: '#16845B',
  goldHover: '#116149',
  goldDark: '#0D4F3C',
  goldGlow: 'rgba(22, 132, 91, 0.15)',
  purple: '#EAF5EF',
  purpleLight: '#66706A',
  purpleGlow: 'transparent',
  cream: '#18201C',
  creamMuted: '#66706A',
  creamSubtle: '#929B95',
  tealNoir: '#059669',
  crimson: '#DC4C3E',
  crimsonDark: '#FDECEA',
  crimsonGlow: 'rgba(220, 76, 62, 0.15)',
  success: '#059669',
};

export const darkColors = {
  // Core backgrounds & surfaces (CompareX signature dark paper)
  primary: '#65C99C',
  primaryLight: '#8AD9B5',
  primaryDark: '#16845B',
  primaryMint: '#65C99C',

  background: '#0E1511',
  surface: '#17201B',
  card: '#17201B',
  cardAlt: '#202B25',
  border: '#304038',
  borderLight: '#26342D',
  divider: '#304038',
  line: '#304038',
  lineStrong: '#42564B',

  // Glassmorphism
  glassSurface: 'rgba(23, 32, 27, 0.78)',
  glassBorder: 'rgba(255, 255, 255, 0.14)',
  glassHighlight: 'rgba(255, 255, 255, 0.08)',
  glassShadow: 'rgba(0, 0, 0, 0.5)',

  // Accents & Semantics
  accent: '#65C99C',
  accentGold: '#D97706',
  savings: '#059669',
  savingsLight: 'rgba(5, 150, 105, 0.20)',
  warning: '#F59E0B',
  error: '#EF4444',
  tomato: '#DC4C3E',
  tomatoLight: 'rgba(220, 76, 62, 0.20)',
  info: '#3B82F6',

  // Text
  textPrimary: '#F7F8FA',
  textSecondary: '#B4BDB7',
  textTertiary: '#77827B',
  textInverse: '#0E1511',

  // Gradients
  gradientHero: ['#0A2E23', '#116149', '#16845B'],
  gradientCard: ['rgba(23,32,27,0.98)', 'rgba(14,21,17,0.98)'],
  gradientAccent: ['#16845B', '#65C99C'],
  gradientSavings: ['#059669', '#047857'],
  gradientGlass: ['rgba(23,32,27,0.95)', 'rgba(14,21,17,0.90)'],

  // Legacy mappings for backwards-compatibility
  midnight: '#0E1511',
  plumDeep: '#121A15',
  plumSurface: '#17201B',
  cardGlass: '#17201B',
  cardBorder: '#304038',
  cardBorderActive: 'rgba(101, 201, 156, 0.5)',
  gold: '#65C99C',
  goldHover: '#8AD9B5',
  goldDark: '#16845B',
  goldGlow: 'rgba(101, 201, 156, 0.20)',
  purple: '#202B25',
  purpleLight: '#B4BDB7',
  purpleGlow: 'transparent',
  cream: '#F7F8FA',
  creamMuted: '#B4BDB7',
  creamSubtle: '#77827B',
  tealNoir: '#059669',
  crimson: '#DC4C3E',
  crimsonDark: '#3B1A1A',
  crimsonGlow: 'rgba(220, 76, 62, 0.2)',
  success: '#10B981',
};

// Default export uses darkColors as requested by user
export const colors = darkColors;
