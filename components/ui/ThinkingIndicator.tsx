import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { Colors, Radius, Spacing } from '../../constants/theme';

interface ThinkingIndicatorProps {
    style?: ViewStyle;
}

const DOT_SIZE = 8;
const DOT_COLOR = Colors.light.primary;
const ANIMATION_DURATION = 400;

function AnimatedDot({ delay }: { delay: number }) {
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0.4);

    useEffect(() => {
        translateY.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(-6, { duration: ANIMATION_DURATION, easing: Easing.out(Easing.ease) }),
                    withTiming(0, { duration: ANIMATION_DURATION, easing: Easing.in(Easing.ease) })
                ),
                -1,
                false
            )
        );
        opacity.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(1, { duration: ANIMATION_DURATION, easing: Easing.out(Easing.ease) }),
                    withTiming(0.4, { duration: ANIMATION_DURATION, easing: Easing.in(Easing.ease) })
                ),
                -1,
                false
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[styles.dot, animatedStyle]} />
    );
}

export function ThinkingIndicator({ style }: ThinkingIndicatorProps) {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.bubble}>
                <View style={styles.dotsRow}>
                    <AnimatedDot delay={0} />
                    <AnimatedDot delay={150} />
                    <AnimatedDot delay={300} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: Spacing.xs,
        paddingHorizontal: Spacing.m,
        alignItems: 'flex-start',
    },
    bubble: {
        backgroundColor: Colors.light.backgroundSubtle,
        borderRadius: Radius.l,
        borderTopLeftRadius: Radius.s,
        paddingHorizontal: Spacing.l,
        paddingVertical: Spacing.m,
    },
    dotsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        height: 22,
        justifyContent: 'center',
    },
    dot: {
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: DOT_SIZE / 2,
        backgroundColor: DOT_COLOR,
    },
});
