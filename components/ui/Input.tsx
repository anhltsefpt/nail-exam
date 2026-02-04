import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  useColorScheme,
  View,
} from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { Typography } from './Typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
}

export function Input({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const borderColor = error ? theme.error : isFocused ? theme.primary : theme.input;

  const backgroundColor = theme.backgroundSubtle;

  return (
    <View style={{ marginBottom: Spacing.m, width: '100%' }}>
      {label && (
        <Typography
          variant="caption"
          weight="medium"
          style={{ marginBottom: Spacing.xs, color: theme.textMuted }}
        >
          {label}
        </Typography>
      )}

      <View
        style={[
          styles.container,
          {
            borderColor,
            backgroundColor,
          },
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? theme.primary : theme.textMuted}
            style={{ marginRight: Spacing.s }}
          />
        )}

        <TextInput
          style={[styles.input, { color: theme.text }, style]}
          placeholderTextColor={theme.textMuted}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor={theme.primary}
          {...props}
        />

        {rightIcon && (
          <Pressable onPress={onRightIconPress}>
            <Ionicons
              name={rightIcon}
              size={20}
              color={theme.textMuted}
              style={{ marginLeft: Spacing.s }}
            />
          </Pressable>
        )}
      </View>

      {error && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <Ionicons name="alert-circle" size={14} color={theme.error} style={{ marginRight: 4 }} />
          <Typography variant="small" color="error">
            {error}
          </Typography>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.m,
    paddingHorizontal: Spacing.m,
    height: 48, // Standard touch target
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: undefined, // Let system font take over via style reset if needed, or stick to defaults
    fontSize: 16,
  },
});
