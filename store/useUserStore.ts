import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Returns true once the Zustand user store has finished rehydrating from AsyncStorage.
 * Keeps the roadmap from rendering with stale initial-state values before persisted
 * progress is loaded.
 */
export function useIsStoreHydrated(): boolean {
    const [hydrated, setHydrated] = useState(() => useUserStore.persist.hasHydrated());

    useEffect(() => {
        if (useUserStore.persist.hasHydrated()) {
            setHydrated(true);
            return;
        }
        const unsub = useUserStore.persist.onFinishHydration(() => setHydrated(true));
        return unsub;
    }, []);

    return hydrated;
}

// --- Types ---
export type NodeStatus = 'locked' | 'active' | 'completed' | 'starred';

const PASS_THRESHOLD = 75; // 75% required to unlock next set/topic

export interface QuestionRecord {
    answeredAt: string;
    correct: boolean;
    selectedOption: string;
}

export interface MistakeRecord {
    questionId: string;
    topicId: string;
    topicName: string; // Legacy field (keep it for backwards compatibility with existing users)
    topicNameEn?: string;
    topicNameVn?: string;
    consecutiveCorrect: number; // 0 or 1; removed from list when reaches 2
}

export interface UserState {
    // User Profile
    name: string;
    streak: number;
    xp: number;
    lastLoginDate: string | null;

    // Study Progress
    courseProgress: number; // 0-100 (Overall)
    nodeProgress: Record<number, number>; // nodeId -> % correct
    nodeStatus: Record<number, NodeStatus>;
    completedLessons: string[]; // IDs of lessons

    // Question Bank
    questionHistory: Record<string, QuestionRecord>; // QuestionID -> Record
    savedQuestions: string[]; // IDs
    likedQuestions: string[]; // IDs
    dislikedQuestions: string[]; // IDs
    mistakes: MistakeRecord[];

    // Topic Set Progress: topicId -> { setIndex -> best score % }
    topicSetProgress: Record<string, Record<number, number>>;

    // Settings
    isDarkMode: boolean; // Simplified theme for now
    notificationsEnabled: boolean;
    soundEnabled: boolean;
    hapticsEnabled: boolean;
    fontScale: number; // 0.8 to 1.4
    language: 'en' | 'vi';
    reminderTime: string; // HH:mm format
    feedbackRating: number | null; // 1-5 or null

    // Subscription (cached from RevenueCat for instant access)
    isPro: boolean;

    // Onboarding
    hasCompletedOnboarding: boolean;
    onboardingQuizDone: boolean;

    // Actions
    setIsPro: (val: boolean) => void;
    setName: (name: string) => void;
    addXp: (amount: number) => void;
    unlockNode: (nodeId: number) => void;
    updateNodeProgress: (nodeId: number, percentage: number) => void;
    completeNode: (nodeId: number) => void;
    toggleSavedQuestion: (questionId: string) => void;
    likeQuestion: (questionId: string) => void;
    dislikeQuestion: (questionId: string) => void;
    recordAnswer: (questionId: string, correct: boolean, selectedOption: string) => void;
    addMistake: (questionId: string, topicId: string, topicName: string, topicNameEn?: string, topicNameVn?: string) => void;
    recordMistakeAnswer: (questionId: string, isCorrect: boolean) => void;
    updateSetProgress: (topicId: string, setIndex: number, percentage: number) => void;
    resetProgress: () => void;
    setFontScale: (scale: number) => void;
    setLanguage: (lang: 'en' | 'vi') => void;
    setReminderTime: (time: string) => void;
    setFeedbackRating: (rating: number) => void;
    setHasCompletedOnboarding: () => void;
    setOnboardingQuizDone: () => void;
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
    lastLoginDate: new Date().toISOString(),
    courseProgress: 0,
    nodeProgress: {},
    nodeStatus: INITIAL_NODE_STATUS,
    completedLessons: [],
    questionHistory: {},
    savedQuestions: [],
    likedQuestions: [],
    dislikedQuestions: [],
    mistakes: [] as MistakeRecord[],
    isDarkMode: false,
    notificationsEnabled: true,
    soundEnabled: true,
    hapticsEnabled: true,
    fontScale: 1.0,
    language: 'en' as const,
    reminderTime: '09:00',
    feedbackRating: null,
    topicSetProgress: {},
    isPro: false,
    hasCompletedOnboarding: false,
    onboardingQuizDone: false,
};

