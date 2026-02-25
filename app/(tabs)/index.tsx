import { AICharacter } from '@/components/AICharacter';
import { CategorySection, computeExitSide } from '@/components/roadmap/CategorySection';
import { Typography } from '@/components/ui/Typography';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import { useTopics } from '@/hooks/useTopics';
import { track } from '@/lib/analytics';
import { useIsStoreHydrated, useUserStore } from '@/store/useUserStore';
import { useRouter } from 'expo-router';
import { FlaskConical } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isPro, isReady: isRevenueCatReady } = useRevenueCat();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];


  const courseProgress = useUserStore((s) => s.courseProgress);
  const mistakes = useUserStore((s) => s.mistakes);
  const mistakeCount = mistakes.length;
  const nodeProgress = useUserStore((s) => s.nodeProgress);
  const { categories, loading, error } = useTopics();
  const isStoreHydrated = useIsStoreHydrated();

  // Global "current" node = highest nodeId with any recorded progress across ALL sections.
  // Falls back to 1 (first node) if the user hasn't started anything yet.
  const allNodeIds = categories.flatMap(c => c.nodes.map(n => n.id));
  const accessedGlobally = allNodeIds.filter(id => (nodeProgress[id] || 0) > 0);
  const globalCurrentNodeId = accessedGlobally.length > 0
    ? Math.max(...accessedGlobally)
    : 1;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundSubtle,
    },
    stickyHeader: {
      backgroundColor: theme.background,
      paddingHorizontal: Spacing.l,
      paddingTop: 4,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      paddingBottom: 8,
      zIndex: 10,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logoBox: {
      width: 28,
      height: 28,
      backgroundColor: theme.primary,
      borderRadius: Radius.m,
      alignItems: 'center',
      justifyContent: 'center',
    },

    roadmapHeader: {
      paddingHorizontal: Spacing.l,
      paddingTop: Spacing.l,
      paddingBottom: Spacing.s,
    },
    progressBarContainer: {
      height: 6,
      backgroundColor: theme.input,
      marginHorizontal: Spacing.l,
      borderRadius: 3,
      overflow: 'hidden',
      marginBottom: Spacing.m,
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: theme.primary,
      borderRadius: 3,
    },
    scrollContent: {
      paddingBottom: 120,
    },
    fab: {
      position: 'absolute',
      bottom: Spacing.xl,
      right: Spacing.l,
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadows[colorScheme].l,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 60,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Sticky Header */}
      <View style={styles.stickyHeader}>
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.logoBox}>
              <FlaskConical size={16} color="white" />
            </View>
            <View style={{ marginLeft: 8 }}>
              <Typography variant="caption" color="muted" style={{ fontSize: 10, lineHeight: 12 }}>
                {t('dashboard.title')}
              </Typography>
              <Typography variant="body" weight="bold" style={{ fontSize: 14, lineHeight: 20 }}>
                {t('dashboard.subtitle')}
              </Typography>
            </View>
          </View>
          <View />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Roadmap Header */}
        <View style={styles.roadmapHeader}>
          <Typography variant="display" style={{ fontSize: 26 }}>
            {t('dashboard.roadMap')}
          </Typography>
          <Typography variant="caption" color="muted" style={{ marginTop: 2 }}>
            {t('dashboard.completedProgress', { progress: courseProgress })}
          </Typography>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${Math.max(courseProgress, 2)}%` }]} />
        </View>

        {/* Category Sections — chained via exit side */}
        {(!isStoreHydrated || !isRevenueCatReady || loading) ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : categories.reduce<{ elements: React.ReactNode[]; startFromLeft: boolean; prevPhaseIndex: 1 | 2 | 3 | 4 | undefined }>(
          (acc, cat, idx) => {
            acc.elements.push(
              <CategorySection
                key={cat.id}
                title={cat.title}
                phaseIndex={cat.phaseIndex}
                prevPhaseIndex={acc.prevPhaseIndex}
                nodes={cat.nodes}
                rowPattern={cat.rowPattern}
                startFromLeft={acc.startFromLeft}
                isFirst={idx === 0}
                isLast={idx === categories.length - 1}
                isPro={isPro}
                onPressPaywall={() => router.push('/paywall')}
                currentNodeId={globalCurrentNodeId}
              />
            );
            const exitSide = computeExitSide(cat.rowPattern, acc.startFromLeft);
            // Next category starts from the opposite side of where the exit arrives
            acc.startFromLeft = exitSide === 'right';
            acc.prevPhaseIndex = cat.phaseIndex;
            return acc;
          },
          { elements: [], startFromLeft: true, prevPhaseIndex: undefined }
        ).elements}
      </ScrollView>

      {/* Floating AI Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          track('tap_ai_chat', { source: 'fab' });
          if (isPro) {
            router.push('/ai-chat');
          } else {
            router.push('/paywall');
          }
        }}
      >
        <AICharacter size={60} animated />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

