import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, useColorScheme } from 'react-native';
import { Colors, Radius } from '../../constants/theme';

interface CheckboxProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, disabled }: CheckboxProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <Pressable
      onPress={() => !disabled && onChange?.(!checked)}
      style={[
        styles.container,
        {
          borderColor: checked ? theme.primary : theme.border,
          backgroundColor: checked ? theme.primary : 'transparent',
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      {checked && <Ionicons name="checkmark" size={14} color={theme.primaryForeground} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 20,
    height: 20,
    borderRadius: Radius.s,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
