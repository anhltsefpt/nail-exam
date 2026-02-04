import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { Colors, Spacing } from '@/constants/theme';
import React from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.l,
    },
    textBlock: {
      marginBottom: Spacing.xxl,
      alignItems: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.textBlock}>
        <Typography variant="display" style={{ marginBottom: Spacing.l }}>
          Profile
        </Typography>
        <Typography variant="body" color="muted" align="center">
          Manage your subscription, study history, and app settings here.
        </Typography>
      </View>

      <Button label="Log Out" variant="destructive" />
    </SafeAreaView>
  );
}
