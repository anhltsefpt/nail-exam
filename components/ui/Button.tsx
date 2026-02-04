import { Ionicons } from '@expo/vector-icons'; // Assuming Expo, fallback to others if needed
import React from 'react';
import {
  ActivityIndicator,
  TouchableOpacity,
  TouchableOpacityProps,
  useColorScheme,
  ViewStyle,
} from 'react-native';
import { Colors, Radius, Shadows, Spacing } from '../../constants/theme';
import { Typography } from './Typography';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const getStyles = () => {
    // 1. Base Container Styles
    const containerBase: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Radius.m,
      opacity: disabled || loading ? 0.6 : 1,
    };

    // 2. Size Styles
    let sizeStyle: ViewStyle = {};
    if (size === 'sm') {
      sizeStyle = { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.m, height: 32 };
    } else if (size === 'md') {
      sizeStyle = { paddingVertical: Spacing.s, paddingHorizontal: Spacing.l, height: 44 };
    } else if (size === 'lg') {
      sizeStyle = { paddingVertical: Spacing.m, paddingHorizontal: Spacing.xl, height: 56 };
    }

    // 3. Variant Styles (Bg & Border)
    let variantStyle: ViewStyle = {};
    if (variant === 'primary') {
      variantStyle = {
        backgroundColor: theme.primary,
        ...Shadows[colorScheme].m,
        shadowColor: theme.primary, // Colored shadow
      };
    } else if (variant === 'secondary') {
      variantStyle = {
        backgroundColor: theme.secondary,
        ...Shadows[colorScheme].sm,
      };
    } else if (variant === 'outline') {
      variantStyle = {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.border,
      };
    } else if (variant === 'ghost') {
      variantStyle = {
        backgroundColor: 'transparent',
      };
    } else if (variant === 'destructive') {
      variantStyle = {
        backgroundColor: theme.error,
      };
    }

    // 4. Full Width
    if (fullWidth) {
      containerBase.width = '100%';
    }

    return [containerBase, sizeStyle, variantStyle, style];
  };

  const getTextColor = () => {
    if (variant === 'primary' || variant === 'secondary' || variant === 'destructive') {
      return 'inverted';
    }
    if (variant === 'outline' || variant === 'ghost') {
      return 'default'; // Or primary color if you prefer generic links
    }
    return 'default';
  };

  const textColor = getTextColor();
  const iconColor = textColor === 'inverted' ? theme.textInverted : theme.text;
  const textSize = size === 'lg' ? 'heading' : size === 'sm' ? 'caption' : 'body';

  return (
    <TouchableOpacity
      style={getStyles()}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons name={icon} size={18} color={iconColor} style={{ marginRight: Spacing.s }} />
          )}

          <Typography variant={textSize as any} weight="medium" color={textColor as any}>
            {label}
          </Typography>

          {icon && iconPosition === 'right' && (
            <Ionicons name={icon} size={18} color={iconColor} style={{ marginLeft: Spacing.s }} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}
