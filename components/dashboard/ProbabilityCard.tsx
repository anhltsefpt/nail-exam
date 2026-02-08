import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Typography } from '../ui/Typography';

interface ProbabilityCardProps {
    probability: number;
    onImprove: () => void;
}

export function ProbabilityCard({ probability, onImprove }: ProbabilityCardProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    return (
        <View style={[styles.container, Shadows[colorScheme].sm]}>
            <LinearGradient
                colors={['#FDF2FE', '#FCE7FD']} // Very Light Pink background
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.row}>
                    <View style={{ flex: 1, paddingRight: Spacing.s }}>
                        <Typography variant="caption" weight="medium" color="text">
                            Passing Probability
                        </Typography>

                        <View style={styles.statsRow}>
                            <View style={[styles.circle, { backgroundColor: theme.primary }]} />
                            <Typography variant="body" weight="bold" style={{ marginLeft: 6 }}>
                                {probability.toFixed(1)}%
                            </Typography>
                        </View>

                        {/* Custom Progress Bar */}
                        <View style={styles.progressBarContainer}>
                            <View style={[styles.progressBarFill, { width: `${Math.max(5, probability)}%` }]}>
                                <LinearGradient
                                    colors={['#F880FA', '#E879F9']} // Primary Pink Gradient
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{ flex: 1, borderRadius: Radius.full }}
                                />
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity onPress={onImprove}>
                        <LinearGradient
                            colors={['#F880FA', '#C026D3']} // Primary Pink Gradient
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.improveButton}
                        >
                            <Typography variant="caption" weight="bold" color="textInverted" style={{ fontSize: 12 }}>
                                Improve
                            </Typography>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: Radius.l,
        overflow: 'hidden',
        marginBottom: Spacing.s, // Reduced margin
        backgroundColor: 'white',
    },
    gradient: {
        padding: Spacing.s, // Reduced padding to Small (8px)
        paddingHorizontal: Spacing.m,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
        marginBottom: 6,
    },
    improveButton: {
        paddingHorizontal: Spacing.m,
        paddingVertical: 4, // Ultra compact
        borderRadius: Radius.full,
    },
    circle: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    progressBarContainer: {
        height: 6, // Ultra compact
        backgroundColor: 'white',
        borderRadius: Radius.full,
        width: '100%',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: Radius.full,
    },
});
