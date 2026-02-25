import { AICharacter } from '@/components/AICharacter';
import { ChatBubble } from '@/components/ui/ChatBubble';
import { QuickActionChip } from '@/components/ui/QuickActionChip';
import { ThinkingIndicator } from '@/components/ui/ThinkingIndicator';
import { TypewriterChatBubble } from '@/components/ui/TypewriterChatBubble';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { sendChatMessage } from '@/hooks/useChatHistory';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import { track } from '@/lib/analytics';
import { useChatStore } from '@/store/useChatStore';
import { useUserStore } from '@/store/useUserStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowDown, BarChart3, ChevronDown, Send, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const NEAR_BOTTOM_THRESHOLD = 150;
const NEAR_TOP_THRESHOLD = 100;

export default function AIChatScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { context, initialPrompt, autoSend } = useLocalSearchParams<{ context?: string; initialPrompt?: string; autoSend?: string }>();
    const { isPro } = useRevenueCat();
    const language = useUserStore((s) => s.language);
    const name = useUserStore((s) => s.name);
    const streak = useUserStore((s) => s.streak);
    const courseProgress = useUserStore((s) => s.courseProgress);
    const questionHistory = useUserStore((s) => s.questionHistory);
    const lastLoginDate = useUserStore((s) => s.lastLoginDate);

    // Message state
    const messages = useChatStore((s) => s.messages);
    const setMessages = useChatStore((s) => s.setMessages);

    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

    const hasAutoSentRef = useRef(false);

    // Scroll state
    const scrollViewRef = useRef<ScrollView>(null);
    const isNearBottomRef = useRef(true);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const contentHeightRef = useRef(0);
    const scrollOffsetRef = useRef(0);

    // Prefill from context / initialPrompt
    useEffect(() => {
        if (context) {
            setMessages((prev) => [
                ...prev,
                {
                    id: 'context',
                    variant: 'ai',
                    message: t('aiChat.contextMessage', { context }),
                },
            ]);
        }
        if (initialPrompt) {
            setInputText(initialPrompt);
        }
    }, [context, initialPrompt, t]);

    // Scroll to bottom on first load
    useEffect(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: false });
        }, 300);
    }, []);

    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
        const nearBottom = distanceFromBottom < NEAR_BOTTOM_THRESHOLD;

        isNearBottomRef.current = nearBottom;
        contentHeightRef.current = contentSize.height;
        scrollOffsetRef.current = contentOffset.y;

        if (nearBottom) {
            setShowScrollButton(false);
        }
    }, []);

    const scrollToBottom = useCallback(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
        setShowScrollButton(false);
    }, []);

    // --- Send message logic ---
    const sendMessage = useCallback(async (text: string, overrideContext?: string) => {
        text = text.trim();
        if (!text || isSending) return;


        // Add user message immediately
        const userMsg = {
            id: Date.now().toString(),
            variant: 'user' as const,
            message: text,
        };

        // We use a functional state update and return the new messages array
        // so we can build context off the absolute latest state (including this new user msg)
        let latestMessages = messages;
        setMessages((prev) => {
            latestMessages = [...prev, userMsg];
            return latestMessages;
        });

        setIsSending(true);
        isNearBottomRef.current = true;
        setShowScrollButton(false);

        // Always scroll to bottom when user sends a new message
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);

        track('ai_send_message', { messageLength: text.length });

        try {
            // Build history from recent messages for context
            const recentHistory = latestMessages
                .filter((m) => m.id !== 'welcome' && m.id !== 'context')
                .slice(-10)
                .map((m) => ({
                    role: m.variant === 'ai' ? 'assistant' : 'user',
                    content: m.message,
                }));

            const aiResponse = await sendChatMessage(text, recentHistory, overrideContext || context, language);

            const aiMsgId = (Date.now() + 1).toString();
            setStreamingMessageId(aiMsgId);
            setMessages((prev) => [
                ...prev,
                {
                    id: aiMsgId,
                    variant: 'ai',
                    message: aiResponse,
                },
            ]);
        } catch (error) {
            console.error('Send error:', error);
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    variant: 'ai',
                    message: "Sorry, I couldn't respond right now. Please try again in a moment. 🔄",
                },
            ]);
        } finally {
            setIsSending(false);
        }
    }, [isSending, isPro, messages, language]);

    const handleSend = useCallback(() => {
        if (!inputText.trim()) return;
        sendMessage(inputText);
        setInputText('');
    }, [inputText, sendMessage]);

    // Auto-send effect
    useEffect(() => {
        if (initialPrompt && autoSend === 'true' && !hasAutoSentRef.current) {
            hasAutoSentRef.current = true;
            // Slight delay to let UI settle and scroll to bottom naturally before sending
            setTimeout(() => {
                sendMessage(initialPrompt, context);
                setInputText(''); // Clear input if it was prefilled by the earlier effect
            }, 300);
        }
    }, [initialPrompt, autoSend, context, sendMessage]);

    // Quick actions send the message immediately
    const handleQuickAction = (action: string) => {
        track('ai_quick_action', { action });

        let overrideContext: string | undefined;

        if (action === t('aiChat.analyzeProgress')) {
            const answeredQuestions = Object.values(questionHistory);
            const totalAnswered = answeredQuestions.length;
            const correctCount = answeredQuestions.filter(q => q.correct).length;
            const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
            const daysSinceStart = lastLoginDate
                ? Math.max(1, Math.ceil((Date.now() - new Date(lastLoginDate).getTime()) / (1000 * 60 * 60 * 24)))
                : 1;
            overrideContext = `User wants you to analyze their progress. Here are their raw stats. Please provide an encouraging analysis:
- Name: ${name}
- Study Streak: ${streak} days
- Overall Course Progress: ${courseProgress}%
- Total Questions Answered: ${totalAnswered}
- Correct Answers: ${correctCount} / ${totalAnswered} (${accuracy}% accuracy)
- Days Since First Study: ${daysSinceStart}`;
        } else if (context) {
            // If there is already a specific question context from the quiz screen, keep it! 
            // Just let the message (hint/explain) speak for itself alongside the existing context.
            overrideContext = context;
        } else if (action === t('aiChat.studyTheory')) {
            // Only use generic theory context if no specific question context exists
            overrideContext = `User wants to study theory. Ask them which topic they want to focus on, or suggest a nail technician state board topic.`;
        }

        sendMessage(action, overrideContext);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <X size={24} color={Colors.light.text} />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <View style={styles.headerTitleRow}>
                        <AICharacter size={28} />
                        <Text style={styles.headerTitle}>{t('aiChat.title')}</Text>
                    </View>
                    <TouchableOpacity style={styles.headerInfo}>
                        <Text style={styles.headerInfoText}>{t('aiChat.info')}</Text>
                        <ChevronDown size={14} color={Colors.light.textMuted} />
                    </TouchableOpacity>
                </View>

                <View />
            </View>

            {/* Content - KAV wraps everything below header */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={insets.top + 10}
            >
                {/* Messages */}
                <View style={{ flex: 1 }}>
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.messagesContainer}
                        contentContainerStyle={[
                            styles.messagesContent,
                            { paddingBottom: isSending ? 400 : Spacing.xxl }
                        ]}
                        keyboardDismissMode="interactive"
                        keyboardShouldPersistTaps="handled"
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        onContentSizeChange={() => {
                            if (isNearBottomRef.current && !isSending) {
                                scrollViewRef.current?.scrollToEnd({ animated: true });
                            }
                        }}
                    >
                        {/* AI Avatar */}
                        <View style={styles.avatarContainer}>
                            <AICharacter size={48} />
                        </View>

                        <>
                            {messages.map((msg, index) => (
                                msg.id === streamingMessageId ? (
                                    <TypewriterChatBubble
                                        key={index}
                                        message={msg.message}
                                        onComplete={() => setStreamingMessageId(null)}
                                    />
                                ) : (
                                    <ChatBubble key={index} message={msg.message} variant={msg.variant} />
                                )
                            ))}

                            {/* Thinking indicator with animated dots */}
                            {isSending && (
                                <Animated.View entering={FadeIn.duration(200)} style={styles.typingContainer}>
                                    <ThinkingIndicator />
                                </Animated.View>
                            )}
                        </>
                    </ScrollView>

                    {/* Scroll to bottom button */}
                    {showScrollButton && (
                        <Animated.View
                            entering={FadeIn.duration(200)}
                            exiting={FadeOut.duration(200)}
                            style={styles.scrollButtonWrapper}
                        >
                            <TouchableOpacity
                                style={styles.scrollButton}
                                onPress={scrollToBottom}
                                activeOpacity={0.8}
                            >
                                <ArrowDown size={18} color={Colors.light.text} />
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always">
                        <QuickActionChip
                            label={t('aiChat.analyzeProgress')}
                            icon={<BarChart3 size={16} color={Colors.light.primary} />}
                            onPress={() => handleQuickAction(t('aiChat.analyzeProgress'))}
                        />
                    </ScrollView>
                </View>

                {/* Input */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder={t('aiChat.inputPlaceholder')}
                        placeholderTextColor={Colors.light.textMuted}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={500}
                        editable={!isSending}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, inputText.trim() && !isSending && styles.sendButtonActive]}
                        onPress={handleSend}
                        disabled={!inputText.trim() || isSending}
                    >
                        {isSending ? (
                            <ActivityIndicator size={20} color={Colors.light.textMuted} />
                        ) : (
                            <Send size={20} color={inputText.trim() ? Colors.light.primary : Colors.light.textMuted} />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.m,
        paddingVertical: Spacing.s,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    headerButton: {
        padding: Spacing.xs,
    },
    headerCenter: {
        alignItems: 'center',
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.primary,
    },
    headerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    headerInfoText: {
        fontSize: 12,
        color: Colors.light.textMuted,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        paddingVertical: Spacing.m,
    },
    avatarContainer: {
        alignItems: 'flex-start',
        paddingHorizontal: Spacing.m,
        marginBottom: Spacing.s,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        gap: Spacing.s,
    },
    loadingText: {
        fontSize: 14,
        color: Colors.light.textMuted,
    },
    loadingMore: {
        alignItems: 'center',
        paddingVertical: Spacing.s,
    },
    typingContainer: {
        opacity: 0.7,
    },
    scrollButtonWrapper: {
        position: 'absolute',
        bottom: Spacing.m,
        alignSelf: 'center',
    },
    scrollButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.light.card,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    quickActions: {
        paddingHorizontal: Spacing.m,
        paddingVertical: Spacing.s,
        borderTopWidth: 1,
        borderTopColor: Colors.light.border,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: Spacing.m,
        paddingVertical: Spacing.s,
        paddingBottom: Spacing.m,
        backgroundColor: Colors.light.background,
        gap: Spacing.s,
    },
    input: {
        flex: 1,
        backgroundColor: Colors.light.input,
        borderRadius: Radius.l,
        paddingHorizontal: Spacing.m,
        paddingVertical: Spacing.s,
        fontSize: 16,
        color: Colors.light.text,
        maxHeight: 100,
    },
    sendButton: {
        padding: Spacing.s,
        borderRadius: Radius.full,
    },
    sendButtonActive: {
        backgroundColor: Colors.light.primaryLight,
    },

});
