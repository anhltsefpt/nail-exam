import { AICharacter } from '@/components/AICharacter';
import { EdgeFunctionDemo } from '@/components/EdgeFunctionDemo';
import { MultipleChoiceQuestion } from '@/components/quiz/MultipleChoiceQuestion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { isPro } = useRevenueCat();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  // Store state
  const name = useUserStore((state) => state.name);
  const courseProgress = useUserStore((state) => state.courseProgress);
  const streak = useUserStore((state) => state.streak);
  const recordAnswer = useUserStore((state) => state.recordAnswer);
  const addXp = useUserStore((state) => state.addXp);

  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);

  const handleAnswer = (optionId: string) => {
    setSelectedOpt(optionId);
    const isCorrect = optionId === '3';
    recordAnswer('daily-question-1', isCorrect, optionId);
    if (isCorrect) {
      addXp(10);
    }
  };

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
    fab: {
      position: 'absolute',
      bottom: Spacing.xl,
      right: Spacing.l,
      // Removed fixed width/height/bgcolor to let character define it
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadows[colorScheme].l,
      // shadowColor handled by character or we can keep it here
      shadowColor: theme.secondary, // Make shadow pink
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Typography variant="display" color="primary" style={{ marginBottom: 4 }}>
            Hello, {name}!
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
                Streak: {streak} days
              </Typography>
            </View>
            <View style={styles.progressCircle}>
              <Typography variant="small" weight="bold" color="primary">
                {courseProgress}%
              </Typography>
            </View>
          </View>
          <Button
            label="Continue Studying"
            fullWidth
            icon="book"
            onPress={() => router.push('/learning-path')}
          />
          <View style={{ height: 16 }} />
          <Button
            label="View Design System"
            variant="outline"
            fullWidth
            icon="color-palette"
            onPress={() => router.push('/design-system')}
          />
          {!isPro && (
            <>
              <View style={{ height: 16 }} />
              <Button
                label="Unlock Premium"
                variant="primary"
                fullWidth
                icon="lock-closed"
                onPress={() => router.push('/paywall')}
              />
            </>
          )}
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
              onSelectOption={handleAnswer}
              correctOptionId={selectedOpt ? '3' : undefined}
              status={selectedOpt ? 'result' : 'answering'}
            />
          </Card>
        </View>

        {/* Edge Function Demo */}
        {user && <EdgeFunctionDemo />}
      </ScrollView>

      {/* Floating AI Button */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/ai-chat')}>
        <AICharacter size={60} animated />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
