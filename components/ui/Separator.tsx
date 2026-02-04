import React from 'react';
import { View, useColorScheme } from 'react-native';
import { Colors } from '../../constants/theme';

export function Separator({ vertical = false }: { vertical?: boolean }) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View
      style={{
        backgroundColor: theme.border,
        height: vertical ? '100%' : 1,
        width: vertical ? 1 : '100%',
      }}
    />
  );
}
