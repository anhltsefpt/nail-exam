import { Colors } from '@/constants/theme';
import { Check, Crown, Lock } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

interface RoadmapNodeProps {
    node: {
        x: number;
        y: number;
        id: number;
        label: string;
        status: string;
        progress: number;
    };
    index: number;
    phaseColor: string;
    phaseLightColor: string;
    isPremiumLocked?: boolean;
    onPress: () => void;
}

const NODE_SIZE = 56;
const WRAPPER_SIZE = 100;

export function RoadmapNode({ node, index, phaseColor, phaseLightColor, isPremiumLocked = false, onPress }: RoadmapNodeProps) {
    const scale = useSharedValue(0);
    const pulse = useSharedValue(1);
    const opacity = useSharedValue(0);
    const ripple = useSharedValue(1);

    const isActive = node.status === 'active';
    const isCompleted = node.status === 'completed';
    const isLocked = node.status === 'locked';
    const isAccessible = node.status === 'accessible';
    const isFullyComplete = node.progress >= 100;

    useEffect(() => {
        const delay = 200 + index * 150;
        scale.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 100 }));
        opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));

        if (isActive) {
            pulse.value = withRepeat(
                withTiming(1.08, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
                -1,
                true
            );
            ripple.value = withRepeat(
                withTiming(1.5, { duration: 1500, easing: Easing.out(Easing.ease) }),
                -1,
                false
            );
        }
    }, [isActive]);

    const rPositionStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        left: node.x - WRAPPER_SIZE / 2,
        top: node.y - WRAPPER_SIZE / 2,
    }));

    const rScaleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: isActive ? scale.value * pulse.value : scale.value }],
    }));

    const rRippleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: ripple.value }],
        opacity: interpolate(ripple.value, [1, 1.5], [0.5, 0]),
    }));

    return (
        <Animated.View style={[styles.nodeWrapper, rPositionStyle]}>
            <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.touchableArea}>
                <Animated.View style={[styles.nodeInner, rScaleStyle]}>
                    {isActive && (
                        <Animated.View
                            style={[
                                styles.rippleRing,
                                { backgroundColor: phaseLightColor },
                                rRippleStyle,
                            ]}
                        />
                    )}
                    <View
                        style={[
                            styles.circle,
                            isActive && [styles.activeCircle, { backgroundColor: phaseColor, borderColor: phaseColor }],
                            isCompleted && [styles.completedCircle, { backgroundColor: phaseColor, borderColor: phaseColor }],
                            isAccessible && [styles.completedCircle, { backgroundColor: phaseColor, borderColor: phaseColor }],
                            (isLocked || isPremiumLocked) && styles.lockedCircle,
                        ]}
                    >
                        {(isActive || isCompleted || isAccessible) ? (
                            <Text style={styles.nodeNumber}>{node.id}</Text>
                        ) : (
                            <>
                                <Text style={styles.lockedNumber}>{node.id}</Text>
                                {/* Premium lock badge: gold crown; progress lock: grey lock */}
                                {isPremiumLocked ? (
                                    <View style={styles.crownBadge}>
                                        <Crown size={10} color="#FFF" />
                                    </View>
                                ) : (
                                    <View style={styles.lockBadge}>
                                        <Lock size={10} color="#FFF" />
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                    {/* Green check badge when topic is 100% mastered */}
                    {isFullyComplete && (
                        <View style={styles.checkBadge}>
                            <Check size={10} color="#FFF" strokeWidth={3} />
                        </View>
                    )}
                </Animated.View>
            </TouchableOpacity>
            <Text
                style={[
                    styles.label,
                    (isActive || isCompleted || isAccessible)
                        ? [styles.activeLabel, { color: phaseColor }]
                        : styles.lockedLabel,
                ]}
                numberOfLines={2}
            >
                {node.label}
            </Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    nodeWrapper: {
        position: 'absolute',
        width: WRAPPER_SIZE,
        height: WRAPPER_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    nodeInner: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    rippleRing: {
        position: 'absolute',
        width: NODE_SIZE + 20,
        height: NODE_SIZE + 20,
        borderRadius: (NODE_SIZE + 20) / 2,
        zIndex: -1,
    },
    touchableArea: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    circle: {
        width: NODE_SIZE,
        height: NODE_SIZE,
        borderRadius: NODE_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderWidth: 3,
        borderColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 6,
    },
    activeCircle: {
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    completedCircle: {
        shadowOpacity: 0.15,
    },
    lockedCircle: {
        backgroundColor: '#F5F3F0',
        borderColor: '#E8E4E0',
        shadowOpacity: 0.05,
    },
    accessibleCircle: {
        backgroundColor: 'white',
        borderWidth: 2.5,
        shadowOpacity: 0.06,
    },
    lockBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#C8C1B8',
        borderRadius: 10,
        padding: 3,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    crownBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#F59E0B',
        borderRadius: 10,
        padding: 3,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    checkBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#22C55E',
        borderRadius: 10,
        padding: 3,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    nodeNumber: {
        color: 'white',
        fontSize: 18,
        fontWeight: '800',
    },
    lockedNumber: {
        color: '#B0A8A0',
        fontSize: 16,
        fontWeight: '700',
    },
    label: {
        position: 'absolute',
        top: WRAPPER_SIZE / 2 + NODE_SIZE / 2 + 4,
        width: WRAPPER_SIZE,
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
    },
    activeLabel: {
        fontWeight: '700',
    },
    lockedLabel: {
        color: Colors.light.textMuted,
    },
});
