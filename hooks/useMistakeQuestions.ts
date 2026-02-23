import { supabase } from '@/lib/supabase';
import { QuizQuestion } from '@/store/useQuizStore';
import { useEffect, useState } from 'react';

import { useUserStore } from '@/store/useUserStore';

/** Fisher-Yates shuffle */
function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function mapRow(row: any, language: string): QuizQuestion {
    const isVn = language === 'vi';
    const answer = isVn && row.answer_vn ? row.answer_vn : row.answer;
    const o1 = isVn && row.o1_vn ? row.o1_vn : row.o1;
    const o2 = isVn && row.o2_vn ? row.o2_vn : row.o2;
    const o3 = isVn && row.o3_vn ? row.o3_vn : row.o3;
    const questionText = isVn && row.question_vn ? row.question_vn : row.question;
    const explanation = isVn && row.explanation_vn ? row.explanation_vn : row.explanation;

    const allOptions = shuffle(
        [
            { id: 'correct', text: String(answer ?? '') },
            o1 ? { id: 'o1', text: String(o1) } : null,
            o2 ? { id: 'o2', text: String(o2) } : null,
            o3 ? { id: 'o3', text: String(o3) } : null,
        ].filter(Boolean) as { id: string; text: string }[],
    );
    return {
        id: String(row.id),
        text: questionText ?? '',
        options: allOptions,
        correctOptionId: 'correct',
        explanation: explanation ?? null,
    };
}

/**
 * Fetches QuizQuestion objects for a list of question IDs.
 * The returned questions preserve the original order of `ids`.
 */
export function useMistakeQuestions(ids: string[]) {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const language = useUserStore((s) => s.language);

    useEffect(() => {
        if (ids.length === 0) {
            setQuestions([]);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        supabase
            .from('questions')
            .select('*')
            .in('id', ids)
            .then(({ data, error: fetchError }) => {
                if (cancelled) return;
                if (fetchError) {
                    setError(fetchError.message);
                    setLoading(false);
                    return;
                }
                const rows = (data ?? []) as any[];
                // Preserve the caller's ordering
                const mapped = ids
                    .map((id) => {
                        const row = rows.find((r) => String(r.id) === id);
                        return row ? mapRow(row, language) : null;
                    })
                    .filter(Boolean) as QuizQuestion[];
                setQuestions(mapped);
                setLoading(false);
            });

        return () => { cancelled = true; };
    }, [ids.join(',')]);

    return { questions, loading, error };
}
