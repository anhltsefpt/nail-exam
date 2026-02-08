import React, { useEffect } from 'react';
import { Image, StyleSheet } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

interface AICharacterProps {
    size?: number;
    animated?: boolean;
}

export function AICharacter({ size = 80, animated = false }: AICharacterProps) {
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);

    useEffect(() => {
        if (animated) {
            // Floating animation
            translateY.value = withRepeat(
                withSequence(
                    withTiming(-6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
            // Subtle scale pulse
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
        } else {
            translateY.value = 0;
            scale.value = 1;
        }
    }, [animated]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }, { scale: scale.value }],
    }));

    return (
        <Animated.View
            style={[
                styles.container,
                { width: size, height: size, borderRadius: size / 2 },
                animated ? animatedStyle : null
            ]}
        >
            <Image
                source={require('../assets/images/ai-mascot.png')}
                style={{ width: size, height: size }}
                resizeMode="cover"
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF', // Ensures clean background if transparent
        borderWidth: 2,
        borderColor: '#F880FA', // Pink border as wrapper
    },
});
