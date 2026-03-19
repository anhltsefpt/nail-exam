import { AICharacter } from '@/components/AICharacter';
import { Typography } from '@/components/ui/Typography';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { track } from '@/lib/analytics';
import { useQuizStore } from '@/store/useQuizStore';
import { useUserStore } from '@/store/useUserStore';

import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, BookOpen, Check, HelpCircle, Lightbulb, Type, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    PanResponder,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import Animated, {
    Easing,
    FadeIn,
    FadeOut,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function QuizScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    categoryId,
    topicId,
    offset,
    limit,
    topicName,
    topicNameEn,
    topicNameVn,
    setIndex: setIndexStr,
  } = useLocalSearchParams<{
    categoryId: string;
    topicId: string;
    offset: string;
    limit: string;
    topicName: string;
    topicNameEn: string;
    topicNameVn: string;
    setIndex: string;
  }>();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  // --- Quiz Store ---
  const {
    activeQuestions,
    currentIndex,
    selectedOptionId,
    showResult,
    isRoundComplete,
    roundCorrectCount,
    roundMistakes,
    firstTryMistakeIds,
    masteredIds,
    totalQuestionsCount,
    isLoading,
    error,
    loadQuestions,
    selectOption,
    submitAnswer,
    nextQuestion,
    startNextRound,
    resetQuiz,
    bypassSet,
  } = useQuizStore();

  // --- User Store (persistent) ---
  const recordAnswer = useUserStore((state) => state.recordAnswer);
  const addMistake = useUserStore((state) => state.addMistake);
  const completeNode = useUserStore((state) => state.completeNode);
  const updateNodeProgress = useUserStore((state) => state.updateNodeProgress);
  const updateSetProgress = useUserStore((state) => state.updateSetProgress);
  const fontScale = useUserStore((state) => state.fontScale);
  const setFontScale = useUserStore((state) => state.setFontScale);

  const nodeId = parseInt(categoryId || '1', 10);
  const setIndex = parseInt(setIndexStr || '0', 10);
  const { count: topicQuestionCount } = useQuestionCount(topicId || '');
  const topicSets = divideIntoSets(topicQuestionCount, 20);

  // --- Load questions from Supabase on mount ---
  useEffect(() => {
    if (topicId && offset && limit) {
      loadQuestions(topicId, parseInt(offset, 10), parseInt(limit, 10));
      track('quiz_start', { categoryId, topicId, setIndex });
    }

    return () => {
      resetQuiz();
    };
  }, [topicId, offset, limit]);

  // --- Debug bypass: tap 'Lesson Progress' label, then hold '%' for 5s (within 15s) ---
  const bypassTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bypassArmedAtRef = useRef<number | null>(null);

  const handleArmBypass = useCallback(() => {
    bypassArmedAtRef.current = Date.now();
  }, []);

  const handleMasteryPressIn = useCallback(() => {
    const armedAt = bypassArmedAtRef.current;
    if (!armedAt || Date.now() - armedAt > 15000) return;
    bypassTimerRef.current = setTimeout(() => {
      bypassArmedAtRef.current = null;
      bypassSet();
    }, 5000);
  }, [bypassSet]);

  const handleMasteryPressOut = useCallback(() => {
    if (bypassTimerRef.current) {
      clearTimeout(bypassTimerRef.current);
      bypassTimerRef.current = null;
    }
  }, []);

  // --- Font Slider ---
  const [showFontMenu, setShowFontMenu] = React.useState(false);
  const TRACK_WIDTH = 180;
  const MIN_SCALE = 0.8;
  const MAX_SCALE = 1.4;
  const startScaleRef = useRef(fontScale);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startScaleRef.current = useUserStore.getState().fontScale;
      },
      onPanResponderMove: (evt, gestureState) => {
        const { dx } = gestureState;
        const deltaScale = (dx / TRACK_WIDTH) * (MAX_SCALE - MIN_SCALE);
        let newScale = startScaleRef.current + deltaScale;
        newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
        setFontScale(parseFloat(newScale.toFixed(2)));
      },
    }),
  ).current;

  const thumbPosition = ((fontScale - MIN_SCALE) / (MAX_SCALE - MIN_SCALE)) * TRACK_WIDTH;
  const clampedThumbPos = Math.max(0, Math.min(TRACK_WIDTH, thumbPosition));

  // Dynamic Font Styles
  const questionTextStyle = {
    fontSize: 24 * fontScale,
    lineHeight: 32 * fontScale,
  };
  const optionTextStyle = {
    fontSize: 16 * fontScale,
    lineHeight: 24 * fontScale,
  };

  // --- Mastery ---
  const masteryPercentage =
    totalQuestionsCount > 0 ? Math.round((masteredIds.length / totalQuestionsCount) * 100) : 0;

  // Save progress to user store whenever mastery updates
  useEffect(() => {
    updateNodeProgress(nodeId, masteryPercentage);
  }, [masteredIds.length]);

  // --- Handlers ---
  const currentQuestion = activeQuestions[currentIndex];

  const handleOptionSelect = (optionId: string) => {
    if (showResult || isRoundComplete) return;
    selectOption(optionId);
    const state = useQuizStore.getState();
    const question = state.activeQuestions[state.currentIndex];
    if (!question) return;
    const result = useQuizStore.getState().submitAnswer();
    if (result) {
      recordAnswer(question.id, result.isCorrect, optionId);
      // Track first-attempt wrong answers in the Mistakes list
      if (!result.isCorrect) {
        addMistake(
          question.id,
          topicId || '',
          topicName || '',
          topicNameEn || '',
          topicNameVn || '',
        );
      }
    }
  };

  const handleContinue = () => {
    if (!showResult || isRoundComplete) return;
    nextQuestion();
  };

  const handleFinishRound = () => {
    const firstTryScore =
      totalQuestionsCount > 0
        ? Math.round(
            ((totalQuestionsCount - firstTryMistakeIds.length) / totalQuestionsCount) * 100,
          )
        : 0;

    if (topicId) {
      updateSetProgress(topicId, setIndex, firstTryScore);
    }
    track('quiz_finish', {
      topicId,
      setIndex,
      score: firstTryScore,
      total: totalQuestionsCount,
    });

    // Check if ALL sets in this topic are now completed
    const currentProgress = useUserStore.getState().topicSetProgress[topicId || ''] || {};
    // Include the current set's score (since updateSetProgress was just called, it may not be reflected yet)
    const updatedProgress = { ...currentProgress, [setIndex]: firstTryScore };
    const totalSets = topicSets.length || 1;
    const allSetsPassed = Array.from(
      { length: totalSets },
      (_, i) => (updatedProgress[i] || 0) >= 75,
    ).every(Boolean);

    if (allSetsPassed) {
      completeNode(nodeId);
      updateNodeProgress(nodeId, 100);
    } else {
      // Partial progress: percentage of sets passed
      const passedCount = Array.from(
        { length: totalSets },
        (_, i) => (updatedProgress[i] || 0) >= 75,
      ).filter(Boolean).length;
      updateNodeProgress(nodeId, Math.round((passedCount / totalSets) * 100));
    }
  };

  // Trigger persistent store updates when round completes
  useEffect(() => {
    if (isRoundComplete) {
      handleFinishRound();
    }
  }, [isRoundComplete]);

  const handleAIChat = (prompt?: string) => {
    let chatContext = t('quiz.aiChatContext');
    if (currentQuestion) {
      const correctOption = currentQuestion.options.find(
        (o) => o.id === currentQuestion.correctOptionId,
      );
      chatContext = [
        `${t('quiz.aiChatQuestion')}: ${currentQuestion.text}`,
        ``,
        `${t('quiz.aiChatAnswerChoices')}:`,
        ...currentQuestion.options.map((o, i) => `  ${String.fromCharCode(65 + i)}) ${o.text}`),
        ``,
        `${t('quiz.aiChatCorrectAnswer')}: ${correctOption ? correctOption.text : t('quiz.aiChatUnknown')}`,
      ].join('\n');

      if (selectedOptionId) {
        const selectedText = currentQuestion.options.find((o) => o.id === selectedOptionId)?.text;
        const isCorrect = selectedOptionId === currentQuestion.correctOptionId;
        chatContext += `\n\n${t('quiz.aiChatUserSelected')}: ${selectedText} (${isCorrect ? t('quiz.aiChatCorrect') : t('quiz.aiChatIncorrect')})`;
      }
    }

    track('quiz_ai_chat', { prompt: prompt || 'open' });
    router.push({
      pathname: '/ai-chat',
      params: {
        context: chatContext,
        initialPrompt: prompt,
        autoSend: prompt ? 'true' : undefined,
      },
    });
  };

  // --- Loading / Error States ---
  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: '#F2F2F2', justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={theme.primary} />
        <Typography variant="body" color="muted" style={{ marginTop: Spacing.m }}>
          {t('quiz.loading', { defaultValue: 'Loading questions...' })}
        </Typography>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: '#F2F2F2',
            justifyContent: 'center',
            alignItems: 'center',
            padding: Spacing.xl,
          },
        ]}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <Typography variant="heading" weight="bold" align="center">
          {t('quiz.errorTitle', { defaultValue: 'Oops!' })}
        </Typography>
        <Typography variant="body" color="muted" align="center" style={{ marginTop: Spacing.s }}>
          {error}
        </Typography>
        <TouchableOpacity
          style={[styles.summaryButton, { marginTop: Spacing.xl }]}
          onPress={() => router.back()}
        >
          <Typography variant="body" weight="bold" color="inverted">
            {t('quiz.goBack', { defaultValue: 'Go Back' })}
          </Typography>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // --- Round Summary ---
  if (isRoundComplete) {
    const firstTryCorrect = totalQuestionsCount - firstTryMistakeIds.length;

    return (
      <ResultView
        score={firstTryCorrect}
        total={totalQuestionsCount}
        categoryId={categoryId || '1'}
        topicId={topicId || ''}
        setIndex={setIndex}
        router={router}
      />
    );
  }

  if (!currentQuestion) return null;

  const isCurrentAnswerWrong = showResult && selectedOptionId !== currentQuestion.correctOptionId;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F2F2F2' }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { zIndex: 20 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>

        {/* Stats in Header */}
        <View style={styles.headerStats}>
          <View style={styles.statPill}>
            <Check size={14} color={theme.success} />
            <Typography variant="caption" weight="bold" style={{ marginLeft: 4 }}>
              {masteredIds.length}
            </Typography>
          </View>
          <View style={styles.statPill}>
            <X size={14} color={theme.error} />
            <Typography variant="caption" weight="bold" style={{ marginLeft: 4 }}>
              {roundMistakes.length}
            </Typography>
          </View>
        </View>

        <View style={[styles.headerRight, { zIndex: 20 }]}>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => setShowFontMenu(!showFontMenu)}
          >
            <Type size={20} color={showFontMenu ? theme.primary : theme.text} />
          </TouchableOpacity>

          {/* Font Menu Dropdown */}
          {showFontMenu && (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
              style={[styles.fontMenu, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <Typography variant="caption" style={{ marginRight: Spacing.s }}>
                A
              </Typography>
              <View
                style={[styles.sliderTrackContainer, { width: TRACK_WIDTH }]}
                {...panResponder.panHandlers}
              >
                <View
                  style={{
                    position: 'absolute',
                    top: -15,
                    bottom: -15,
                    left: 0,
                    right: 0,
                    backgroundColor: 'transparent',
                  }}
                />
                <View style={[styles.sliderTrack, { backgroundColor: theme.input }]} />
                <View
                  style={[
                    styles.sliderFill,
                    { width: clampedThumbPos, backgroundColor: theme.primary },
                  ]}
                />
                <View
                  style={[
                    styles.sliderThumb,
                    {
                      left: clampedThumbPos - 12,
                      borderColor: theme.border,
                      backgroundColor: theme.card,
                    },
                  ]}
                />
              </View>
              <Typography variant="heading" style={{ marginLeft: Spacing.s }}>
                A
              </Typography>
            </Animated.View>
          )}
        </View>
      </View>

      {/* Progress Bar (Percentage) */}
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBarInfo,
            { marginBottom: 4, flexDirection: 'row', justifyContent: 'space-between' },
          ]}
        >
          <TouchableOpacity onPress={handleArmBypass} activeOpacity={1}>
            <Typography variant="caption" color="muted">
              {t('quiz.lessonProgress')}
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            onPressIn={handleMasteryPressIn}
            onPressOut={handleMasteryPressOut}
            activeOpacity={1}
          >
            <Typography variant="caption" weight="bold" color="primary">
              {masteryPercentage}%
            </Typography>
          </TouchableOpacity>
        </View>
        <View
          style={[styles.progressBarTrack, { backgroundColor: theme.input, flexDirection: 'row' }]}
        >
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${totalQuestionsCount > 0 ? (masteredIds.length / totalQuestionsCount) * 100 : 0}%`,
                backgroundColor: theme.success,
              },
            ]}
          />
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${totalQuestionsCount > 0 ? (roundMistakes.length / totalQuestionsCount) * 100 : 0}%`,
                backgroundColor: theme.error,
              },
            ]}
          />
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Question Info */}
        <View style={styles.questionHeader}>
          <Typography variant="caption" color="muted" weight="medium">
            {t('quiz.questionProgress', {
              current: currentIndex + 1,
              total: activeQuestions.length,
            })}
          </Typography>
        </View>

        {/* Question Text */}
        <Typography variant="heading" style={[styles.questionText, questionTextStyle]}>
          {currentQuestion.text}
        </Typography>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const isCorrectOption = option.id === currentQuestion.correctOptionId;
            let optionStyle = styles.option;

            if (showResult) {
              if (isCorrectOption) {
                optionStyle = { ...styles.option, ...styles.optionCorrect };
              } else if (isSelected && !isCorrectOption) {
                optionStyle = { ...styles.option, ...styles.optionIncorrect };
              }
            } else if (isSelected) {
              optionStyle = { ...styles.option, ...styles.optionSelected };
            }

            const renderIndicator = () => {
              if (showResult && isCorrectOption) {
                return (
                  <View style={[styles.iconCircle, { backgroundColor: '#7EC8A4' }]}>
                    <Check size={14} color="white" strokeWidth={3} />
                  </View>
                );
              }
              if (showResult && isSelected && !isCorrectOption) {
                return (
                  <View style={[styles.iconCircle, { backgroundColor: '#E8878C' }]}>
                    <X size={14} color="white" strokeWidth={3} />
                  </View>
                );
              }
              if (isSelected && !showResult) {
                return (
                  <View style={[styles.radioOuter, { borderColor: theme.primary }]}>
                    <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />
                  </View>
                );
              }
              return <View style={styles.radioOuter} />;
            };

            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  optionStyle,
                  { borderColor: isSelected && !showResult ? theme.primary : theme.border },
                ]}
                onPress={() => handleOptionSelect(option.id)}
                disabled={showResult}
                activeOpacity={0.7}
              >
                <Typography variant="body" style={[{ flex: 1 }, optionTextStyle]}>
                  {option.text}
                </Typography>
                {renderIndicator()}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explanation */}
        {showResult && currentQuestion.explanation && (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={[
              styles.explanationCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.s }}>
              <Lightbulb size={18} color="#F0C97E" />
              <Typography
                variant="caption"
                weight="bold"
                style={{ marginLeft: Spacing.xs, color: '#B8941F' }}
              >
                {t('quiz.explanationTitle', { defaultValue: 'Explanation' })}
              </Typography>
            </View>
            <Typography variant="body" color="muted" style={[{ lineHeight: 22 }, optionTextStyle]}>
              {currentQuestion.explanation}
            </Typography>
          </Animated.View>
        )}
      </ScrollView>

      <View style={styles.stickyBottom}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsContainer}
          contentContainerStyle={styles.chipsContent}
        >
          {isCurrentAnswerWrong && (
            <TouchableOpacity
              style={[styles.chip, styles.chipWrong]}
              onPress={() => handleAIChat(t('quiz.whyWrong'))}
            >
              <HelpCircle size={16} color="#E8878C" />
              <Typography variant="caption" style={[styles.chipText, { color: '#E8878C' }]}>
                {t('quiz.whyWrong')}
              </Typography>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.chip, { borderColor: theme.border }]}
            onPress={() => handleAIChat(t('quiz.hint'))}
          >
            <Lightbulb size={16} color="#F0C97E" />
            <Typography variant="caption" style={styles.chipText}>
              {t('quiz.hint')}
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, { borderColor: theme.border }]}
            onPress={() => handleAIChat(t('quiz.diveDeep'))}
          >
            <BookOpen size={16} color={theme.primary} />
            <Typography variant="caption" style={styles.chipText}>
              {t('quiz.diveDeep')}
            </Typography>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.aiButton} onPress={() => handleAIChat()}>
            <AICharacter size={48} animated />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.continueButton,
              showResult ? styles.continueButtonActive : styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!showResult}
            activeOpacity={0.8}
          >
            <Typography variant="body" weight="bold" color={showResult ? 'inverted' : 'muted'}>
              {showResult
                ? currentIndex < activeQuestions.length - 1
                  ? t('quiz.nextQuestion')
                  : t('quiz.finishRound')
                : t('quiz.checkAnswer')}
            </Typography>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.m,
  },
  backButton: { padding: Spacing.xs },
  headerStats: { flexDirection: 'row', gap: Spacing.s },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.m },
  headerIcon: { padding: Spacing.xs },
  fontMenu: {
    position: 'absolute',
    top: 40,
    right: 0,
    width: 260,
    padding: Spacing.m,
    borderRadius: Radius.m,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  sliderTrackContainer: { height: 30, justifyContent: 'center' },
  sliderTrack: { width: '100%', height: 4, borderRadius: 2, backgroundColor: '#E5E7EB' },
  sliderFill: { position: 'absolute', height: 4, borderRadius: 2, left: 0 },
  sliderThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  progressContainer: { paddingHorizontal: Spacing.l, marginBottom: Spacing.m },
  progressBarTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%' },
  progressBarInfo: { flexDirection: 'row', justifyContent: 'space-between' },
  content: { flex: 1 },
  contentContainer: { padding: Spacing.l, paddingBottom: Spacing.xl },
  questionHeader: { marginBottom: Spacing.m },
  questionText: { marginBottom: Spacing.xl, lineHeight: 32 },
  optionsContainer: { gap: Spacing.m },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.l,
    borderRadius: Radius.l,
    borderWidth: 1,
    backgroundColor: '#FAF8F8',
  },
  optionSelected: { backgroundColor: 'rgba(242, 167, 179, 0.08)', borderWidth: 2 },
  optionCorrect: {
    backgroundColor: 'rgba(126, 200, 164, 0.15)',
    borderColor: '#7EC8A4',
    borderWidth: 2,
  },
  optionIncorrect: {
    backgroundColor: 'rgba(232, 135, 140, 0.12)',
    borderColor: '#E8878C',
    borderWidth: 2,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: { width: 12, height: 12, borderRadius: 6 },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyBottom: { borderTopWidth: 1, borderTopColor: '#E6E1E2', backgroundColor: 'white' },
  chipsContainer: { paddingVertical: Spacing.s },
  chipsContent: { paddingHorizontal: Spacing.l, gap: Spacing.s },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.s,
    paddingHorizontal: Spacing.m,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginRight: Spacing.s,
    backgroundColor: 'white',
  },
  chipWrong: { borderColor: '#FCD5DB', backgroundColor: '#FFF5F6' },
  chipText: { marginLeft: Spacing.xs },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.m,
    paddingBottom: Spacing.xl,
    gap: Spacing.m,
  },
  aiButton: {},
  continueButton: {
    flex: 1,
    borderRadius: Radius.full,
    paddingVertical: Spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonActive: {
    backgroundColor: '#C4607A',
    shadowColor: '#C4607A',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  continueButtonDisabled: { backgroundColor: '#E6E1E2' },
  statCard: {
    padding: Spacing.l,
    borderRadius: Radius.l,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    width: '100%',
  },
  summaryButton: {
    backgroundColor: '#F2A7B3',
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
  },
  explanationCard: {
    marginTop: Spacing.l,
    padding: Spacing.l,
    borderRadius: Radius.l,
    borderWidth: 1,
  },
});

