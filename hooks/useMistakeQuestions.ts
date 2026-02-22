import { supabase } from '@/lib/supabase';
import { QuizQuestion } from '@/store/useQuizStore';
import { useEffect, useState } from 'react';

/** Fisher-Yates shuffle */
function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function mapRow(row: any): QuizQuestion {
    const allOptions = shuffle(
        [
            { id: 'correct', text: String(row.answer ?? '') },
            row.o1 ? { id: 'o1', text: String(row.o1) } : null,
            row.o2 ? { id: 'o2', text: String(row.o2) } : null,
            row.o3 ? { id: 'o3', text: String(row.o3) } : null,
        ].filter(Boolean) as { id: string; text: string }[],
    );
    return {
        id: String(row.id),
        text: row.question ?? '',
        options: allOptions,
        correctOptionId: 'correct',
        explanation: row.explanation ?? null,
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
                        return row ? mapRow(row) : null;
                    })
                    .filter(Boolean) as QuizQuestion[];
                setQuestions(mapped);
                setLoading(false);
            });

        return () => { cancelled = true; };
    }, [ids.join(',')]);

    return { questions, loading, error };
}
