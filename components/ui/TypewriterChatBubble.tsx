import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { Typography } from './Typography';

interface TypewriterChatBubbleProps {
    message: string;
    onComplete?: () => void;
    /** Characters revealed per tick */
    chunkSize?: number;
    /** Milliseconds between ticks */
    speed?: number;
    style?: ViewStyle;
}

export function TypewriterChatBubble({
    message,
    onComplete,
    chunkSize = 8,
    speed = 16,
    style,
}: TypewriterChatBubbleProps) {
    const [displayedLength, setDisplayedLength] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const completedRef = useRef(false);

    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    useEffect(() => {
        completedRef.current = false;
        setDisplayedLength(0);

        timerRef.current = setInterval(() => {
            setDisplayedLength((prev) => {
                const next = prev + chunkSize;
                if (next >= message.length) {
                    clearTimer();
                    if (!completedRef.current) {
                        completedRef.current = true;
                        // Delay callback slightly so UI settles
                        setTimeout(() => onComplete?.(), 50);
                    }
                    return message.length;
                }
                return next;
            });
        }, speed);

        return clearTimer;
    }, [message, chunkSize, speed]);

    const displayedText = message.slice(0, displayedLength);
    const showCursor = displayedLength < message.length;

    return (
        <Animated.View entering={FadeIn.duration(200)} style={[styles.container, style]}>
            <View style={styles.bubble}>
                <Typography
                    variant="body"
                    color="default"
                    style={{ lineHeight: 22 }}
                >
                    {displayedText}
                    {showCursor && <Typography variant="body" color="muted" style={{ lineHeight: 22 }}>▍</Typography>}
                </Typography>
            </View>
        </Animated.View>
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
        padding: Spacing.m,
        maxWidth: '85%',
    },
});
