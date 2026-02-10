import { AICharacter } from '@/components/AICharacter';
import { Typography } from '@/components/ui/Typography';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { getNodeLabel, getQuestionsByNodeId, Question } from '@/data/questions';
import { useUserStore } from '@/store/useUserStore';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
    ArrowLeft,
    Bookmark,
    BookOpen,
    Check,
    HelpCircle,
    Lightbulb,
    RefreshCw,
    ThumbsDown,
    ThumbsUp,
    Type,
    X
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    PanResponder,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QuizScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const nodeId = parseInt(categoryId || '1', 10);
    const initialQuestions = getQuestionsByNodeId(nodeId);
    const nodeLabel = getNodeLabel(nodeId);

    // --- Mastery Logic State ---
    // List of questions currently being practiced (starts with all)
    const [activeQuestions, setActiveQuestions] = useState<Question[]>(initialQuestions);
    // Index in the activeQuestions array
    const [currentIndex, setCurrentIndex] = useState(0);

    // Tracking for the CURRENT round
    const [roundMistakes, setRoundMistakes] = useState<string[]>([]);
    const [roundCorrectCount, setRoundCorrectCount] = useState(0);

    // Tracking for OVERALL session mastery (unique IDs correctly answered)
    const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());

    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);

    // UI State
    const [showFontMenu, setShowFontMenu] = useState(false);
    const [isRoundComplete, setIsRoundComplete] = useState(false);

    // Store
    const savedQuestions = useUserStore((state) => state.savedQuestions);
    const likedQuestions = useUserStore((state) => state.likedQuestions);
    const dislikedQuestions = useUserStore((state) => state.dislikedQuestions);
    const toggleSavedQuestion = useUserStore((state) => state.toggleSavedQuestion);
    const likeQuestion = useUserStore((state) => state.likeQuestion);
    const dislikeQuestion = useUserStore((state) => state.dislikeQuestion);
    const recordAnswer = useUserStore((state) => state.recordAnswer);
    const completeNode = useUserStore((state) => state.completeNode);
    const updateNodeProgress = useUserStore((state) => state.updateNodeProgress);
    const fontScale = useUserStore((state) => state.fontScale);
    const setFontScale = useUserStore((state) => state.setFontScale);

    const currentQuestion = activeQuestions[currentIndex];
    const isSaved = currentQuestion ? savedQuestions.includes(currentQuestion.id) : false;
    const isLiked = currentQuestion ? likedQuestions.includes(currentQuestion.id) : false;
    const isDisliked = currentQuestion ? dislikedQuestions.includes(currentQuestion.id) : false;

    // Font Slider Logic
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
        })
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

    // Calculate Progress
    const totalQuestionsCount = initialQuestions.length; // Always based on total original questions
    const masteryPercentage = Math.round((masteredIds.size / totalQuestionsCount) * 100);

    // Save progress to store whenever mastery updates
    useEffect(() => {
        updateNodeProgress(nodeId, masteryPercentage);
        if (masteredIds.size === totalQuestionsCount) {
            // Optional: Auto-complete if 100% mastery reached during session?
            // Maybe wait for user to finish the round.
        }
    }, [masteredIds.size]);

    const handleSelectOption = (optionId: string) => {
        if (showResult || isRoundComplete) return;
        setSelectedOptionId(optionId);
    };

    const handleContinue = () => {
        if (isRoundComplete) {
            // Logic handled in Round Summary view
            return;
        }

        if (!showResult && selectedOptionId && currentQuestion) {
            // Submit Answer
            const isCorrect = selectedOptionId === currentQuestion.correctOptionId;
            setShowResult(true);

            // Record Answer
            recordAnswer(currentQuestion.id, isCorrect, selectedOptionId);

            if (isCorrect) {
                setRoundCorrectCount(prev => prev + 1);
                // Mark as mastered
                setMasteredIds(prev => new Set(prev).add(currentQuestion.id));
            } else {
                setRoundMistakes(prev => [...prev, currentQuestion.id]);
                // If previously mastered, remove it? (Strict mastery)
                // For now, let's keep it simple: once mastered, always tracked, but WRONG in this round means re-do.
            }

        } else if (showResult) {
            // Next Question
            if (currentIndex < activeQuestions.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setSelectedOptionId(null);
                setShowResult(false);
            } else {
                // End of Round
                finishRound();
            }
        }
    };

    const finishRound = () => {
        setIsRoundComplete(true);
        if (roundMistakes.length === 0) {
            // Perfect round!
            completeNode(nodeId);
            updateNodeProgress(nodeId, 100);
        }
    };

    const startNextRound = () => {
        // Filter questions to only include mistakes from the previous round
        const nextQuestions = initialQuestions.filter(q => roundMistakes.includes(q.id));

        setActiveQuestions(nextQuestions);
        setCurrentIndex(0);
        setRoundMistakes([]);
        setRoundCorrectCount(0);
        setSelectedOptionId(null);
        setShowResult(false);
        setIsRoundComplete(false);
    };

    const handleAIChat = (prompt?: string) => {
        router.push({
            pathname: '/ai-chat',
            params: {
                context: currentQuestion ? `Question: ${currentQuestion.text}` : 'Quiz Context',
                initialPrompt: prompt,
            },
        });
    };

    // Render Round Summary
    if (isRoundComplete) {
        const isPerfect = roundMistakes.length === 0;

        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl }]}>
                <Stack.Screen options={{ headerShown: false }} />

                <AICharacter size={120} animated />

                <Typography variant="heading" weight="bold" align="center" style={{ marginTop: Spacing.l }}>
                    {isPerfect ? t('quiz.lessonComplete') : t('quiz.roundComplete')}
                </Typography>

                <Typography variant="body" color="muted" align="center" style={{ marginTop: Spacing.s, marginBottom: Spacing.xl }}>
                    {isPerfect
                        ? t('quiz.masteredAll', { count: totalQuestionsCount })
                        : t('quiz.mistakesInfo', { count: roundMistakes.length })}
                </Typography>

                <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Typography variant="title" color="primary">{masteryPercentage}%</Typography>
                    <Typography variant="caption" color="muted">{t('quiz.totalMastery')}</Typography>
                </View>

                {isPerfect ? (
                    <TouchableOpacity style={styles.summaryButton} onPress={() => router.back()}>
                        <Typography variant="body" weight="bold" color="inverted">{t('quiz.finishLesson')}</Typography>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.summaryButton} onPress={startNextRound}>
                        <RefreshCw size={20} color="white" style={{ marginRight: 8 }} />
                        <Typography variant="body" weight="bold" color="inverted">{t('quiz.reviewMistakes', { count: roundMistakes.length })}</Typography>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={{ marginTop: Spacing.l }} onPress={() => router.back()}>
                    <Typography variant="body" color="muted">{t('quiz.exit')}</Typography>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (!currentQuestion) return null;

    const isCurrentAnswerWrong = showResult && selectedOptionId !== currentQuestion.correctOptionId;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
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
                        <Typography variant="caption" weight="bold" style={{ marginLeft: 4 }}>{roundCorrectCount}</Typography>
                    </View>
                    <View style={styles.statPill}>
                        <X size={14} color={theme.error} />
                        <Typography variant="caption" weight="bold" style={{ marginLeft: 4 }}>{roundMistakes.length}</Typography>
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
                            <Typography variant="caption" style={{ marginRight: Spacing.s }}>A</Typography>
                            <View
                                style={[styles.sliderTrackContainer, { width: TRACK_WIDTH }]}
                                {...panResponder.panHandlers}
                            >
                                <View style={{ position: 'absolute', top: -15, bottom: -15, left: 0, right: 0, backgroundColor: 'transparent' }} />
                                <View style={[styles.sliderTrack, { backgroundColor: theme.input }]} />
                                <View style={[styles.sliderFill, { width: clampedThumbPos, backgroundColor: theme.primary }]} />
                                <View style={[
                                    styles.sliderThumb,
                                    {
                                        left: clampedThumbPos - 12,
                                        borderColor: theme.border,
                                        backgroundColor: theme.card
                                    }
                                ]} />
                            </View>
                            <Typography variant="heading" style={{ marginLeft: Spacing.s }}>A</Typography>
                        </Animated.View>
                    )}
                </View>
            </View>

            {/* Progress Bar (Percentage) */}
            <View style={styles.progressContainer}>
                <View style={[styles.progressBarInfo, { marginBottom: 4, flexDirection: 'row', justifyContent: 'space-between' }]}>
                    <Typography variant="caption" color="muted">{t('quiz.lessonProgress')}</Typography>
                    <Typography variant="caption" weight="bold" color="primary">{masteryPercentage}%</Typography>
                </View>
                <View style={[styles.progressBarTrack, { backgroundColor: theme.input }]}>
                    <View style={[styles.progressBarFill, { width: `${masteryPercentage}%`, backgroundColor: theme.primary }]} />
                </View>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {/* Question Info */}
                <View style={styles.questionHeader}>
                    <Typography variant="caption" color="muted" weight="medium">
                        {t('quiz.questionProgress', { current: currentIndex + 1, total: activeQuestions.length })}
                    </Typography>
                    <View style={styles.questionActions}>
                        <TouchableOpacity onPress={() => likeQuestion(currentQuestion.id)} style={[styles.actionButton, isLiked && styles.actionButtonActive]}>
                            <ThumbsUp size={18} color={isLiked ? theme.primary : theme.textMuted} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => dislikeQuestion(currentQuestion.id)} style={[styles.actionButton, isDisliked && styles.actionButtonActive]}>
                            <ThumbsDown size={18} color={isDisliked ? theme.error : theme.textMuted} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => toggleSavedQuestion(currentQuestion.id)} style={[styles.actionButton, isSaved && styles.actionButtonActive]}>
                            <Bookmark size={18} color={isSaved ? theme.primary : theme.textMuted} fill={isSaved ? theme.primary : 'transparent'} />
                        </TouchableOpacity>
                    </View>
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
                                style={[optionStyle, { borderColor: isSelected && !showResult ? theme.primary : theme.border }]}
                                onPress={() => handleSelectOption(option.id)}
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
            </ScrollView>

            <View style={styles.stickyBottom}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer} contentContainerStyle={styles.chipsContent}>
                    {isCurrentAnswerWrong && (
                        <TouchableOpacity style={[styles.chip, styles.chipWrong]} onPress={() => handleAIChat('Why is my answer wrong?')}>
                            <HelpCircle size={16} color="#E8878C" />
                            <Typography variant="caption" style={[styles.chipText, { color: '#E8878C' }]}>{t('quiz.whyWrong')}</Typography>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={[styles.chip, { borderColor: theme.border }]} onPress={() => handleAIChat('Give me a hint.')}>
                        <Lightbulb size={16} color="#F0C97E" />
                        <Typography variant="caption" style={styles.chipText}>{t('quiz.hint')}</Typography>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.chip, { borderColor: theme.border }]} onPress={() => handleAIChat('Explain.')}>
                        <BookOpen size={16} color={theme.primary} />
                        <Typography variant="caption" style={styles.chipText}>{t('quiz.explain')}</Typography>
                    </TouchableOpacity>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.aiButton} onPress={() => handleAIChat()}>
                        <AICharacter size={48} animated />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.continueButton, !selectedOptionId && !showResult && styles.continueButtonDisabled]}
                        onPress={handleContinue}
                        disabled={!selectedOptionId && !showResult}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={selectedOptionId || showResult ? ['#F2A7B3', '#D98E99'] : ['#E6E1E2', '#D1CACC']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.continueGradient}
                        >
                            <Typography variant="body" weight="bold" color={selectedOptionId || showResult ? 'inverted' : 'muted'}>
                                {showResult
                                    ? (currentIndex < activeQuestions.length - 1 ? t('quiz.nextQuestion') : t('quiz.finishRound'))
                                    : t('quiz.checkAnswer')}
                            </Typography>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.l, paddingVertical: Spacing.m },
    backButton: { padding: Spacing.xs },
    headerStats: { flexDirection: 'row', gap: Spacing.s },
    statPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.m },
    headerIcon: { padding: Spacing.xs },
    fontMenu: { position: 'absolute', top: 40, right: 0, width: 260, padding: Spacing.m, borderRadius: Radius.m, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5 },
    sliderTrackContainer: { height: 30, justifyContent: 'center' },
    sliderTrack: { width: '100%', height: 4, borderRadius: 2, backgroundColor: '#E5E7EB' },
    sliderFill: { position: 'absolute', height: 4, borderRadius: 2, left: 0 },
    sliderThumb: { position: 'absolute', width: 24, height: 24, borderRadius: 12, backgroundColor: 'white', borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 3 },
    progressContainer: { paddingHorizontal: Spacing.l, marginBottom: Spacing.m },
    progressBarTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 3 },
    progressBarInfo: { flexDirection: 'row', justifyContent: 'space-between' },
    content: { flex: 1 },
    contentContainer: { padding: Spacing.l, paddingBottom: Spacing.xl },
    questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.m },
    questionActions: { flexDirection: 'row', gap: Spacing.s },
    actionButton: { padding: Spacing.xs, borderRadius: Radius.m },
    actionButtonActive: { backgroundColor: 'rgba(242, 167, 179, 0.1)' },
    questionText: { marginBottom: Spacing.xl, lineHeight: 32 },
    optionsContainer: { gap: Spacing.m },
    option: { flexDirection: 'row', alignItems: 'center', padding: Spacing.l, borderRadius: Radius.l, borderWidth: 1, backgroundColor: '#FAF8F8' },
    optionSelected: { backgroundColor: 'rgba(242, 167, 179, 0.08)', borderWidth: 2 },
    optionCorrect: { backgroundColor: 'rgba(126, 200, 164, 0.15)', borderColor: '#7EC8A4', borderWidth: 2 },
    optionIncorrect: { backgroundColor: 'rgba(232, 135, 140, 0.12)', borderColor: '#E8878C', borderWidth: 2 },
    radioOuter: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
    radioInner: { width: 12, height: 12, borderRadius: 6 },
    iconCircle: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    stickyBottom: { borderTopWidth: 1, borderTopColor: '#E6E1E2', backgroundColor: 'white' },
    chipsContainer: { paddingVertical: Spacing.s },
    chipsContent: { paddingHorizontal: Spacing.l, gap: Spacing.s },
    chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.s, paddingHorizontal: Spacing.m, borderRadius: Radius.full, borderWidth: 1, marginRight: Spacing.s, backgroundColor: 'white' },
    chipWrong: { borderColor: '#FCD5DB', backgroundColor: '#FFF5F6' },
    chipText: { marginLeft: Spacing.xs },
    footer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.l, paddingVertical: Spacing.m, paddingBottom: Spacing.xl, gap: Spacing.m },
    aiButton: {},
    continueButton: { flex: 1, borderRadius: Radius.full, overflow: 'hidden' },
    continueButtonDisabled: { opacity: 0.7 },
    continueGradient: { paddingVertical: Spacing.l, alignItems: 'center', justifyContent: 'center' },
    statCard: { padding: Spacing.l, borderRadius: Radius.l, borderWidth: 1, alignItems: 'center', marginBottom: Spacing.xl, width: '100%' },
    summaryButton: { backgroundColor: '#F2A7B3', paddingVertical: Spacing.m, paddingHorizontal: Spacing.xl, borderRadius: Radius.full, flexDirection: 'row', alignItems: 'center' },
});
