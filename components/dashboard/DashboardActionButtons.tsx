import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Star } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Typography } from '../ui/Typography';

interface DashboardActionButtonsProps {
    onDailyChallengePress: () => void;
    onGetProPress: () => void;
}

export function DashboardActionButtons({
    onDailyChallengePress,
    onGetProPress,
}: DashboardActionButtonsProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    return (
        <View style={styles.container}>
            {/* Daily Challenge Button */}
            <TouchableOpacity
                style={[styles.buttonWrapper, Shadows[colorScheme].sm]}
                onPress={onDailyChallengePress}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={['#F2A7B3', '#D98E99']} // Soft Rose gradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonContent}
                >
                    <Typography variant="caption" weight="bold" color="inverted" style={styles.buttonText}>
                        Daily Challenge
                    </Typography>
                </LinearGradient>
            </TouchableOpacity>

            <View style={{ width: Spacing.s }} />

            {/* Get PRO Button */}
            <TouchableOpacity
                style={[styles.buttonWrapper, Shadows[colorScheme].sm]}
                onPress={onGetProPress}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={['#F0C97E', '#E8878C']} // Soft Amber to Coral
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonContent}
                >
                    <View style={styles.proContent}>
                        <View style={styles.crownContainer}>
                            <Crown size={14} color="white" fill="white" />
                        </View>
                        <Typography variant="caption" weight="bold" color="inverted" style={styles.buttonText}>
                            Get PRO
                        </Typography>
                        <View style={styles.starContainer}>
                            <Star size={14} color="#FCD34D" fill="#FCD34D" />
                        </View>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginBottom: Spacing.s, // Reduced margin
    },
    buttonWrapper: {
        flex: 1,
        height: 36, // Compact height
        borderRadius: Radius.full, // Pill shape for cleaner look at small size
        overflow: 'hidden',
    },
    buttonContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 12,
    },
    proContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: '100%',
        height: '100%',
    },
    crownContainer: {
        marginRight: 4,
        marginTop: -2,
        opacity: 0.9,
    },
    starContainer: {
        position: 'absolute',
        top: -2,
        right: 6,
        transform: [{ rotate: '15deg' }],
    },
});
