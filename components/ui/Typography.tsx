import React from 'react';
import { Text, TextProps, useColorScheme } from 'react-native';
import { Colors, Typography as TypeTokens } from '../../constants/theme';

type Variant = 'display' | 'heading' | 'title' | 'body' | 'caption' | 'small';
type Weight = 'regular' | 'medium' | 'semibold' | 'bold';
type TextColor = 'default' | 'muted' | 'inverted' | 'primary' | 'error' | 'success' | 'warning';

interface TypographyProps extends TextProps {
  variant?: Variant;
  weight?: Weight;
  color?: TextColor;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export function Typography({
  children,
  style,
  variant = 'body',
  weight = 'regular',
  color = 'default',
  align = 'left',
  ...props
}: TypographyProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const getTextStyle = () => {
    // 1. Base Size & Line Height
    const sizeStyle = TypeTokens.sizes[getMappedSize(variant)];

    // 2. Weight
    const weightStyle = { fontWeight: TypeTokens.weights[weight] as any };

    // 3. Color
    let colorValue = theme.text;
    if (color === 'muted') colorValue = theme.textMuted;
    if (color === 'inverted') colorValue = theme.textInverted;
    if (color === 'primary') colorValue = theme.primary;
    if (color === 'error') colorValue = theme.error;
    if (color === 'success') colorValue = theme.success;
    if (color === 'warning') colorValue = theme.warning;

    return {
      ...sizeStyle,
      ...weightStyle,
      color: colorValue,
      textAlign: align,
    };
  };

  return (
    <Text style={[getTextStyle(), style]} {...props}>
      {children}
    </Text>
  );
}

// Helper to map semantic variant to token size
function getMappedSize(variant: Variant): keyof typeof TypeTokens.sizes {
  switch (variant) {
    case 'display':
      return 'xxl';
    case 'heading':
      return 'xl';
    case 'title':
      return 'l';
    case 'body':
      return 'm';
    case 'caption':
      return 's';
    case 'small':
      return 'xs';
    default:
      return 'm';
  }
}
