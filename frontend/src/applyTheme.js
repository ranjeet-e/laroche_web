import { theme } from './theme.ts';

const extraTokens = {
  '--on-success': '#FFFFFF',
  '--on-warning': '#1A110F',
  '--on-error': '#FFFFFF',
  '--shadow-1': '0 2px 12px rgba(26, 17, 15, 0.08)',
  '--font-family': "'Plus Jakarta Sans', system-ui, sans-serif",
  '--text-sm': '0.8125rem',
  '--text-base': '0.9375rem',
  '--text-lg': '1.0625rem',
  '--text-xl': '1.25rem',
  '--text-2xl': '1.75rem',
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
