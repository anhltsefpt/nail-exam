import { AICharacter } from '@/components/AICharacter';
import { Typography } from '@/components/ui/Typography';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useMistakeQuestions } from '@/hooks/useMistakeQuestions';
import { track } from '@/lib/analytics';
import { MistakeRecord, useUserStore } from '@/store/useUserStore';

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, BookOpen, Check, HelpCircle, Lightbulb, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// ── Types ──────────────────────────────────────────────────────────────────
interface SessionQuestion {
    questionId: string;
    topicId: string;
    topicName: string;
    consecutiveCorrect: number; // as stored when session started / updated live
}

// ── Component ──────────────────────────────────────────────────────────────
export default function MistakeQuizScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const { mode, topicId, topicName, topicNameEn, topicNameVn } = useLocalSearchParams<{
        mode: 'all' | 'topic';
        topicId?: string;
        topicName?: string;
        topicNameEn?: string;
        topicNameVn?: string;
    }>();

    // --- Store ---
    const allMistakes = useUserStore((s) => s.mistakes);
    const recordMistakeAnswer = useUserStore((s) => s.recordMistakeAnswer);
    const language = useUserStore((s) => s.language);

    // Filter to relevant mistakes for this session
    const initialMistakes = useMemo<MistakeRecord[]>(() => {
        if (mode === 'topic' && topicId) {
            return allMistakes.filter((m) => String(m.topicId) === String(topicId));
        }
        return [...allMistakes];
    }, []); // snapshot on mount only

    // IDs in the current session; removed when answered correctly 2×
    const [sessionIds, setSessionIds] = useState<string[]>(
        initialMistakes.map((m) => m.questionId),
    );

    // Round-robin index into sessionIds
    const [roundIndex, setRoundIndex] = useState(0);

    // Consecutive correct count tracked locally per question during the session
    const consecutiveRef = useRef<Record<string, number>>(
        Object.fromEntries(initialMistakes.map((m) => [m.questionId, m.consecutiveCorrect])),
    );

    // Quiz UI state
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    // Fetch question data
    const { questions: allQuestions, loading, error } = useMistakeQuestions(
        initialMistakes.map((m) => m.questionId),
    );

    useEffect(() => {
        if (isComplete) {
            track('mistake_quiz_completed', { mode, topicId: topicId || 'all' });
        }
    }, [isComplete, mode, topicId]);

    // Build a lookup for fast access
    const questionMap = useMemo(
        () => new Map(allQuestions.map((q) => [q.id, q])),
        [allQuestions],
    );

    // Current question to display
    const currentId = sessionIds.length > 0 ? sessionIds[roundIndex % sessionIds.length] : null;
    const currentQuestion = currentId ? questionMap.get(currentId) ?? null : null;

    // ── Handlers ──────────────────────────────────────────────────────────
    const handleOptionSelect = useCallback(
        (optionId: string) => {
            if (showResult || !currentQuestion) return;
            setSelectedOptionId(optionId);

            const isCorrect = optionId === currentQuestion.correctOptionId;
            const qId = currentQuestion.id;



            // Update consecutive counter locally
            const prev = consecutiveRef.current[qId] ?? 0;
            const next = isCorrect ? prev + 1 : 0;
            consecutiveRef.current[qId] = next;

            // Persist to store
            recordMistakeAnswer(qId, isCorrect);

            setShowResult(true);

            // If cleared (2 consecutive), schedule removal from session after user taps continue
        },
        [showResult, currentQuestion, recordMistakeAnswer],
    );

    const handleContinue = useCallback(() => {
        if (!showResult || !currentId) return;

        const cleared = (consecutiveRef.current[currentId] ?? 0) >= 2;

        setSessionIds((prev) => {
            const next = cleared ? prev.filter((id) => id !== currentId) : prev;
            if (next.length === 0) {
                setIsComplete(true);
                return next;
            }
            // advance index only if we didn't remove the current item
            // (if removed, the same index now points to the next item)
            setRoundIndex((ri) => {
                const newLen = next.length;
                if (cleared) {
                    // Keep index in bounds
                    return ri % newLen;
                }
                return (ri + 1) % newLen;
            });
            return next;
        });

        setSelectedOptionId(null);
        setShowResult(false);
    }, [showResult, currentId]);

    const handleAIChat = useCallback((prompt?: string) => {
        let chatContext = 'Mistake Review Context';
        if (currentQuestion) {
            chatContext = `Question: ${currentQuestion.text}\n\nOptions:\n${currentQuestion.options.map(o => `- ${o.text}`).join('\n')}`;
            if (selectedOptionId) {
                const selectedText = currentQuestion.options.find(o => o.id === selectedOptionId)?.text;
                chatContext += `\n\nUser selected: ${selectedText}`;
            }
        }

        track('mistake_quiz_ai_chat', { prompt: prompt || 'open' });
        router.push({
            pathname: '/ai-chat',
            params: {
                context: chatContext,
                initialPrompt: prompt,
                autoSend: prompt ? 'true' : undefined,
            },
        });
    }, [currentQuestion, selectedOptionId]);

    // ── Loading / Error ───────────────────────────────────────────────────
    if (loading) {
        return (
            <SafeAreaView
                style={[styles.container, { backgroundColor: '#F2F2F2', justifyContent: 'center', alignItems: 'center' }]}
            >
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color={theme.primary} />
                <Typography variant="body" color="muted" style={{ marginTop: Spacing.m }}>
                    {t('mistakeQuiz.loading')}
                </Typography>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView
                style={[styles.container, { backgroundColor: '#F2F2F2', justifyContent: 'center', alignItems: 'center', padding: Spacing.xl }]}
            >
                <Stack.Screen options={{ headerShown: false }} />
                <Typography variant="heading" weight="bold" align="center">{t('mistakeQuiz.oops')}</Typography>
                <Typography variant="body" color="muted" align="center" style={{ marginTop: Spacing.s }}>{error}</Typography>
                <TouchableOpacity style={[styles.summaryButton, { marginTop: Spacing.xl }]} onPress={() => router.back()}>
                    <Typography variant="body" weight="bold" style={{ color: 'white' }}>{t('mistakeQuiz.goBack')}</Typography>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // ── Complete Screen ────────────────────────────────────────────────────
    if (isComplete || sessionIds.length === 0) {
        return (
            <SafeAreaView
                style={[styles.container, { backgroundColor: '#F2F2F2', justifyContent: 'center', alignItems: 'center', padding: Spacing.xl }]}
            >
                <Stack.Screen options={{ headerShown: false }} />
                <AICharacter size={120} animated />
                <Typography variant="heading" weight="bold" align="center" style={{ marginTop: Spacing.l, fontSize: 24 }}>
                    {t('mistakeQuiz.allClear')}
                </Typography>
                <Typography variant="body" color="muted" align="center" style={{ marginTop: Spacing.s, marginBottom: Spacing.xl }}>
                    {t('mistakeQuiz.allClearSubtitle')}
                </Typography>
                <TouchableOpacity style={styles.summaryButton} onPress={() => router.back()}>
                    <Typography variant="body" weight="bold" style={{ color: 'white' }}>{t('mistakeQuiz.done')}</Typography>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (!currentQuestion) return null;

    const isCurrentAnswerWrong = showResult && selectedOptionId !== currentQuestion.correctOptionId;
    const consecutiveCorrect = consecutiveRef.current[currentQuestion.id] ?? 0;
    const isNextClear = consecutiveCorrect >= 2;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#F2F2F2' }]} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={theme.text} />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Typography variant="caption" color="muted">
                        {mode === 'topic' ? (language === 'vi' && topicNameVn ? topicNameVn : (topicNameEn || topicName)) : t('mistakeQuiz.allMistakes')}
                    </Typography>
                    <Typography variant="caption" weight="bold" color="muted">
                        {sessionIds.length} {t('mistakeQuiz.remaining')}
                    </Typography>
                </View>

                {/* Progress dots for current question */}
                <View style={{ flexDirection: 'row', gap: 6, paddingRight: Spacing.s }}>
                    {[0, 1].map((i) => (
                        <View
                            key={i}
                            style={{
                                width: 10,
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: i < consecutiveCorrect ? theme.success : theme.input,
                                borderWidth: 1,
                                borderColor: i < consecutiveCorrect ? theme.success : theme.border,
                            }}
                        />
                    ))}
                </View>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {/* Question */}
                <Typography variant="heading" style={styles.questionText}>
                    {currentQuestion.text}
                </Typography>

                {/* Options */}
                <View style={styles.optionsContainer}>
                    {currentQuestion.options.map((option) => {
                        const isSelected = selectedOptionId === option.id;
                        const isCorrectOption = option.id === currentQuestion.correctOptionId;
                        let optionStyle: any = styles.option;

                        if (showResult) {
                            if (isCorrectOption) optionStyle = { ...styles.option, ...styles.optionCorrect };
                            else if (isSelected) optionStyle = { ...styles.option, ...styles.optionIncorrect };
                        } else if (isSelected) {
                            optionStyle = { ...styles.option, ...styles.optionSelected };
                        }

                        return (
                            <TouchableOpacity
                                key={option.id}
                                style={[optionStyle, { borderColor: isSelected && !showResult ? theme.primary : theme.border }]}
                                onPress={() => handleOptionSelect(option.id)}
                                disabled={showResult}
                                activeOpacity={0.7}
                            >
                                <Typography variant="body" style={{ flex: 1 }}>{option.text}</Typography>
                                {showResult && isCorrectOption && (
                                    <View style={[styles.iconCircle, { backgroundColor: '#7EC8A4' }]}>
                                        <Check size={14} color="white" strokeWidth={3} />
                                    </View>
                                )}
                                {showResult && isSelected && !isCorrectOption && (
                                    <View style={[styles.iconCircle, { backgroundColor: '#E8878C' }]}>
                                        <X size={14} color="white" strokeWidth={3} />
                                    </View>
                                )}
                                {!showResult && isSelected && (
                                    <View style={[styles.radioOuter, { borderColor: theme.primary }]}>
                                        <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />
                                    </View>
                                )}
                                {!isSelected && !showResult && <View style={styles.radioOuter} />}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Explanation */}
                {showResult && currentQuestion.explanation && (
                    <Animated.View
                        entering={FadeIn.duration(300)}
                        style={[styles.explanationCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.s }}>
                            <Lightbulb size={18} color="#F0C97E" />
                            <Typography variant="caption" weight="bold" style={{ marginLeft: Spacing.xs, color: '#B8941F' }}>
                                {t('quiz.explanationTitle', { defaultValue: 'Explanation' })}
                            </Typography>
                        </View>
                        <Typography variant="body" color="muted" style={{ lineHeight: 22 }}>
                            {currentQuestion.explanation}
                        </Typography>
                    </Animated.View>
                )}
            </ScrollView>

            <View style={styles.stickyBottom}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer} contentContainerStyle={styles.chipsContent}>
                    {isCurrentAnswerWrong && (
                        <TouchableOpacity style={[styles.chip, styles.chipWrong]} onPress={() => handleAIChat(t('quiz.whyWrong'))}>
                            <HelpCircle size={16} color="#E8878C" />
                            <Typography variant="caption" style={[styles.chipText, { color: '#E8878C' }]}>{t('quiz.whyWrong', { defaultValue: 'Why is my answer wrong?' })}</Typography>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={[styles.chip, { borderColor: theme.border }]} onPress={() => handleAIChat(t('quiz.hint'))}>
                        <Lightbulb size={16} color="#F0C97E" />
                        <Typography variant="caption" style={styles.chipText}>{t('quiz.hint', { defaultValue: 'Hint' })}</Typography>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.chip, { borderColor: theme.border }]} onPress={() => handleAIChat(t('quiz.explain'))}>
                        <BookOpen size={16} color={theme.primary} />
                        <Typography variant="caption" style={styles.chipText}>{t('quiz.explain', { defaultValue: 'Explain' })}</Typography>
                    </TouchableOpacity>
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.aiButton} onPress={() => handleAIChat()}>
                        <AICharacter size={48} animated />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.continueButton, showResult ? styles.continueButtonActive : styles.continueButtonDisabled]}
                        onPress={handleContinue}
                        disabled={!showResult}
                        activeOpacity={0.8}
                    >
                        <Typography variant="body" weight="bold" color={showResult ? 'inverted' : 'muted'}>
                            {!showResult
                                ? t('mistakeQuiz.checkAnswer')
                                : isNextClear
                                    ? t('mistakeQuiz.cleared')
                                    : t('mistakeQuiz.continue')}
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
        paddingHorizontal: Spacing.l,
        paddingVertical: Spacing.m,
    },
    backButton: { padding: Spacing.xs },
    headerCenter: { flex: 1, alignItems: 'center' },
    content: { flex: 1 },
    contentContainer: { padding: Spacing.l, paddingBottom: Spacing.xl },
    questionText: { marginBottom: Spacing.xl, lineHeight: 32, fontSize: 22 },
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
    optionCorrect: { backgroundColor: 'rgba(126, 200, 164, 0.15)', borderColor: '#7EC8A4', borderWidth: 2 },
    optionIncorrect: { backgroundColor: 'rgba(232, 135, 140, 0.12)', borderColor: '#E8878C', borderWidth: 2 },
    radioOuter: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
    radioInner: { width: 12, height: 12, borderRadius: 6 },
    iconCircle: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    explanationCard: { marginTop: Spacing.l, padding: Spacing.l, borderRadius: Radius.l, borderWidth: 1 },
    stickyBottom: { backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E6E1E2' },
    chipsContainer: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    chipsContent: { paddingHorizontal: Spacing.l, paddingVertical: Spacing.s, gap: Spacing.s },
    chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, gap: Spacing.xs },
    chipWrong: { backgroundColor: '#FFF5F6', borderColor: '#F2A7B3' },
    chipText: { color: '#4B5563', fontWeight: '600' },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.l,
        paddingVertical: Spacing.m,
        paddingBottom: Spacing.xl,
        gap: Spacing.m,
    },
    aiButton: {},
    continueButton: { flex: 1, borderRadius: Radius.full, paddingVertical: Spacing.l, alignItems: 'center', justifyContent: 'center' },
    continueButtonActive: { backgroundColor: '#C4607A', shadowColor: '#C4607A', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
    continueButtonDisabled: { backgroundColor: '#E6E1E2' },
    summaryButton: {
        backgroundColor: '#C4607A',
        paddingVertical: Spacing.m,
        paddingHorizontal: Spacing.xl,
        borderRadius: Radius.full,
    },
});
