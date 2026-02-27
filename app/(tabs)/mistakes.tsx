import { Typography } from '@/components/ui/Typography';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { track } from '@/lib/analytics';
import { MistakeRecord, useUserStore } from '@/store/useUserStore';
import { useRouter } from 'expo-router';
import { BookOpen, CheckCircle, ChevronRight } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';



interface TopicGroup {
    topicId: string;
    topicName: string; // legacy english name fallback
    topicNameEn?: string;
    topicNameVn?: string;
    mistakes: MistakeRecord[];
    inProgressCount: number; // mistakes with consecutiveCorrect === 1
}

export default function MistakesScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const mistakes = useUserStore((s) => s.mistakes);
    const language = useUserStore((s) => s.language);

    const totalCount = mistakes.length;

    // Group by topic
    const topicGroups = useMemo<TopicGroup[]>(() => {
        const map = new Map<string, TopicGroup>();
        for (const m of mistakes) {
            if (!map.has(m.topicId)) {
                map.set(m.topicId, {
                    topicId: m.topicId,
                    topicName: m.topicName,
                    topicNameEn: m.topicNameEn,
                    topicNameVn: m.topicNameVn,
                    mistakes: [],
                    inProgressCount: 0,
                });
            }
            const group = map.get(m.topicId)!;
            group.mistakes.push(m);
            if (m.consecutiveCorrect === 1) group.inProgressCount++;
        }
        return Array.from(map.values());
    }, [mistakes]);

    const handleReviewAll = () => {
        track('mistakes_review_all', { count: totalCount });
        router.push({ pathname: '/mistake/quiz' as any, params: { mode: 'all' } });
    };

    const handleTopicPress = (group: TopicGroup) => {
        track('mistakes_review_topic', { topicId: group.topicId, count: group.mistakes.length });
        router.push({
            pathname: '/mistake/quiz' as any,
            params: {
                mode: 'topic',
                topicId: group.topicId,
                topicName: group.topicName,
                topicNameEn: group.topicNameEn,
                topicNameVn: group.topicNameVn,
            },
        });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#F2F2F2' }]} edges={['top']}>
            {/* Custom Top Nav */}
            <View style={[styles.topNav, { borderBottomColor: theme.border, backgroundColor: theme.background }]}>
                {/* Empty left spacer */}
                <View style={styles.backButton} />
                <View style={styles.navCenter}>
                    <Typography variant="heading" weight="bold" style={{ fontSize: 18 }}>
                        {t('mistakesTab.title')}
                    </Typography>
                    <Typography variant="caption" color="muted" style={{ marginTop: 1 }}>
                        {t('mistakesTab.subtitle')}
                    </Typography>
                </View>
                {/* Right spacer to balance center */}
                <View style={styles.backButton} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Progress bar – only shown when there are mistakes */}
                {totalCount > 0 && (
                    <View style={styles.progressSection}>
                        <View style={[styles.progressTrack, { backgroundColor: theme.input }]}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: '4%',
                                        backgroundColor: theme.success,
                                    },
                                ]}
                            />
                        </View>
                        <View style={styles.progressLabel}>
                            <Typography variant="body" weight="bold" style={{ fontSize: 16 }}>
                                {totalCount}
                            </Typography>
                            <Typography variant="caption" color="muted" style={{ marginLeft: 4 }}>
                                {t('mistakesTab.toClear')}
                            </Typography>
                        </View>
                    </View>
                )}

                {/* Review All button */}
                {totalCount > 0 && (
                    <TouchableOpacity style={styles.reviewAllCard} onPress={handleReviewAll} activeOpacity={0.85}>
                        <View>
                            <Typography
                                variant="body"
                                weight="bold"
                                style={{ color: 'white', fontSize: 16 }}
                            >
                                {t('mistakesTab.reviewAll', { count: totalCount })}
                            </Typography>
                            <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                                {t('mistakesTab.reviewAllDesc')}
                            </Typography>
                        </View>
                        <ChevronRight size={24} color="white" />
                    </TouchableOpacity>
                )}

                {/* Empty state */}
                {totalCount === 0 && (
                    <View style={styles.emptyContainer}>
                        <CheckCircle size={64} color={theme.success} strokeWidth={1.5} />
                        <Typography variant="heading" weight="bold" align="center" style={{ marginTop: Spacing.l, fontSize: 20 }}>
                            {t('mistakesTab.allClear')}
                        </Typography>
                        <Typography variant="body" color="muted" align="center" style={{ marginTop: Spacing.s }}>
                            {t('mistakesTab.noMistakes')}
                        </Typography>
                    </View>
                )}

                {/* By Topic */}
                {topicGroups.length > 0 && (
                    <>
                        <Typography
                            variant="caption"
                            weight="bold"
                            color="muted"
                            style={styles.sectionLabel}
                        >
                            {t('mistakesTab.byTopic')}
                        </Typography>

                        {topicGroups.map((group) => {
                            const count = group.mistakes.length;
                            const inProgress = group.inProgressCount;

                            return (
                                <TouchableOpacity
                                    key={group.topicId}
                                    style={[styles.topicCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                                    onPress={() => handleTopicPress(group)}
                                    activeOpacity={0.75}
                                >
                                    {/* Icon */}
                                    <View style={[styles.topicIcon, { backgroundColor: theme.primaryLight }]}>
                                        <BookOpen size={22} color={theme.primary} strokeWidth={2} />
                                    </View>

                                    {/* Info */}
                                    <View style={styles.topicInfo}>
                                        <Typography variant="body" weight="bold" style={{ fontSize: 15 }}>
                                            {language === 'vi' && group.topicNameVn ? group.topicNameVn : (group.topicNameEn || group.topicName)}
                                        </Typography>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                            <Typography variant="caption" color="muted">
                                                {count === 1 ? t('mistakesTab.mistakeSingle', { count }) : t('mistakesTab.mistakePlural', { count })}
                                            </Typography>
                                            {inProgress > 0 && (
                                                <Typography
                                                    variant="caption"
                                                    style={{ color: theme.success, marginLeft: 4 }}
                                                >
                                                    {t('mistakesTab.inProgress', { count: inProgress })}
                                                </Typography>
                                            )}
                                        </View>
                                    </View>

                                    {/* Count badge */}
                                    <View style={[styles.countBadge, { backgroundColor: theme.errorBg }]}>
                                        <Typography
                                            variant="body"
                                            weight="bold"
                                            style={{ color: theme.error, fontSize: 15 }}
                                        >
                                            {count}
                                        </Typography>
                                    </View>

                                    <ChevronRight size={18} color={theme.textMuted} />
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
    container: { flex: 1 },
    topNav: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.l,
        paddingVertical: Spacing.m,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 36,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    navCenter: {
        flex: 1,
        alignItems: 'center',
    },
    scrollContent: { paddingHorizontal: Spacing.l, paddingBottom: 40 },
    progressSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.l,
        gap: Spacing.m,
    },
    progressTrack: {
        flex: 1,
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressLabel: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    reviewAllCard: {
        backgroundColor: '#C4607A',
        borderRadius: Radius.xl,
        padding: Spacing.l,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.xl,
    },
    sectionLabel: {
        letterSpacing: 1,
        marginBottom: Spacing.m,
    },
    topicCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.l,
        borderRadius: Radius.l,
        borderWidth: 1,
        marginBottom: Spacing.m,
        gap: Spacing.m,
    },
    topicIcon: {
        width: 44,
        height: 44,
        borderRadius: Radius.m,
        alignItems: 'center',
        justifyContent: 'center',
    },
    topicInfo: { flex: 1 },
    countBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: Spacing.xl,
    },
});
