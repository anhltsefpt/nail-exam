import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

/**
 * Hook to get the total question count for a topic.
 */
export function useQuestionCount(topicId: string) {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetch() {
            try {
                setLoading(true);
                const { count: total, error: fetchError } = await supabase
                    .from('questions')
                    .select('id', { count: 'exact', head: true })
                    .eq('topic_id', topicId);

                if (fetchError) throw fetchError;
                if (cancelled) return;

                setCount(total ?? 0);
                setError(null);
            } catch (err: any) {
                if (!cancelled) {
                    setError(err.message || 'Failed to count questions');
                    console.error('useQuestionCount error:', err);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        if (topicId) fetch();
        return () => { cancelled = true; };
    }, [topicId]);

    return { count, loading, error };
}

/**
 * Fetch questions by topic with offset/limit for quiz pagination.
 */
export async function fetchQuestionsByRange(
    topicId: string,
    offset: number,
    limit: number,
) {
    const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('topic_id', topicId)
        .order('orderID', { ascending: true })
        .range(offset, offset + limit - 1);

    if (error) throw error;
    return data ?? [];
}

/**
 * Divide total questions into exact sets of setSize.
 * Any remainder is placed in the final set.
 *
 * Example: total=40, setSize=20 → [20, 20]
 * Example: total=45, setSize=20 → [20, 20, 5]
 * Example: total=23, setSize=20 → [20, 3]
 */
export function divideIntoSets(total: number, setSize: number = 20): { offset: number; count: number }[] {
    if (total <= 0) return [];

    const sets: { offset: number; count: number }[] = [];
    let offset = 0;
    let remaining = total;

    while (remaining > 0) {
        const count = Math.min(setSize, remaining);
        sets.push({ offset, count });
        offset += count;
        remaining -= count;
    }

    return sets;
}