// ---- Inline Result View Component ----

function ResultView({
  score,
  total,
  categoryId,
  topicId,
  setIndex,
  router,
}: {
  score: number;
  total: number;
  categoryId: string;
  topicId: string;
  setIndex: number;
  router: any;
}) {
  const { count: questionCount } = useQuestionCount(topicId);
  const sets = divideIntoSets(questionCount, 20);
  const { t } = useTranslation();

  // Animations
  const gaugeScale = useSharedValue(0.8);
  const gaugeOpacity = useSharedValue(0);
  const dashOffset = useSharedValue(534.07);
  const scoreOpacity = useSharedValue(0);
  const scoreTranslateY = useSharedValue(6);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(16);
  const badgeOpacity = useSharedValue(0);
  const badgeScale = useSharedValue(0.8);
  const buttonsOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(30);

  useEffect(() => {
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 700 }));
    titleTranslateY.value = withDelay(
      200,
      withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) }),
    );

    gaugeScale.value = withDelay(
      400,
      withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }),
    );
    gaugeOpacity.value = withDelay(400, withTiming(1, { duration: 900 }));

    const targetOffset = 534.07 * (1 - score / total);
    dashOffset.value = withDelay(
      800,
      withTiming(targetOffset, { duration: 1800, easing: Easing.out(Easing.cubic) }),
    );

    scoreOpacity.value = withDelay(1400, withTiming(1, { duration: 600 }));
    scoreTranslateY.value = withDelay(1400, withTiming(0, { duration: 600 }));

    badgeOpacity.value = withDelay(2000, withTiming(1, { duration: 400 }));
    badgeScale.value = withDelay(
      2000,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.5)) }),
    );

    buttonsOpacity.value = withDelay(2200, withTiming(1, { duration: 700 }));
    buttonsTranslateY.value = withDelay(
      2200,
      withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) }),
    );
  }, []);

  const gaugeAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));
  const gaugeStyle = useAnimatedStyle(() => ({
    opacity: gaugeOpacity.value,
    transform: [{ scale: gaugeScale.value }],
  }));
  const scoreStyle = useAnimatedStyle(() => ({
    opacity: scoreOpacity.value,
    transform: [{ translateY: scoreTranslateY.value }],
  }));
  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
    transform: [{ scale: badgeScale.value }],
  }));
  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsTranslateY.value }],
  }));

  const handleContinue = () => {
    const isLastSet = setIndex >= sets.length - 1;
    if (isLastSet) {
      router.replace('/(tabs)');
    } else {
      useUserStore.getState().setFlashSetIndex(setIndex + 1);
      router.back();
    }
  };

  const handleTryAgain = () => {
    // Re-start the same quiz set
    useQuizStore.getState().loadQuestions(topicId, 0, total, 'en');
  };

  return (
    <LinearGradient
      colors={['#FFF5F7', '#FFFBFA', '#FFFBFA']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 0.5 }}
      style={rStyles.container}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View style={rStyles.content}>
        {/* Mascot */}
        <AICharacter size={80} animated />

        {/* Title */}
        <Animated.View
          style={[{ alignItems: 'center', marginTop: 16, marginBottom: 32 }, titleStyle]}
        >
          <Typography variant="display" weight="bold" style={{ fontSize: 28, color: '#1C1017' }}>
            {t('quiz.resultTitle')}
          </Typography>
          <Typography variant="body" style={{ color: '#78616B', marginTop: 4 }}>
            {t('quiz.resultSubtitle')}
          </Typography>
        </Animated.View>

        {/* Gauge */}
        <Animated.View style={[rStyles.gaugeContainer, gaugeStyle]}>
          <Svg
            width={220}
            height={220}
            viewBox="0 0 200 200"
            style={{ transform: [{ rotate: '-90deg' }] }}
          >
            <Defs>
              <SvgLinearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#F472B6" />
                <Stop offset="50%" stopColor="#EC4899" />
                <Stop offset="100%" stopColor="#F43F5E" />
              </SvgLinearGradient>
            </Defs>
            <Circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="#F5E6EA"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <AnimatedCircle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="url(#gauge-grad)"
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray="534.07"
              animatedProps={gaugeAnimatedProps}
              opacity="0.15"
            />
            <AnimatedCircle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="url(#gauge-grad)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray="534.07"
              animatedProps={gaugeAnimatedProps}
            />
          </Svg>
          <Animated.View style={[rStyles.gaugeCenter, scoreStyle]}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Typography
                style={{ fontSize: 56, fontWeight: 'bold', color: '#1C1017', lineHeight: 68 }}
              >
                {score}
              </Typography>
              <Typography
                style={{ fontSize: 28, fontWeight: '600', color: '#A8929B', lineHeight: 34 }}
              >
                /{total}
              </Typography>
            </View>
            <Typography style={{ fontSize: 13, fontWeight: '500', color: '#78616B', marginTop: 4 }}>
              {t('quiz.resultCorrectOnFirstTry')}
            </Typography>
          </Animated.View>
        </Animated.View>

        {/* Badge */}
        <Animated.View style={[rStyles.badge, badgeStyle]}>
          <Typography style={{ fontSize: 14 }}>✨</Typography>
          <Typography weight="semibold" style={{ color: '#E11D48', marginLeft: 4, fontSize: 14 }}>
            {score === total ? t('quiz.resultPerfect') : t('quiz.resultAlmostPerfect')}
          </Typography>
        </Animated.View>
      </View>

      {/* Bottom Actions */}
      <Animated.View style={[rStyles.bottomActions, buttonsStyle]}>
        <TouchableOpacity style={rStyles.btnPrimary} onPress={handleContinue}>
          <Typography weight="bold" style={{ color: 'white', fontSize: 17 }}>
            {t('quiz.resultContinue')}
          </Typography>
        </TouchableOpacity>
        {score < total && (
          <TouchableOpacity style={rStyles.btnSecondary} onPress={handleTryAgain}>
            <Typography weight="bold" style={{ color: '#C24A62', fontSize: 17 }}>
              {t('quiz.resultTryAgain')}
            </Typography>
          </TouchableOpacity>
        )}
      </Animated.View>
    </LinearGradient>
  );
}

import { divideIntoSets, useQuestionCount } from '@/hooks/useQuestions';

const rStyles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 120,
  },
  gaugeContainer: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  gaugeCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244,114,182,0.1)',
    borderColor: 'rgba(244,114,182,0.15)',
    borderWidth: 1,
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 48,
    backgroundColor: 'rgba(255,251,250,0.9)',
    gap: 12,
  },
  btnPrimary: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: '#E8567D',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E8567D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 5,
  },
  btnSecondary: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FCC4EC',
  },
});
