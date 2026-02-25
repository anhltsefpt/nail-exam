import { supabase } from '@/lib/supabase';
import { getUserId } from './useDeviceId';

export interface ChatMessage {
    id: string;
    user_id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}


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
