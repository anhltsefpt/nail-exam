import { AICharacter } from '@/components/AICharacter';
import { CategoryCard } from '@/components/course/CategoryCard';
import { DashboardActionButtons } from '@/components/dashboard/DashboardActionButtons';
import { ProbabilityCard } from '@/components/dashboard/ProbabilityCard';
import { EdgeFunctionDemo } from '@/components/EdgeFunctionDemo';
import { MultipleChoiceQuestion } from '@/components/quiz/MultipleChoiceQuestion';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'expo-router';
import { AlertTriangle, BookOpen, FlaskConical, Gem, Menu, ShieldCheck, User } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { isPro } = useRevenueCat();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  // Store state
  const name = useUserStore((state) => state.name);
  const courseProgress = useUserStore((state) => state.courseProgress);
  const streak = useUserStore((state) => state.streak);
  const gems = useUserStore((state) => state.gems);
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
    stickyHeader: {
      backgroundColor: theme.background,
      paddingHorizontal: Spacing.l, // 16px
      paddingTop: 4, // Ultra compact
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      paddingBottom: 4, // Ultra compact
      zIndex: 10,
    },
    scrollContent: {
      padding: Spacing.l,
      paddingTop: Spacing.m,
    },
    header: {
      marginBottom: Spacing.s, // 8px
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logoBox: {
      width: 28, // Reduced from 32
      height: 28,
      backgroundColor: '#0F172A',
      borderRadius: Radius.m,
      alignItems: 'center',
      justifyContent: 'center',
    },
    gemBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFBEB', // Amber-50
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: '#FEF3C7',
    },
    dailyQuestion: {
      marginTop: Spacing.l,
      marginBottom: Spacing.xl,
    },
    fab: {
      position: 'absolute',
      bottom: Spacing.xl,
      right: Spacing.l,
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadows[colorScheme].l,
      shadowColor: theme.secondary,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Sticky Header Section */}
      <View style={styles.stickyHeader}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.logoBox}>
                <FlaskConical size={16} color="white" />
              </View>
              <View style={{ marginLeft: 8 }}>
                <Typography variant="caption" color="muted" style={{ fontSize: 10, lineHeight: 12 }}>{t('dashboard.title')}</Typography>
                <Typography variant="body" weight="bold" style={{ fontSize: 14, lineHeight: 20 }}>{t('dashboard.subtitle')}</Typography>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.gemBadge}>
                <Typography variant="caption" weight="bold" style={{ marginRight: 4, color: '#D97706' }}>{gems}</Typography>
                <Gem size={12} color="#D97706" fill="#FCD34D" />
              </View>
              <TouchableOpacity style={{ marginLeft: 12 }} onPress={() => router.push('/menu')}>
                <Menu size={20} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Probability Card (Ultra Compact) */}
        <ProbabilityCard probability={0.0} onImprove={() => { }} />

        {/* Action Buttons (Ultra Compact) */}
        <DashboardActionButtons
          onDailyChallengePress={() => { }}
          onGetProPress={() => router.push('/paywall')}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Categories List */}
        <View style={{ marginBottom: 100 }}>
          <Typography variant="heading" style={{ marginBottom: 12 }}>
            {t('dashboard.myCourses')}
          </Typography>

          <CategoryCard
            title={t('dashboard.categories.generalKnowledge')}
            subtitle={t('dashboard.categories.generalKnowledgeSubtitle')}
            progress={courseProgress}
            icon={<BookOpen size={24} color={theme.primary} />}
            onPress={() => router.push('/learning-path')}
          />

          <CategoryCard
            title={t('dashboard.categories.salonEcology')}
            subtitle={t('dashboard.categories.salonEcologySubtitle')}
            progress={0}
            icon={<ShieldCheck size={24} color={theme.primary} />}
            locked
            onPress={() => { }}
          />

          <CategoryCard
            title={t('dashboard.categories.anatomyPhysiology')}
            subtitle={t('dashboard.categories.anatomyPhysiologySubtitle')}
            progress={0}
            icon={<User size={24} color={theme.primary} />}
            locked
            onPress={() => { }}
          />

          <CategoryCard
            title={t('dashboard.categories.nailSkinDisorders')}
            subtitle={t('dashboard.categories.nailSkinDisordersSubtitle')}
            progress={0}
            icon={<AlertTriangle size={24} color={theme.primary} />}
            locked
            onPress={() => { }}
          />

          <CategoryCard
            title={t('dashboard.categories.chemistry')}
            subtitle={t('dashboard.categories.chemistrySubtitle')}
            progress={0}
            icon={<FlaskConical size={24} color={theme.primary} />}
            locked
            onPress={() => { }}
          />
        </View>

        {/* Daily Question */}
        <View style={styles.dailyQuestion}>
          <Typography variant="heading" style={{ marginBottom: 12 }}>
            {t('dashboard.todaysQuestion')}
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
