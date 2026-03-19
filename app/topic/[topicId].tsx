import { Typography } from '@/components/ui/Typography';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { divideIntoSets, useQuestionCount } from '@/hooks/useQuestions';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import { track } from '@/lib/analytics';
import { getUnlockedSetIndex, isTopicComplete, PASS_THRESHOLD, useUserStore } from '@/store/useUserStore';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Check, ChevronRight, Lock } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TopicDetailScreen() {
    const { presentPaywallIfNeeded } = useRevenueCat();
    // Read isPro from the Zustand cache — available instantly from AsyncStorage,
    // updated by useRevenueCat whenever it resolves.
    const isPro = useUserStore((s) => s.isPro);
    const router = useRouter();
    const { t } = useTranslation();
    const theme = Colors.light;

    const {
        topicId,
        topicName,
        topicNameEn,
        topicNameVn,
        phaseIndex: phaseIndexStr,
        nodeOrder: nodeOrderStr,
        totalNodes: totalNodesStr,
    } = useLocalSearchParams<{
        topicId: string;
        topicName: string;
        topicNameEn: string;
        topicNameVn: string;
        phaseIndex: string;
        nodeOrder: string;
        totalNodes: string;
    }>();

    const phaseIndex = parseInt(phaseIndexStr || '1', 10) as 1 | 2 | 3 | 4;
    const nodeOrder = parseInt(nodeOrderStr || '1', 10);
    const totalNodes = parseInt(totalNodesStr || '1', 10);

    // Safety-net paywall: if user is not pro and this isn't topic 1, show paywall and go back
    useEffect(() => {
        if (!isPro && nodeOrder !== 1) {
            presentPaywallIfNeeded().then((purchased) => {
                if (!purchased) {
                    router.back();
                }
            });
        }
        // Pro users can access any topic — no paywall needed
    }, [isPro, nodeOrder]);
    const phase = theme.phase[phaseIndex];
    const phaseColor = phase?.primary ?? theme.primary;
    const phaseLightColor = phase?.light ?? theme.primaryLight;

    const { count: questionCount, loading } = useQuestionCount(topicId || '');
    const sets = divideIntoSets(questionCount, 20);

    // --- Progress from store ---
    const topicSetProgress = useUserStore((s) => s.topicSetProgress);
    const topicProgress = topicSetProgress[topicId] || {};
    const unlockedSetIndex = getUnlockedSetIndex(topicSetProgress, topicId, sets.length);
    const topicComplete = isTopicComplete(topicSetProgress, topicId, sets.length);

    const handleStartSet = (setIndex: number, offset: number, count: number) => {
        const score = topicProgress[setIndex] || 0;
        track('topic_start_set', { topicId, setIndex, isRetry: score > 0 });
        router.push({
            pathname: '/quiz/[categoryId]',
            params: {
                categoryId: nodeOrder.toString(),
                topicId,
                offset: offset.toString(),
                limit: count.toString(),
                topicName: topicName || '',
                topicNameEn: topicNameEn || '',
                topicNameVn: topicNameVn || '',
                setIndex: setIndex.toString(),
            },
        });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#F2F2F2' }]} edges={['bottom']}>
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
                            {t('topic.roadmap')}
                        </Typography>
                    </TouchableOpacity>

                    {/* Step indicator */}
                    <Typography
                        variant="caption"
                        style={{ color: 'rgba(255,255,255,0.85)', marginTop: Spacing.m }}
                    >
                        {t('topic.step', { order: nodeOrder, total: totalNodes })}
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
                            {t('topic.setsInfo', {
                                sets: sets.length,
                                questions: sets.length > 0 ? t('topic.questionsEach', { count: sets[0].count }) : t('topic.zeroQ')
                            })}
                            {topicComplete ? t('topic.complete') : ''}
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
                            {t('topic.noQuestions')}
                        </Typography>
                    </View>
                ) : (
                    <>
                        {sets.map((set, index) => {
                            const score = topicProgress[index] || 0;
                            const isPassed = score >= PASS_THRESHOLD;
                            // Pro users: all sets accessible, no 75% gate
                            // Free users (topic 1 only): progressive gate
                            const isUnlocked = isPro ? true : index <= unlockedSetIndex;
                            const isActive = isPro
                                ? !isPassed && index === sets.findIndex((_, i) => (topicProgress[i] || 0) < PASS_THRESHOLD)
                                : index === unlockedSetIndex && !topicComplete;

                            return (
                                <TouchableOpacity
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
                                    activeOpacity={isUnlocked ? 0.75 : 1}
                                    onPress={() => {
                                        if (isUnlocked) {
                                            handleStartSet(index, set.offset, set.count);
                                        } else {
                                            router.push('/paywall');
                                        }
                                    }}
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
                                            {t('topic.setNumber', { number: index + 1 })}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            style={{
                                                color: isUnlocked
                                                    ? theme.textSecondary
                                                    : theme.textMuted,
                                            }}
                                        >
                                            {t('topic.questionsCount', { count: set.count })}
                                            {score > 0 ? t('topic.bestScore', { score }) : ''}
                                        </Typography>
                                    </View>

                                    {/* Chevron indicator for unlocked/passed sets */}
                                    {isUnlocked && (
                                        <ChevronRight size={20} color={theme.textMuted} />
                                    )}

                                </TouchableOpacity>
                            );
                        })}

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
