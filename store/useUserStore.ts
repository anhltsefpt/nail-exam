import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// --- Types ---

export type NodeStatus = 'locked' | 'active' | 'completed' | 'starred';

export interface QuestionRecord {
    answeredAt: string;
    correct: boolean;
    selectedOption: string;
}

export interface UserState {
    // User Profile
    name: string;
    streak: number;
    xp: number;
    gems: number;
    lastLoginDate: string | null;

    // Study Progress
    courseProgress: number; // 0-100
    nodeStatus: Record<number, NodeStatus>;
    completedLessons: string[]; // IDs of lessons

    // Question Bank
    questionHistory: Record<string, QuestionRecord>; // QuestionID -> Record
    savedQuestions: string[]; // IDs
    mistakes: string[]; // IDs

    // Settings
    isDarkMode: boolean; // Simplified theme for now
    notificationsEnabled: boolean;
    soundEnabled: boolean;
    hapticsEnabled: boolean;

    // Actions
    setName: (name: string) => void;
    addXp: (amount: number) => void;
    unlockNode: (nodeId: number) => void;
    completeNode: (nodeId: number) => void;
    toggleSavedQuestion: (questionId: string) => void;
    recordAnswer: (questionId: string, correct: boolean, selectedOption: string) => void;
    resetProgress: () => void;
}

// --- Initial State ---

const INITIAL_NODE_STATUS: Record<number, NodeStatus> = {
    1: 'active', // Core 1 starts active
    2: 'locked',
    3: 'locked',
    4: 'locked',
    5: 'locked',
    6: 'locked',
    7: 'locked',
};

const INITIAL_STATE = {
    name: 'Student',
    streak: 1,
    xp: 0,
    gems: 0,
    lastLoginDate: new Date().toISOString(),
    courseProgress: 0,
    nodeStatus: INITIAL_NODE_STATUS,
    completedLessons: [],
    questionHistory: {},
    savedQuestions: [],
    mistakes: [],
    isDarkMode: false,
    notificationsEnabled: true,
    soundEnabled: true,
    hapticsEnabled: true,
};

// --- Store ---

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            ...INITIAL_STATE,

            setName: (name) => set({ name }),

            addXp: (amount) => set((state) => ({ xp: state.xp + amount })),

            unlockNode: (nodeId) =>
                set((state) => ({
                    nodeStatus: {
                        ...state.nodeStatus,
                        [nodeId]: 'active',
                    },
                })),

            completeNode: (nodeId) =>
                set((state) => {
                    const newStatus = { ...state.nodeStatus, [nodeId]: 'completed' as NodeStatus };

                    // Auto-unlock next node (logic specific to our linear 1..7 IDs)
                    // In a real app, this might start a graph traversal or lookup a parent-child map
                    const nextId = nodeId + 1;
                    if (newStatus[nextId] === 'locked') {
                        newStatus[nextId] = 'active';
                    }

                    // Recalculate progress (very simple linear calculation)
                    const totalNodes = Object.keys(INITIAL_NODE_STATUS).length;
                    const completedCount = Object.values(newStatus).filter((s) => s === 'completed').length;
                    const newProgress = Math.round((completedCount / totalNodes) * 100);

                    return {
                        nodeStatus: newStatus,
                        courseProgress: newProgress,
                    };
                }),

            toggleSavedQuestion: (questionId) =>
                set((state) => {
                    const isSaved = state.savedQuestions.includes(questionId);
                    return {
                        savedQuestions: isSaved
                            ? state.savedQuestions.filter((id) => id !== questionId)
                            : [...state.savedQuestions, questionId],
                    };
                }),

            recordAnswer: (questionId, correct, selectedOption) =>
                set((state) => {
                    const newHistory = {
                        ...state.questionHistory,
                        [questionId]: {
                            answeredAt: new Date().toISOString(),
                            correct,
                            selectedOption,
                        },
                    };

                    let newMistakes = state.mistakes;
                    if (!correct && !state.mistakes.includes(questionId)) {
                        newMistakes = [...state.mistakes, questionId];
                    } else if (correct && state.mistakes.includes(questionId)) {
                        // Optional: Remove from mistakes if answered correctly later? 
                        // For now, let's keep it in "mistakes" until explicitly cleared or allow re-answering to clear.
                        // Let's remove it to show "improvement".
                        newMistakes = state.mistakes.filter((id) => id !== questionId);
                    }

                    return {
                        questionHistory: newHistory,
                        mistakes: newMistakes,
                    };
                }),

            resetProgress: () => set(INITIAL_STATE),
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
