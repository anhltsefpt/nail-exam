import { AICharacter } from '@/components/AICharacter';
import { ChatBubble } from '@/components/ui/ChatBubble';
import { QuickActionChip } from '@/components/ui/QuickActionChip';
import { ThinkingIndicator } from '@/components/ui/ThinkingIndicator';
import { TypewriterChatBubble } from '@/components/ui/TypewriterChatBubble';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { fetchMessages, sendChatMessage } from '@/hooks/useChatHistory';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import { track } from '@/lib/analytics';
import { useUserStore } from '@/store/useUserStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowDown, BarChart3, BookOpen, ChevronDown, Gem, Send, X } from 'lucide-react-native';
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

type DisplayMessage = {
    id: string;
    variant: 'ai' | 'user';
    message: string;
    created_at?: string; // from DB, used for pagination cursor
};

const WELCOME_MESSAGE: DisplayMessage = {
    id: 'welcome',
    variant: 'ai',
    message:
        "Hello! I'm Mentora, your AI study assistant. I'm here to help you ace your Nail Technician exam! 💅\n\nAsk me anything about nail anatomy, sanitation, safety, or exam prep!",
};

const NEAR_BOTTOM_THRESHOLD = 150;
const NEAR_TOP_THRESHOLD = 100;

export default function AIChatScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { context, initialPrompt, autoSend } = useLocalSearchParams<{ context?: string; initialPrompt?: string; autoSend?: string }>();
    const { isPro, presentPaywall } = useRevenueCat();
    const gems = useUserStore((s) => s.gems);
    const deductGem = useUserStore((s) => s.deductGem);

    // Message state
    const [messages, setMessages] = useState<DisplayMessage[]>([WELCOME_MESSAGE]);
    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
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
                    message: `I see you're working on:\n\n📝 ${context}\n\nHow can I help you with this question?`,
                },
            ]);
        }
        if (initialPrompt) {
            setInputText(initialPrompt);
        }
    }, []);

    // Load chat history from Supabase on mount
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const { data, hasMore: more } = await fetchMessages();
                if (!mounted) return;
                if (data.length > 0) {
                    const displayMsgs: DisplayMessage[] = data.map((m) => ({
                        id: m.id,
                        variant: m.role === 'assistant' ? 'ai' : 'user',
                        message: m.content,
                        created_at: m.created_at,
                    }));
                    setMessages([WELCOME_MESSAGE, ...displayMsgs]);
                }
                setHasMore(more);
            } catch (e) {
                console.error('Failed to load chat history:', e);
            } finally {
                if (mounted) setIsLoadingHistory(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    // Auto-scroll to bottom when messages change (if near bottom)
    useEffect(() => {
        if (isNearBottomRef.current) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } else {
            setShowScrollButton(true);
        }
    }, [messages.length]);

    // Scroll to bottom on first load
    useEffect(() => {
        if (!isLoadingHistory) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: false });
            }, 300);
        }
    }, [isLoadingHistory]);

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

        // Load more when scrolled near the top
        if (contentOffset.y < NEAR_TOP_THRESHOLD && hasMore && !isLoadingMore) {
            handleLoadMore();
        }
    }, [hasMore, isLoadingMore]);

    const scrollToBottom = useCallback(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
        setShowScrollButton(false);
    }, []);

    // Load older messages
    const handleLoadMore = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;
        setIsLoadingMore(true);

        try {
            // Find the oldest DB message's created_at to use as cursor
            const dbMessages = messages.filter((m) => m.created_at);
            const cursor = dbMessages.length > 0 ? dbMessages[0].created_at : undefined;

            const { data, hasMore: more } = await fetchMessages(cursor);

            if (data.length > 0) {
                const olderMsgs: DisplayMessage[] = data.map((m) => ({
                    id: m.id,
                    variant: m.role === 'assistant' ? 'ai' : 'user',
                    message: m.content,
                    created_at: m.created_at,
                }));

                // Prepend older messages (after welcome)
                setMessages((prev) => {
                    const welcomeMsg = prev.find((m) => m.id === 'welcome');
                    const rest = prev.filter((m) => m.id !== 'welcome');
                    return [
                        ...(welcomeMsg ? [welcomeMsg] : []),
                        ...olderMsgs,
                        ...rest,
                    ];
                });
            }

            setHasMore(more);
        } catch (e) {
            console.error('Load more error:', e);
        } finally {
            setIsLoadingMore(false);
        }
    }, [isLoadingMore, hasMore, messages]);

    // --- Send message logic ---
    const sendMessage = useCallback(async (text: string) => {
        text = text.trim();
        if (!text || isSending) return;

        // Gem gate for free users
        if (!isPro) {
            const success = deductGem();
            if (!success) {
                // Show in-chat upgrade prompt instead of Alert
                setMessages((prev) => [
                    ...prev,
                    { id: Date.now().toString(), variant: 'user', message: text },
                    {
                        id: (Date.now() + 1).toString(),
                        variant: 'ai',
                        message: "💎 You've run out of gems! Complete quiz sets to earn more gems, or upgrade to Pro for unlimited AI coaching. ✨",
                    },
                ]);
                isNearBottomRef.current = true;
                return;
            }
        }

        // Add user message immediately
        const userMsg: DisplayMessage = {
            id: Date.now().toString(),
            variant: 'user',
            message: text,
        };

        // We use a functional state update and return the new messages array
        // so we can build context off the absolute latest state (including this new user msg)
        let latestMessages: DisplayMessage[] = [];
        setMessages((prev) => {
            latestMessages = [...prev, userMsg];
            return latestMessages;
        });

        setIsSending(true);
        isNearBottomRef.current = true;
        setShowScrollButton(false);

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

            const aiResponse = await sendChatMessage(text, recentHistory, context);

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
    }, [isSending, isPro, deductGem, messages]);

    const handleSend = useCallback(() => {
        if (!inputText.trim()) return;
        sendMessage(inputText);
        setInputText('');
    }, [inputText, sendMessage]);

    // Auto-send effect
    useEffect(() => {
        if (!isLoadingHistory && initialPrompt && autoSend === 'true' && !hasAutoSentRef.current) {
            hasAutoSentRef.current = true;
            // Slight delay to let UI settle and scroll to bottom naturally before sending
            setTimeout(() => {
                sendMessage(initialPrompt);
                setInputText(''); // Clear input if it was prefilled by the earlier effect
            }, 300);
        }
    }, [isLoadingHistory, initialPrompt, autoSend, sendMessage]);

    // Quick actions now prefill the input instead of sending directly
    const handleQuickAction = (action: string) => {
        track('ai_quick_action', { action });
        setInputText(action);
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

                <View style={styles.gemBadge}>
                    <Text style={styles.gemCount}>{isPro ? '∞' : gems}</Text>
                    <Gem size={12} color="#D97706" fill="#FCD34D" />
                </View>
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
                        contentContainerStyle={styles.messagesContent}
                        keyboardDismissMode="interactive"
                        keyboardShouldPersistTaps="handled"
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                    >
                        {/* Loading more indicator */}
                        {isLoadingMore && (
                            <View style={styles.loadingMore}>
                                <ActivityIndicator size="small" color={Colors.light.primary} />
                            </View>
                        )}

                        {/* AI Avatar */}
                        <View style={styles.avatarContainer}>
                            <AICharacter size={48} />
                        </View>

                        {/* Loading state */}
                        {isLoadingHistory ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color={Colors.light.primary} />
                                <Text style={styles.loadingText}>Loading conversation...</Text>
                            </View>
                        ) : (
                            <>
                                {messages.map((msg) => (
                                    msg.id === streamingMessageId ? (
                                        <TypewriterChatBubble
                                            key={msg.id}
                                            message={msg.message}
                                            onComplete={() => setStreamingMessageId(null)}
                                        />
                                    ) : (
                                        <ChatBubble key={msg.id} message={msg.message} variant={msg.variant} />
                                    )
                                ))}

                                {/* Thinking indicator with animated dots */}
                                {isSending && (
                                    <Animated.View entering={FadeIn.duration(200)} style={styles.typingContainer}>
                                        <ThinkingIndicator />
                                    </Animated.View>
                                )}
                            </>
                        )}
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
                        <QuickActionChip
                            label={t('aiChat.studyTheory')}
                            icon={<BookOpen size={16} color={Colors.light.primary} />}
                            onPress={() => handleQuickAction(t('aiChat.studyTheory'))}
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
    gemBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    gemCount: {
        fontSize: 13,
        fontWeight: '700',
        color: '#D97706',
        marginRight: 4,
    },
});
