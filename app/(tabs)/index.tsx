import { MultipleChoiceQuestion } from '@/components/quiz/MultipleChoiceQuestion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      padding: Spacing.l,
    },
    header: {
      marginBottom: Spacing.xl,
    },
    statsCard: {
      marginBottom: Spacing.xl,
      padding: Spacing.m,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.m,
    },
    progressCircle: {
      height: 48,
      width: 48,
      borderRadius: Radius.full,
      backgroundColor: theme.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dailyQuestion: {
      marginBottom: Spacing.xl,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Typography variant="display" color="primary" style={{ marginBottom: 4 }}>
            Hello, {user?.fullName?.givenName || 'Student'}!
          </Typography>
          <Typography variant="body" color="muted">
            Ready to ace your Nail Tech Exam?
          </Typography>
          {user && (
            <Button
              label="Sign Out"
              variant="outline"
              style={{ marginTop: 16 }}
              onPress={signOut}
            />
          )}
        </View>

        {/* Quick Stats Card */}
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View>
              <Typography variant="title">Daily Goal</Typography>
              <Typography variant="caption" color="muted">
                3/5 Modules
              </Typography>
            </View>
            <View style={styles.progressCircle}>
              <Typography variant="small" weight="bold" color="primary">
                60%
              </Typography>
            </View>
          </View>
          <Button label="Continue Studying" fullWidth icon="book" />
          <View style={{ height: 16 }} />
          <Button
            label="View Design System"
            variant="outline"
            fullWidth
            icon="color-palette"
            onPress={() => router.push('/design-system')}
          />
        </Card>

        {/* Daily Question */}
        <View style={styles.dailyQuestion}>
          <Typography variant="heading" style={{ marginBottom: 12 }}>
            Daily Question
          </Typography>
          <Card variant="outlined">
            <MultipleChoiceQuestion
              question="Which of the following is NOT a single-use item?"
              options={[
                { id: '1', text: 'Wooden Pusher' },
                { id: '2', text: 'Cotton Ball' },
                { id: '3', text: 'Metal Pusher' },
                { id: '4', text: 'Paper Towel' },
              ]}
              selectedOptionId={selectedOpt}
              onSelectOption={setSelectedOpt}
              correctOptionId={selectedOpt ? '3' : undefined}
              status={selectedOpt ? 'result' : 'answering'}
            />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
