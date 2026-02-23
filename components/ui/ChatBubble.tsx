import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Markdown from 'react-native-markdown-display';
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
        borderTopLeftRadius: isAI ? Radius.s : Radius.l,
        borderTopRightRadius: isAI ? Radius.l : Radius.s,
        padding: Spacing.m,
        maxWidth: '85%',
        alignSelf: isAI ? 'flex-start' : 'flex-end',
    };

    const markdownStyles = {
        body: {
            fontSize: 16,
            color: isAI ? Colors.light.text : 'white',
            lineHeight: 24,
            marginTop: 0,
            marginBottom: 0,
        },
        paragraph: {
            marginTop: 0,
            marginBottom: 8,
        },
        bullet_list: {
            marginTop: 4,
            marginBottom: 4,
        },
        ordered_list: {
            marginTop: 4,
            marginBottom: 4,
        },
        list_item: {
            marginTop: 2,
            marginBottom: 2,
        },
        heading1: { fontSize: 22, fontWeight: '700', marginBottom: 8, color: isAI ? Colors.light.text : 'white' },
        heading2: { fontSize: 20, fontWeight: '700', marginBottom: 8, color: isAI ? Colors.light.text : 'white' },
        heading3: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: isAI ? Colors.light.text : 'white' },
        strong: { fontWeight: '700' },
        em: { fontStyle: 'italic' },
        blockquote: {
            backgroundColor: isAI ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.2)',
            borderLeftColor: isAI ? Colors.light.primary : 'white',
            borderLeftWidth: 4,
            paddingHorizontal: 8,
            paddingVertical: 4,
            marginBottom: 8,
        },
        code_inline: {
            backgroundColor: isAI ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.2)',
            color: isAI ? Colors.light.primary : 'white',
            borderRadius: 4,
            paddingHorizontal: 4,
        },
        code_block: {
            backgroundColor: isAI ? '#2d2d2d' : 'rgba(255,255,255,0.2)',
            color: 'white',
            borderRadius: Radius.m,
            padding: Spacing.s,
            marginBottom: 8,
        },
    } as any;

    return (
        <View style={[styles.container, { alignItems: isAI ? 'flex-start' : 'flex-end' }]}>
            <View style={bubbleStyle}>
                {isAI ? (
                    <Markdown style={markdownStyles}>
                        {message}
                    </Markdown>
                ) : (
                    <Typography
                        variant="body"
                        color="inverted"
                        style={{ lineHeight: 22 }}
                    >
                        {message}
                    </Typography>
                )}
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
