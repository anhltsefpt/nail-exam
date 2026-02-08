import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { ChevronRight, Lock } from 'lucide-react-native';
import React, { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Typography } from '../ui/Typography';

interface CategoryCardProps {
    title: string;
    subtitle: string;
    progress: number;
    icon: ReactNode;
    locked?: boolean;
    onPress: () => void;
}

export function CategoryCard({
    title,
    subtitle,
    progress,
    icon,
    locked = false,
    onPress,
}: CategoryCardProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            disabled={locked}
            style={[
                styles.container,
                { backgroundColor: theme.card },
                Shadows[colorScheme].sm, // Use correct shadow
                locked && styles.containerLocked,
            ]}
        >
            {/* Icon */}
            <View
                style={[
                    styles.iconContainer,
                    { backgroundColor: locked ? theme.input : theme.primaryLight },
                ]}
            >
                {locked ? <Lock size={24} color={theme.textMuted} /> : icon}
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Typography variant="heading" style={[styles.title, locked && { color: theme.textMuted }]}>
                    {title}
                </Typography>
                <Typography variant="caption" color="muted">
                    {subtitle}
                </Typography>

                {/* Progress Bar (Only if unlocked) */}
                {!locked && (
                    <View style={[styles.progressBarContainer, { backgroundColor: theme.input }]}>
                        <View
                            style={[
                                styles.progressBarFill,
                                { width: `${progress}%`, backgroundColor: theme.primary },
                            ]}
                        />
                    </View>
                )}
            </View>

            {/* Arrow */}
            {!locked && (
                <View style={styles.arrow}>
                    <ChevronRight size={20} color={theme.textMuted} />
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.m,
        borderRadius: Radius.xl,
        marginBottom: Spacing.m,
        ...Shadows.light.sm, // Default shadow, overridden by inline style if needed
    },
    containerLocked: {
        opacity: 0.8,
        backgroundColor: '#F9F9F9', // Slightly greyed out
        shadowOpacity: 0, // No shadow for locked
        elevation: 0,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: Radius.l,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.m,
    },
    content: {
        flex: 1,
    },
    title: {
        marginBottom: 4,
        fontSize: 16,
    },
    progressBarContainer: {
        marginTop: 8,
        height: 4,
        borderRadius: 2,
        width: '100%',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 2,
    },
    arrow: {
        marginLeft: Spacing.s,
    },
});
