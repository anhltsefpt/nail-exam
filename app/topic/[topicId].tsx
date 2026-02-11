import { Typography } from '@/components/ui/Typography';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { divideIntoSets, useQuestionCount } from '@/hooks/useQuestions';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Lock } from 'lucide-react-native';
import React from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TopicDetailScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

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

    // For now, only the first set is unlocked
    // TODO: integrate with useUserStore to track completed sets
    const unlockedSetIndex = 0;

    const handleStartSet = (setIndex: number, offset: number, count: number) => {
        router.push({
            pathname: '/quiz/[categoryId]',
            params: {
                categoryId: nodeOrder.toString(),
                topicId,
                offset: offset.toString(),
                limit: count.toString(),
                topicName: topicName || '',
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
                            const isUnlocked = index <= unlockedSetIndex;
                            const isActive = index === unlockedSetIndex;

                            return (
                                <View
                                    key={index}
                                    style={[
                                        styles.setCard,
                                        {
                                            borderColor: isActive ? phaseColor : theme.border,
                                            backgroundColor: isActive
                                                ? `${phaseLightColor}33`
                                                : theme.card,
                                        },
                                        isActive && {
                                            borderWidth: 2,
                                        },
                                    ]}
                                >
                                    {/* Set number badge */}
                                    <View
                                        style={[
                                            styles.setBadge,
                                            {
                                                backgroundColor: isUnlocked
                                                    ? phaseColor
                                                    : theme.input,
                                            },
                                        ]}
                                    >
                                        {isUnlocked ? (
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
                                                Start
                                            </Typography>
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
                                    backgroundColor: theme.warningBg,
                                    borderColor: '#FDE68A',
                                },
                            ]}
                        >
                            <Typography
                                variant="caption"
                                weight="semibold"
                                style={{ color: '#92400E' }}
                            >
                                🔒 Score 75%+ on each set to unlock the next
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
    tipCard: {
        padding: Spacing.m,
        borderRadius: Radius.l,
        borderWidth: 1,
        alignItems: 'center',
        marginTop: Spacing.s,
    },
});
