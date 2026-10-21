/**
 * Theme Configuration
 *
 * Age-group based themes (cubs, stars, legends) with light/dark variants.
 * Maps to Tailwind CSS custom properties.
 */

export type AgeGroupTheme = 'cubs' | 'stars' | 'legends';
export type ColorMode = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  textInverse: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  xp: string;
  star: string;
  gem: string;
  streak: string;
}

export interface ThemeConfig {
  colors: ThemeColors;
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  fontSize: {
    caption: string;
    bodySmall: string;
    body: string;
    label: string;
    h4: string;
    h3: string;
    h2: string;
    h1: string;
    display: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  shadow: {
    sm: string;
    md: string;
    lg: string;
    glow: string;
  };
}

// ─── Color Palettes per Age Group ────────────────────────────────

const cubsLight: ThemeColors = {
  primary: '#5145C8',
  primaryLight: '#9386DF',
  primaryDark: '#4034AE',
  secondary: '#FFD93D',
  accent: '#F2BC55',
  background: '#FFF8F0',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  text: '#25314C',
  textSecondary: '#637087',
  textInverse: '#FFFFFF',
  border: '#E8E0D8',
  success: '#237F64',
  warning: '#FFD93D',
  error: '#B74242',
  info: '#4ECDC4',
  xp: '#FFD93D',
  star: '#FFD93D',
  gem: '#9386DF',
  streak: '#FF6348',
};

const starsLight: ThemeColors = {
  primary: '#5145C8',
  primaryLight: '#9386DF',
  primaryDark: '#4034AE',
  secondary: '#237F64',
  accent: '#F2BC55',
  background: '#F8F5EF',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  text: '#25314C',
  textSecondary: '#637087',
  textInverse: '#FFFFFF',
  border: '#E0E0F0',
  success: '#237F64',
  warning: '#F2BC55',
  error: '#B74242',
  info: '#9386DF',
  xp: '#F2BC55',
  star: '#F2BC55',
  gem: '#9386DF',
  streak: '#FF6348',
};

const legendsLight: ThemeColors = {
  primary: '#5145C8',
  primaryLight: '#9386DF',
  primaryDark: '#4034AE',
  secondary: '#237F64',
  accent: '#F2BC55',
  background: '#F0F8FF',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#4A4A6A',
  textInverse: '#FFFFFF',
  border: '#D8E8F8',
  success: '#237F64',
  warning: '#FFEAA7',
  error: '#B74242',
  info: '#9386DF',
  xp: '#FFEAA7',
  star: '#FFEAA7',
  gem: '#9386DF',
  streak: '#FF6348',
};

// Dark mode (shared base, simplified)
const darkBase: Partial<ThemeColors> = {
  primary: '#B7ACFF',
  primaryLight: '#CEC7FF',
  primaryDark: '#5145C8',
  background: '#1A1A2E',
  surface: '#16213E',
  surfaceElevated: '#1F2B47',
  text: '#F0F0F0',
  textSecondary: '#A0A0B0',
  textInverse: '#FFFFFF',
  border: '#2A2A4E',
};

// ─── Theme Configurations ────────────────────────────────────────

const sharedConfig = {
  borderRadius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    full: '9999px',
  },
  fontSize: {
    caption: '0.75rem',
    bodySmall: '0.875rem',
    body: '1rem',
    label: '0.875rem',
    h4: '1.125rem',
    h3: '1.25rem',
    h2: '1.5rem',
    h1: '2rem',
    display: '2.5rem',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px rgba(0, 0, 0, 0.08)',
    lg: '0 10px 25px rgba(0, 0, 0, 0.1)',
    glow: '0 0 20px rgba(108, 92, 231, 0.3)',
  },
};

export const themes: Record<AgeGroupTheme, Record<ColorMode, ThemeConfig>> = {
  cubs: {
    light: { colors: cubsLight, ...sharedConfig },
    dark: { colors: { ...cubsLight, ...darkBase } as ThemeColors, ...sharedConfig },
  },
  stars: {
    light: { colors: starsLight, ...sharedConfig },
    dark: { colors: { ...starsLight, ...darkBase } as ThemeColors, ...sharedConfig },
  },
  legends: {
    light: { colors: legendsLight, ...sharedConfig },
    dark: { colors: { ...legendsLight, ...darkBase } as ThemeColors, ...sharedConfig },
  },
};

/**
 * Applies theme as CSS custom properties on :root
 */
export function applyTheme(theme: ThemeConfig): void {
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([key, value]: [string, string]) => {
    root.style.setProperty(`--color-${kebabCase(key)}`, value);
  });
}

function kebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
