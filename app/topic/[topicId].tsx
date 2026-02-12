import { Typography } from '@/components/ui/Typography';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { divideIntoSets, useQuestionCount } from '@/hooks/useQuestions';
import { getUnlockedSetIndex, isTopicComplete, PASS_THRESHOLD, useUserStore } from '@/store/useUserStore';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Check, Lock, RotateCcw } from 'lucide-react-native';
import React from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TopicDetailScreen() {
    const router = useRouter();
    const theme = Colors.light;

    const {
        topicId,
        topicName,
        phaseIndex: phaseIndexStr,
        nodeOrder: nodeOrderStr,
        totalNodes: totalNodesStr,
    } = useLocalSearchParams<{
        topicId: string;
        topicName: string;
        phaseIndex: string;
        nodeOrder: string;
        totalNodes: string;
    }>();

    const phaseIndex = parseInt(phaseIndexStr || '1', 10) as 1 | 2 | 3 | 4;
    const nodeOrder = parseInt(nodeOrderStr || '1', 10);
    const totalNodes = parseInt(totalNodesStr || '1', 10);
    const phase = theme.phase[phaseIndex];
    const phaseColor = phase?.primary ?? theme.primary;
    const phaseLightColor = phase?.light ?? theme.primaryLight;

    const { count: questionCount, loading } = useQuestionCount(topicId || '');
    const sets = divideIntoSets(questionCount, 15);

    // --- Progress from store ---
    const topicSetProgress = useUserStore((s) => s.topicSetProgress);
    const topicProgress = topicSetProgress[topicId] || {};
    const unlockedSetIndex = getUnlockedSetIndex(topicSetProgress, topicId, sets.length);
    const topicComplete = isTopicComplete(topicSetProgress, topicId, sets.length);

    const handleStartSet = (setIndex: number, offset: number, count: number) => {
        router.push({
            pathname: '/quiz/[categoryId]',
            params: {
                categoryId: nodeOrder.toString(),
                topicId,
                offset: offset.toString(),
                limit: count.toString(),
                topicName: topicName || '',
                setIndex: setIndex.toString(),
            },
        });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header with phase color */}
            <LinearGradient
                colors={[phaseColor, phaseLightColor]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <SafeAreaView edges={['top']} style={styles.headerInner}>
                    {/* Back button */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                        activeOpacity={0.7}
                    >
                        <ArrowLeft size={20} color="white" />
                        <Typography
                            variant="body"
                            weight="semibold"
                            style={{ color: 'white', marginLeft: 4 }}
                        >
                            Roadmap
                        </Typography>
                    </TouchableOpacity>

                    {/* Step indicator */}
                    <Typography
                        variant="caption"
                        style={{ color: 'rgba(255,255,255,0.85)', marginTop: Spacing.m }}
                    >
                        Step {nodeOrder} of {totalNodes}
                    </Typography>

                    {/* Topic name */}
                    <Typography
                        variant="heading"
                        weight="bold"
                        style={{ color: 'white', fontSize: 22, marginTop: 2 }}
                    >
                        {topicName}
                    </Typography>

                    {/* Subtitle */}
                    {!loading && (
                        <Typography
                            variant="caption"
                            style={{ color: 'rgba(255,255,255,0.75)', marginTop: 4 }}
                        >
                            {sets.length} sets · {sets.length > 0 ? `${sets[0].count}Q each` : '0Q'}
                            {topicComplete ? ' · ✅ Complete' : ''}
                        </Typography>
                    )}
                </SafeAreaView>
            </LinearGradient>

            {/* Content */}
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={phaseColor} />
                    </View>
                ) : sets.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Typography variant="body" color="muted" align="center">
                            No questions available for this topic yet.
                        </Typography>
                    </View>
                ) : (
                    <>
                        {sets.map((set, index) => {
                            const score = topicProgress[index] || 0;
                            const isPassed = score >= PASS_THRESHOLD;
                            const isUnlocked = index <= unlockedSetIndex;
                            const isActive = index === unlockedSetIndex && !topicComplete;

                            return (
                                <View
                                    key={index}
                                    style={[
                                        styles.setCard,
                                        {
                                            borderColor: isPassed
                                                ? theme.success
                                                : isActive
                                                    ? phaseColor
                                                    : theme.border,
                                            backgroundColor: isPassed
                                                ? `${theme.successBg}`
                                                : isActive
                                                    ? `${phaseLightColor}33`
                                                    : theme.card,
                                        },
                                        (isActive || isPassed) && {
                                            borderWidth: 2,
                                        },
                                    ]}
                                >
                                    {/* Set number badge */}
                                    <View
                                        style={[
                                            styles.setBadge,
                                            {
                                                backgroundColor: isPassed
                                                    ? theme.success
                                                    : isUnlocked
                                                        ? phaseColor
                                                        : theme.input,
                                            },
                                        ]}
                                    >
                                        {isPassed ? (
                                            <Check size={18} color="white" strokeWidth={3} />
                                        ) : isUnlocked ? (
                                            <Typography
                                                variant="body"
                                                weight="bold"
                                                style={{ color: 'white', fontSize: 16 }}
                                            >
                                                {index + 1}
                                            </Typography>
                                        ) : (
                                            <Lock size={16} color={theme.textMuted} />
                                        )}
                                    </View>

                                    {/* Set info */}
                                    <View style={styles.setInfo}>
                                        <Typography
                                            variant="body"
                                            weight="bold"
                                            style={{
                                                color: isUnlocked ? theme.text : theme.textMuted,
                                            }}
                                        >
                                            Set {index + 1}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            style={{
                                                color: isUnlocked
                                                    ? theme.textSecondary
                                                    : theme.textMuted,
                                            }}
                                        >
                                            {set.count} questions
                                            {score > 0 ? ` · Best: ${score}%` : ''}
                                        </Typography>
                                    </View>

                                    {/* Action button */}
                                    {isActive && (
                                        <TouchableOpacity
                                            style={[
                                                styles.startButton,
                                                { backgroundColor: phaseColor },
                                            ]}
                                            onPress={() =>
                                                handleStartSet(index, set.offset, set.count)
                                            }
                                            activeOpacity={0.8}
                                        >
                                            <Typography
                                                variant="body"
                                                weight="bold"
                                                style={{ color: 'white' }}
                                            >
                                                {score > 0 ? 'Retry' : 'Start'}
                                            </Typography>
                                        </TouchableOpacity>
                                    )}

                                    {/* Retry button for passed sets */}
                                    {isPassed && (
                                        <TouchableOpacity
                                            style={[
                                                styles.retryButton,
                                                { borderColor: theme.success },
                                            ]}
                                            onPress={() =>
                                                handleStartSet(index, set.offset, set.count)
                                            }
                                            activeOpacity={0.8}
                                        >
                                            <RotateCcw size={14} color={theme.success} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            );
                        })}

                        {/* Tip card */}
                        <View
                            style={[
                                styles.tipCard,
                                {
                                    backgroundColor: topicComplete ? theme.successBg : theme.warningBg,
                                    borderColor: topicComplete ? '#86EFAC' : '#FDE68A',
                                },
                            ]}
                        >
                            <Typography
                                variant="caption"
                                weight="semibold"
                                style={{ color: topicComplete ? '#166534' : '#92400E' }}
                            >
                                {topicComplete
                                    ? '🎉 Topic complete! Next topic is unlocked.'
                                    : `🔒 Score ${PASS_THRESHOLD}%+ on each set to unlock the next`}
                            </Typography>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingBottom: Spacing.l,
    },
    headerInner: {
        paddingHorizontal: Spacing.l,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingVertical: Spacing.s,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: Spacing.l,
        paddingBottom: 40,
    },
    loadingContainer: {
        paddingTop: 60,
        alignItems: 'center',
    },
    emptyContainer: {
        paddingTop: 60,
        alignItems: 'center',
    },
    setCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.l,
        borderRadius: Radius.l,
        borderWidth: 1,
        marginBottom: Spacing.m,
    },
    setBadge: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    setInfo: {
        flex: 1,
        marginLeft: Spacing.m,
    },
    startButton: {
        paddingHorizontal: Spacing.l,
        paddingVertical: Spacing.s,
        borderRadius: Radius.full,
    },
    retryButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tipCard: {
        padding: Spacing.m,
        borderRadius: Radius.l,
        borderWidth: 1,
        alignItems: 'center',
        marginTop: Spacing.s,
    },
});
