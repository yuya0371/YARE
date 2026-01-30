export const Colors = {
  light: {
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    primary: '#F97316',
    primaryMuted: '#FFEDD5',
    text: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    border: '#E5E7EB',
    success: '#10B981',
    successMuted: '#D1FAE5',
  },
  dark: {
    background: '#0F0F0F',
    surface: '#1A1A1A',
    surfaceElevated: '#252525',
    primary: '#FB923C',
    primaryMuted: '#431407',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    border: '#374151',
    success: '#34D399',
    successMuted: '#064E3B',
  },
};

export type ColorScheme = keyof typeof Colors;
