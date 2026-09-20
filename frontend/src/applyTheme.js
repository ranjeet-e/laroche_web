import { theme } from './theme.ts';

const extraTokens = {
  '--on-success': '#FFFFFF',
  '--on-warning': '#1A1615',
  '--on-error': '#FFFFFF',
  '--shadow-sm': '0 2px 8px rgba(26, 22, 21, 0.04)',
  '--shadow-1': '0 4px 16px rgba(26, 22, 21, 0.06)',
  '--shadow-card': '0 6px 20px rgba(26, 22, 21, 0.05), 0 2px 6px rgba(0, 0, 0, 0.02)',
  '--shadow-hover': '0 14px 28px rgba(231, 111, 81, 0.14), 0 4px 12px rgba(26, 22, 21, 0.04)',
  '--shadow-float': '0 16px 40px rgba(26, 22, 21, 0.16)',
  '--font-family': "'Inter', system-ui, -apple-system, sans-serif",
  '--font-display': "'Fraunces', Georgia, serif",
  '--text-xs': '0.75rem',
  '--text-sm': '0.875rem',
  '--text-base': '1rem',
  '--text-lg': '1.125rem',
  '--text-xl': '1.35rem',
  '--text-2xl': '1.875rem',
  '--text-3xl': '2.25rem',
  '--brand-gradient': 'linear-gradient(135deg, #A6472B 0%, #7E351F 100%)',
  '--brand-warm-gradient': 'linear-gradient(135deg, #F2EDE2 0%, #E9E0CC 100%)',
  '--glass-bg': 'rgba(242, 237, 226, 0.94)',
  '--glass-border': 'rgba(221, 212, 192, 0.85)',
  '--transition-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  '--transition-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
};

export const applyTheme = () => {
  const root = document.documentElement;
  const { color, spacing, radius } = theme;

  const tokens = {
    '--surface': color.surface,
    '--on-surface': color.onSurface,
    '--surface-secondary': color.surfaceSecondary,
    '--on-surface-secondary': color.onSurfaceSecondary,
    '--surface-tertiary': color.surfaceTertiary,
    '--on-surface-tertiary': color.onSurfaceTertiary,
    '--surface-inverse': color.surfaceInverse,
    '--on-surface-inverse': color.onSurfaceInverse,
    '--brand': color.brand,
    '--brand-primary': color.brandPrimary,
    '--on-brand-primary': color.onBrandPrimary,
    '--brand-secondary': color.brandSecondary,
    '--brand-tertiary': color.brandTertiary,
    '--on-brand-tertiary': color.onBrandTertiary,
    '--success': color.success,
    '--warning': color.warning,
    '--error': color.error,
    '--info': color.info,
    '--border': color.border,
    '--border-strong': color.borderStrong,
    '--divider': color.divider,

    '--space-xs': `${spacing.xs}px`,
    '--space-sm': `${spacing.sm}px`,
    '--space-md': `${spacing.md}px`,
    '--space-lg': `${spacing.lg}px`,
    '--space-xl': `${spacing.xl}px`,
    '--space-2xl': `${spacing.xxl}px`,
    '--space-3xl': `${spacing.xxxl}px`,

    '--radius-sm': `${radius.sm}px`,
    '--radius-md': `${radius.md}px`,
    '--radius-lg': `${radius.lg}px`,
    '--radius-pill': `${radius.pill}px`,

    ...extraTokens,
  };

  Object.entries(tokens).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};
