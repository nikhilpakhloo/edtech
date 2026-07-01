export const colors = {
  dark: {
    background: '#05070D',
    surface: '#10141F',
    elevated: '#171D2A',
    surfaceVariant: '#20283A',
    border: '#2B3445',
    text: '#F8FAFC',
    textMuted: '#AAB4C5',
    primary: '#4F8CFF',
    secondary: '#12B981',
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
