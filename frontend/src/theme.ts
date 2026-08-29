export const theme = {
  color: {
    surface: '#FFFFFF',
    onSurface: '#1A1615',
    surfaceSecondary: '#FAF7F2',
    onSurfaceSecondary: '#706E6B',
    surfaceTertiary: '#EAE4E0',
    onSurfaceTertiary: '#4A403D',
    surfaceInverse: '#1A1615',
    onSurfaceInverse: '#FFFFFF',
    brand: '#1A1615',
    brandPrimary: '#E76F51',
    onBrandPrimary: '#FFFFFF',
    brandSecondary: '#D4A373',
    brandTertiary: '#FFF0EB',
    onBrandTertiary: '#D04800',
    success: '#2D6A4F',
    warning: '#D4A373',
    error: '#E63946',
    info: '#457B9D',
    border: '#EAE4E0',
    borderStrong: '#D6C9C4',
    divider: '#F3EFEA',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 },
  radius: { sm: 6, md: 12, lg: 20, pill: 999 },
  font: {
    display: 'Playfair Display',
    text: 'Plus Jakarta Sans',
  },
};

export type Theme = typeof theme;
