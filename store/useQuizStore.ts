import { fetchQuestionsByRange } from '@/hooks/useQuestions';
import { create } from 'zustand';

// --- Types ---

export interface QuizOption {
    id: string;
    text: string;
}

export interface QuizQuestion {
    id: string;
    text: string;
    options: QuizOption[];
    correctOptionId: string; // matches one of options[].id
    explanation: string | null;
}

/** Fisher-Yates shuffle (returns new array) */
function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/**
 * Map a raw Supabase row into QuizQuestion.
 *
 * DB schema:
 *   id (uuid), question (text), answer (text – correct),
 *   o1, o2, o3 (text – distractors), explanation (text)
 */
function mapToQuizQuestion(row: any): QuizQuestion {
    // Build options from answer + o1/o2/o3, assign stable IDs, then shuffle
    const allOptions: QuizOption[] = shuffle(
        [
            { id: 'correct', text: String(row.answer ?? '') },
            row.o1 ? { id: 'o1', text: String(row.o1) } : null,
            row.o2 ? { id: 'o2', text: String(row.o2) } : null,
            row.o3 ? { id: 'o3', text: String(row.o3) } : null,
        ].filter(Boolean) as QuizOption[],
    );

    return {
        id: String(row.id),
        text: row.question ?? '',
        options: allOptions,
        correctOptionId: 'correct', // always matches the answer option
        explanation: row.explanation ?? null,
    };
}

// --- Store Types ---

export interface QuizState {
    // Data
    questions: QuizQuestion[]; // All questions loaded for this set
    isLoading: boolean;
    error: string | null;

    // Round state
    activeQuestions: QuizQuestion[]; // Questions being practiced (may shrink on retries)
    currentIndex: number;
    selectedOptionId: string | null;
    showResult: boolean;
    isRoundComplete: boolean;

    // Stats
    roundCorrectCount: number;
    roundMistakes: string[]; // question IDs answered wrong in this round
    masteredIds: string[]; // unique IDs correctly answered across all rounds

    // Computed helpers (as getters would require subscriptions, expose plain fields)
    totalQuestionsCount: number; // original question count for mastery %

    // Actions
    loadQuestions: (topicId: string, offset: number, limit: number) => Promise<void>;
    selectOption: (optionId: string) => void;
    submitAnswer: () => { isCorrect: boolean; questionId: string } | null;
    nextQuestion: () => void;
    finishRound: () => void;
    startNextRound: () => void;
    resetQuiz: () => void;
}

// --- Initial State ---

const INITIAL_QUIZ_STATE = {
    questions: [],
    isLoading: false,
    error: null,
    activeQuestions: [],
    currentIndex: 0,
    selectedOptionId: null,
    showResult: false,
    isRoundComplete: false,
    roundCorrectCount: 0,
    roundMistakes: [],
    masteredIds: [],
    totalQuestionsCount: 0,
};

// --- Store ---

export const useQuizStore = create<QuizState>()((set, get) => ({
    ...INITIAL_QUIZ_STATE,

    loadQuestions: async (topicId: string, offset: number, limit: number) => {
        set({ isLoading: true, error: null });
        try {
            const rows = await fetchQuestionsByRange(topicId, offset, limit);
            const questions = rows.map(mapToQuizQuestion);
            set({
                questions,
                activeQuestions: questions,
                totalQuestionsCount: questions.length,
                isLoading: false,
            });
        } catch (err: any) {
            set({
                isLoading: false,
                error: err.message || 'Failed to load questions',
            });
            console.error('useQuizStore.loadQuestions error:', err);
        }
    },

    selectOption: (optionId: string) => {
        const { showResult, isRoundComplete } = get();
        if (showResult || isRoundComplete) return;
        set({ selectedOptionId: optionId });
    },

    submitAnswer: () => {
        const { activeQuestions, currentIndex, selectedOptionId, showResult } = get();
        if (showResult || !selectedOptionId) return null;

        const question = activeQuestions[currentIndex];
        if (!question) return null;

        const isCorrect = selectedOptionId === question.correctOptionId;

        set((state) => {
            const newMasteredIds = isCorrect
                ? [...new Set([...state.masteredIds, question.id])]
                : state.masteredIds;

            const newRoundMistakes = !isCorrect
                ? [...state.roundMistakes, question.id]
                : state.roundMistakes;

            return {
                showResult: true,
                roundCorrectCount: isCorrect ? state.roundCorrectCount + 1 : state.roundCorrectCount,
                masteredIds: newMasteredIds,
                roundMistakes: newRoundMistakes,
            };
        });

        return { isCorrect, questionId: question.id };
    },

    nextQuestion: () => {
        const { currentIndex, activeQuestions } = get();
        if (currentIndex < activeQuestions.length - 1) {
            set({
                currentIndex: currentIndex + 1,
                selectedOptionId: null,
                showResult: false,
            });
        } else {
            // End of round
            get().finishRound();
        }
    },

    finishRound: () => {
        set({ isRoundComplete: true });
    },

    startNextRound: () => {
        const { questions, roundMistakes } = get();
        const nextQuestions = questions.filter((q) => roundMistakes.includes(q.id));

        set({
            activeQuestions: nextQuestions,
            currentIndex: 0,
            roundMistakes: [],
            roundCorrectCount: 0,
            selectedOptionId: null,
            showResult: false,
            isRoundComplete: false,
        });
    },

    resetQuiz: () => {
        set(INITIAL_QUIZ_STATE);
    },
}));
