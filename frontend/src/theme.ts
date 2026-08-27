export const theme = {
  color: {
    surface: '#FFFFFF',
    onSurface: '#1A110F',
    surfaceSecondary: '#F8F5F2',
    onSurfaceSecondary: '#3D2E2C',
    surfaceTertiary: '#EAE4E0',
    onSurfaceTertiary: '#5C4A48',
    surfaceInverse: '#1A110F',
    onSurfaceInverse: '#FFFFFF',
    brand: '#4A2C2A',
    brandPrimary: '#E85D04',
    onBrandPrimary: '#FFFFFF',
    brandSecondary: '#F4A261',
    brandTertiary: '#FCEBE0',
    onBrandTertiary: '#D04800',
    success: '#2D6A4F',
    warning: '#E9C46A',
    error: '#E63946',
    info: '#457B9D',
    border: '#EAE4E0',
    borderStrong: '#D6C9C4',
    divider: '#F3EFEA',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 },
  radius: { sm: 6, md: 12, lg: 20, pill: 999 },
  font: {
    display: 'System',
    text: 'System',
  },
};

export type Theme = typeof theme;
