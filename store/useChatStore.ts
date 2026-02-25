import { create } from 'zustand';

export type DisplayMessage = {
    id: string;
    variant: 'ai' | 'user';
    message: string;
    created_at?: string;
};

const WELCOME_MESSAGE: DisplayMessage = {
    id: 'welcome',
    variant: 'ai',
    message:
        "Hello! I'm Mentora, your AI study assistant. I'm here to help you ace your Nail Technician exam! 💅\n\nAsk me anything about nail anatomy, sanitation, safety, or exam prep!",
};

interface ChatState {
    messages: DisplayMessage[];
    addMessage: (msg: DisplayMessage) => void;
    setMessages: (msgs: DisplayMessage[] | ((prev: DisplayMessage[]) => DisplayMessage[])) => void;
    clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
    messages: [WELCOME_MESSAGE],
    addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
    setMessages: (msgs) => set((state) => ({
        messages: typeof msgs === 'function' ? msgs(state.messages) : msgs
    })),
    clearChat: () => set({ messages: [WELCOME_MESSAGE] }),
}));
