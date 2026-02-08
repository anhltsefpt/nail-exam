import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { Typography } from './Typography';

type ChatBubbleVariant = 'ai' | 'user';

interface ChatBubbleProps {
    message: string;
    variant?: ChatBubbleVariant;
    timestamp?: string;
}

export function ChatBubble({ message, variant = 'ai', timestamp }: ChatBubbleProps) {
    const isAI = variant === 'ai';

    const bubbleStyle: ViewStyle = {
        backgroundColor: isAI ? Colors.light.backgroundSubtle : Colors.light.primary,
        borderRadius: Radius.l,
        borderTopLeftRadius: isAI ? Radius.xs : Radius.l,
        borderTopRightRadius: isAI ? Radius.l : Radius.xs,
        padding: Spacing.m,
        maxWidth: '85%',
        alignSelf: isAI ? 'flex-start' : 'flex-end',
    };

    return (
        <View style={[styles.container, { alignItems: isAI ? 'flex-start' : 'flex-end' }]}>
            <View style={bubbleStyle}>
                <Typography
                    variant="body"
                    color={isAI ? 'default' : 'inverted'}
                    style={{ lineHeight: 22 }}
                >
                    {message}
                </Typography>
            </View>
            {timestamp && (
                <Typography variant="caption" color="muted" style={styles.timestamp}>
                    {timestamp}
                </Typography>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: Spacing.xs,
        paddingHorizontal: Spacing.m,
    },
    timestamp: {
        marginTop: Spacing.xs,
        paddingHorizontal: Spacing.xs,
    },
});
