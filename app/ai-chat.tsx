import { AICharacter } from '@/components/AICharacter';
import { ChatBubble } from '@/components/ui/ChatBubble';
import { QuickActionChip } from '@/components/ui/QuickActionChip';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { BarChart3, BookOpen, ChevronDown, Download, Send, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type Message = {
    id: string;
    variant: 'ai' | 'user';
    message: string;
};

const INITIAL_MESSAGES: Message[] = [
    {
        id: '1',
        variant: 'ai',
        message:
            "Hello! I'm Mentora, your AI study assistant. I'm here to help you ace your Nail Technician exam! 💅\n\nBased on your progress, you haven't practiced any tests or topics yet. Let's get started with the General Knowledge section, particularly the Core concepts.\n\nMastering the basics will significantly improve your understanding and confidence!",
    },
];

export default function AIChatScreen() {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [inputText, setInputText] = useState('');

    const handleSend = () => {
        if (!inputText.trim()) return;

        const userMessage = {
            id: Date.now().toString(),
            variant: 'user' as const,
            message: inputText.trim(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText('');

        // Simulate AI response
        setTimeout(() => {
            const aiResponse = {
                id: (Date.now() + 1).toString(),
                variant: 'ai' as const,
                message:
                    "Great question! Let me help you with that. For the Nail Technician exam, you'll want to focus on sanitation procedures, nail anatomy, and safety protocols. Would you like me to explain any of these topics in detail?",
            };
            setMessages((prev) => [...prev, aiResponse]);
        }, 1000);
    };

    const handleQuickAction = (action: string) => {
        const userMessage = {
            id: Date.now().toString(),
            variant: 'user' as const,
            message: action,
        };
        setMessages((prev) => [...prev, userMessage]);

        setTimeout(() => {
            const aiResponse = {
                id: (Date.now() + 1).toString(),
                variant: 'ai' as const,
                message:
                    action === 'Analyze my progress'
                        ? "Based on your current progress:\n\n📊 Overall: 0% complete\n📚 Topics studied: 0/12\n✅ Practice tests: 0/5\n\nI recommend starting with the 'General Knowledge' section. Would you like me to guide you through the first lesson?"
                        : "Let's dive into some theory! Here are the key areas you should study:\n\n1. **Sanitation & Safety** - Essential for the exam\n2. **Nail Anatomy** - Understanding structure\n3. **Product Chemistry** - How products work\n\nWhich topic interests you most?",
            };
            setMessages((prev) => [...prev, aiResponse]);
        }, 1000);
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
                        <Text style={styles.headerTitle}>Mentora</Text>
                    </View>
                    <TouchableOpacity style={styles.headerInfo}>
                        <Text style={styles.headerInfoText}>Mentora Information</Text>
                        <ChevronDown size={14} color={Colors.light.textMuted} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.headerButton}>
                    <Download size={24} color={Colors.light.text} />
                </TouchableOpacity>
            </View>

            {/* Messages */}
            <ScrollView
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                keyboardDismissMode="interactive"
            >
                {/* AI Avatar */}
                <View style={styles.avatarContainer}>
                    <AICharacter size={48} />
                </View>

                {messages.map((msg) => (
                    <ChatBubble key={msg.id} message={msg.message} variant={msg.variant} />
                ))}
            </ScrollView>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <QuickActionChip
                        label="Analyze my progress"
                        icon={<BarChart3 size={16} color={Colors.light.primary} />}
                        onPress={() => handleQuickAction('Analyze my progress')}
                    />
                    <QuickActionChip
                        label="Study Theory"
                        icon={<BookOpen size={16} color={Colors.light.primary} />}
                        onPress={() => handleQuickAction('Study Theory')}
                    />
                </ScrollView>
            </View>

            {/* Input */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your message here..."
                        placeholderTextColor={Colors.light.textMuted}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, inputText.trim() && styles.sendButtonActive]}
                        onPress={handleSend}
                        disabled={!inputText.trim()}
                    >
                        <Send size={20} color={inputText.trim() ? Colors.light.primary : Colors.light.textMuted} />
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
