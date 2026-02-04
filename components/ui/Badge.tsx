import React from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import { Colors, Radius } from '../../constants/theme';
import { Typography } from './Typography';

type BadgeVariant = 'default' | 'outline' | 'secondary' | 'destructive' | 'success' | 'warning';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  let backgroundColor = theme.primary;
  let borderColor = 'transparent';
  let textColor = theme.primaryForeground;

  if (variant === 'outline') {
    backgroundColor = 'transparent';
    borderColor = theme.border;
    textColor = theme.text;
  } else if (variant === 'secondary') {
    backgroundColor = theme.secondary;
    textColor = theme.primaryForeground;
  } else if (variant === 'destructive') {
    backgroundColor = theme.error;
    textColor = theme.primaryForeground;
  } else if (variant === 'success') {
    backgroundColor = theme.success;
    textColor = '#fff';
  } else if (variant === 'warning') {
    backgroundColor = theme.warning;
    textColor = '#fff'; // or black depending on contrast
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor,
          borderWidth: variant === 'outline' ? 1 : 0,
        },
      ]}
    >
      <Typography variant="small" weight="bold" style={{ color: textColor, fontSize: 10 }}>
        {label.toUpperCase()}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
