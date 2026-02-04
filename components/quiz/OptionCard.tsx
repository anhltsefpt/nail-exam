import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { Typography } from '../ui/Typography';

export type OptionStatus = 'idle' | 'selected' | 'correct' | 'incorrect';

interface OptionCardProps {
  id: string;
  label: string;
  status?: OptionStatus;
  selected?: boolean;
  onPress: () => void;
  indexLabel?: string; // e.g., "A", "B"
}

export function OptionCard({
  id,
  label,
  status = 'idle',
  selected = false,
  onPress,
  indexLabel,
}: OptionCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  // Determine colors based on status
  let borderColor = theme.border;
  let backgroundColor = theme.card;
  let iconName: keyof typeof Ionicons.glyphMap | null = null;
  let iconColor = theme.primary;

  if (status === 'selected' || selected) {
    borderColor = theme.primary;
    backgroundColor = theme.primaryLight; // 10% opacity primary
  }

  if (status === 'correct') {
    borderColor = theme.success;
    backgroundColor = 'rgba(16, 185, 129, 0.1)';
    iconName = 'checkmark-circle';
    iconColor = theme.success;
  }

  if (status === 'incorrect') {
    borderColor = theme.error;
    backgroundColor = 'rgba(239, 68, 68, 0.1)';
    iconName = 'close-circle';
    iconColor = theme.error;
  }

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        {
          borderColor,
          backgroundColor,
        },
      ]}
    >
      <View style={styles.content}>
        {indexLabel && (
          <View style={[styles.indexBadge, { backgroundColor: theme.backgroundSubtle }]}>
            <Typography variant="small" weight="bold">
              {indexLabel}
            </Typography>
          </View>
        )}

        <Typography variant="body" style={{ flex: 1, marginHorizontal: Spacing.s }}>
          {label}
        </Typography>

        {/* Status Icon */}
        {iconName ? (
          <Ionicons name={iconName} size={24} color={iconColor} />
        ) : (
          // Show radio/checkbox-like circle if simply selecting
          <View
            style={[
              styles.radioCircle,
              {
                borderColor: selected ? theme.primary : theme.border,
                borderWidth: selected ? 6 : 2,
              },
            ]}
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderRadius: Radius.m,
    padding: Spacing.m,
    marginBottom: Spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  indexBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
