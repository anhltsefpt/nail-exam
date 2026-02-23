import { supabase } from '@/lib/supabase';
import { getUserId } from './useDeviceId';

export interface ChatMessage {
    id: string;
    user_id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

const PAGE_SIZE = 20;

/** Load a page of messages for the current user (cursor-based, oldest first) */
export async function fetchMessages(
    cursor?: string,
): Promise<{ data: ChatMessage[]; hasMore: boolean }> {
    const userId = await getUserId();

    let query = supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

    if (cursor) {
        query = query.lt('created_at', cursor);
    }

    const { data, error } = await query;

    if (error) {
        console.error('fetchMessages error:', error);
        return { data: [], hasMore: false };
    }

    // Sort oldest-first; when timestamps match, user messages come before assistant
    const sorted = (data as ChatMessage[]).reverse().sort((a, b) => {
        const timeDiff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (timeDiff !== 0) return timeDiff;
        // Same timestamp: 'user' before 'assistant'
        if (a.role === 'user' && b.role === 'assistant') return -1;
        if (a.role === 'assistant' && b.role === 'user') return 1;
        return 0;
    });

    return {
        data: sorted,
        hasMore: data.length === PAGE_SIZE,
    };
}

/** Send a message to the AI edge function and return the AI response */
export async function sendChatMessage(
    message: string,
    history: { role: string; content: string }[],
    context?: string,
    language?: string,
): Promise<string> {
    const userId = await getUserId();

    const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
            user_id: userId,
            message,
            history,
            context,
            language,
        },
    });

    if (error) {
        console.error('sendChatMessage error:', error);
        throw new Error('Failed to get AI response');
    }

    return data.message;
}