// --- Store ---

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            ...INITIAL_STATE,

            setIsPro: (val) => set({ isPro: val }),

            setHasCompletedOnboarding: () => set({ hasCompletedOnboarding: true }),
            setOnboardingQuizDone: () => set({ onboardingQuizDone: true }),

            setName: (name) => set({ name }),

            addXp: (amount) => set((state) => ({ xp: state.xp + amount })),

            unlockNode: (nodeId) =>
                set((state) => ({
                    nodeStatus: {
                        ...state.nodeStatus,
                        [nodeId]: 'active',
                    },
                })),

            updateNodeProgress: (nodeId, percentage) =>
                set((state) => ({
                    nodeProgress: {
                        ...state.nodeProgress,
                        [nodeId]: percentage,
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

            likeQuestion: (questionId) =>
                set((state) => {
                    // Remove from disliked if present
                    const newDisliked = state.dislikedQuestions.filter((id) => id !== questionId);
                    // Toggle like
                    const isLiked = state.likedQuestions.includes(questionId);
                    return {
                        likedQuestions: isLiked
                            ? state.likedQuestions.filter((id) => id !== questionId)
                            : [...state.likedQuestions, questionId],
                        dislikedQuestions: newDisliked,
                    };
                }),

            dislikeQuestion: (questionId) =>
                set((state) => {
                    // Remove from liked if present
                    const newLiked = state.likedQuestions.filter((id) => id !== questionId);
                    // Toggle dislike
                    const isDisliked = state.dislikedQuestions.includes(questionId);
                    return {
                        dislikedQuestions: isDisliked
                            ? state.dislikedQuestions.filter((id) => id !== questionId)
                            : [...state.dislikedQuestions, questionId],
                        likedQuestions: newLiked,
                    };
                }),

            recordAnswer: (questionId, correct, selectedOption) =>
                set((state) => ({
                    questionHistory: {
                        ...state.questionHistory,
                        [questionId]: {
                            answeredAt: new Date().toISOString(),
                            correct,
                            selectedOption,
                        },
                    },
                })),

            addMistake: (questionId, topicId, topicName, topicNameEn, topicNameVn) =>
                set((state) => {
                    // Idempotent – skip if already tracked
                    if (state.mistakes.some((m) => m.questionId === questionId)) return state;
                    return {
                        mistakes: [
                            ...state.mistakes,
                            { questionId, topicId, topicName, topicNameEn, topicNameVn, consecutiveCorrect: 0 },
                        ],
                    };
                }),

            recordMistakeAnswer: (questionId, isCorrect) =>
                set((state) => {
                    const updated = state.mistakes.map((m) => {
                        if (m.questionId !== questionId) return m;
                        return {
                            ...m,
                            consecutiveCorrect: isCorrect ? m.consecutiveCorrect + 1 : 0,
                        };
                    });
                    // Remove questions that have been answered correctly 2 times in a row
                    return { mistakes: updated.filter((m) => m.consecutiveCorrect < 2) };
                }),

            updateSetProgress: (topicId, setIndex, percentage) =>
                set((state) => {
                    const topicProgress = state.topicSetProgress[topicId] || {};
                    const currentBest = topicProgress[setIndex] || 0;
                    // Only update if the new score is better
                    if (percentage <= currentBest) return state;
                    return {
                        topicSetProgress: {
                            ...state.topicSetProgress,
                            [topicId]: {
                                ...topicProgress,
                                [setIndex]: percentage,
                            },
                        },
                    };
                }),

            resetProgress: () =>
                set((state) => ({
                    ...INITIAL_STATE,
                    // Preserve Settings
                    name: state.name,
                    language: state.language,
                    fontScale: state.fontScale,
                    isDarkMode: state.isDarkMode,
                    notificationsEnabled: state.notificationsEnabled,
                    soundEnabled: state.soundEnabled,
                    hapticsEnabled: state.hapticsEnabled,
                    // Preserve Pro status if we tracked it here (we don't, it's via RevenueCat)
                })),

            setFontScale: (scale) => set({ fontScale: scale }),
            setLanguage: (lang) => set({ language: lang }),
            setReminderTime: (time) => set({ reminderTime: time }),
            setFeedbackRating: (rating) => set({ feedbackRating: rating }),
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

// --- Helper Functions ---

/** Get the index of the first set that the user hasn't passed (75%+) yet */
export function getUnlockedSetIndex(
    topicSetProgress: Record<string, Record<number, number>>,
    topicId: string,
    totalSets: number,
): number {
    const progress = topicSetProgress[topicId] || {};
    for (let i = 0; i < totalSets; i++) {
        if ((progress[i] || 0) < PASS_THRESHOLD) return i;
    }
    // All sets passed
    return totalSets - 1;
}

/** Check if all sets in a topic have been passed (75%+) */
export function isTopicComplete(
    topicSetProgress: Record<string, Record<number, number>>,
    topicId: string,
    totalSets: number,
): boolean {
    if (totalSets === 0) return false;
    const progress = topicSetProgress[topicId] || {};
    for (let i = 0; i < totalSets; i++) {
        if ((progress[i] || 0) < PASS_THRESHOLD) return false;
    }
    return true;
}

export { PASS_THRESHOLD };
