export const colors = {
  dark: {
    background: '#030712',
    surface: '#07101F',
    elevated: '#0D1830',
    surfaceVariant: '#142345',
    border: '#24314F',
    text: '#F8FAFC',
    textMuted: '#9AA7BC',
    primary: '#1F80E0',
    secondary: '#00E0FF',
    accent: '#F5C542',
    danger: '#FF5A66',
  },
  light: {
    background: '#F7F9FC',
    surface: '#FFFFFF',
    elevated: '#EDF2F7',
    surfaceVariant: '#E8EEF7',
    border: '#CBD5E1',
    text: '#101828',
    textMuted: '#667085',
    primary: '#275DFF',
    secondary: '#047857',
    accent: '#B7791F',
    danger: '#D92D20',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;
