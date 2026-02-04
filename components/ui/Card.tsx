import React from 'react';
import { useColorScheme, View, ViewProps } from 'react-native';
import { Colors, Radius, Shadows, Spacing } from '../../constants/theme';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: keyof typeof Spacing;
}

export function Card({
  children,
  style,
  variant = 'elevated',
  padding = 'm',
  ...props
}: CardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const getStyle = () => {
    const baseStyle = {
      borderRadius: Radius.l,
      backgroundColor: theme.card,
      padding: Spacing[padding],
    };

    let variantStyle = {};
    if (variant === 'elevated') {
      variantStyle = {
        ...Shadows[colorScheme].sm,
      };
    } else if (variant === 'outlined') {
      variantStyle = {
        borderWidth: 1,
        borderColor: theme.cardBorder,
        ...Shadows[colorScheme].sm, // Subtle shadow even for outlined often looks good
        shadowOpacity: 0.02,
      };
    } else {
      // Flat
      variantStyle = {
        backgroundColor: theme.backgroundSubtle,
      };
    }

    return [baseStyle, variantStyle, style];
  };

  return (
    <View style={getStyle()} {...props}>
      {children}
    </View>
  );
}
