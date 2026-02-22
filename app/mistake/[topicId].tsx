import { Typography } from '@/components/ui/Typography';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useMistakeQuestions } from '@/hooks/useMistakeQuestions';
import { track } from '@/lib/analytics';
import { MistakeRecord, useUserStore } from '@/store/useUserStore';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react-native';
import React, { useMemo } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';



function ProgressDots({ value, max }: { value: number; max: number }) {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    return (
        <View style={{ flexDirection: 'row', gap: 4 }}>
            {Array.from({ length: max }).map((_, i) => (
                <View
                    key={i}
                    style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: i < value ? theme.success : theme.input,
                        borderWidth: 1,
                        borderColor: i < value ? theme.success : theme.border,
                    }}
                />
            ))}
        </View>
    );
}

export default function MistakesTopicScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const { topicId, topicName } = useLocalSearchParams<{
        topicId: string;
        topicName: string;
    }>();

    const mistakes = useUserStore((s) => s.mistakes);

    const topicMistakes: MistakeRecord[] = useMemo(
        () => mistakes.filter((m) => String(m.topicId) === String(topicId)),
        [mistakes, topicId],
    );

    const { questions, loading } = useMistakeQuestions(
        useMemo(() => topicMistakes.map((m) => m.questionId), [topicMistakes]),
    );

    const questionMap = useMemo(
        () => new Map(questions.map((q) => [q.id, q])),
        [questions],
    );

    const count = topicMistakes.length;

    const handleReviewTopic = () => {
        track('mistakes_review_topic', { topicId, count });
        router.push({
            pathname: '/mistake/quiz' as any,
            params: { mode: 'topic', topicId: topicId || '', topicName: topicName || '' },
        });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Back button */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <ArrowLeft size={16} color={theme.textMuted} />
                <Typography variant="body" color="muted" style={{ marginLeft: 4 }}>
                    Back
                </Typography>
            </TouchableOpacity>

            {/* Topic header */}
            <View style={styles.topicHeader}>
                <View style={[styles.topicIconBox, { backgroundColor: theme.primaryLight }]}>
                    <BookOpen size={24} color={theme.primary} strokeWidth={2} />
                </View>
                <View style={{ marginLeft: Spacing.m }}>
                    <Typography variant="heading" weight="bold" style={{ fontSize: 20 }}>
                        {topicName}
                    </Typography>
                    <Typography variant="caption" color="muted">
                        {count} {count === 1 ? 'mistake' : 'mistakes'}
                    </Typography>
                </View>
            </View>

            {/* Questions list */}
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
                ) : topicMistakes.length === 0 ? (
                    <Typography variant="body" color="muted" align="center" style={{ marginTop: 40 }}>
                        All clear! No mistakes for this topic.
                    </Typography>
                ) : (
                    topicMistakes.map((m) => {
                        const q = questionMap.get(m.questionId);
                        return (
                            <TouchableOpacity
                                key={m.questionId}
                                style={[styles.questionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                                activeOpacity={0.75}
                                onPress={handleReviewTopic}
                            >
                                <Typography variant="body" style={{ fontSize: 14, lineHeight: 20, marginBottom: Spacing.s }}>
                                    {q?.text ?? '...'}
                                </Typography>
                                <View style={styles.questionCardFooter}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.s }}>
                                        <ProgressDots value={m.consecutiveCorrect} max={2} />
                                        <Typography variant="caption" color="muted">
                                            {m.consecutiveCorrect}/2
                                        </Typography>
                                    </View>
                                    <ChevronRight size={18} color={theme.textMuted} />
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.l,
        paddingVertical: Spacing.m,
    },
    topicHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.l,
        paddingBottom: Spacing.m,
    },
    topicIconBox: {
        width: 52,
        height: 52,
        borderRadius: Radius.m,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reviewButton: {
        marginHorizontal: Spacing.l,
        backgroundColor: '#C4607A',
        borderRadius: Radius.full,
        paddingVertical: Spacing.l,
        alignItems: 'center',
        marginBottom: Spacing.l,
    },
    scrollContent: {
        paddingHorizontal: Spacing.l,
        paddingBottom: 40,
    },
    questionCard: {
        borderRadius: Radius.l,
        borderWidth: 1,
        padding: Spacing.m,
        marginBottom: Spacing.m,
    },
    questionCardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
});
