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
 * Divide total questions into balanced sets of ~setSize.
 * If the remainder would create a very small last set,
 * distribute the extra questions across the last few sets.
 *
 * Example: total=40, setSize=15 → [15, 13, 12]
 * Example: total=45, setSize=15 → [15, 15, 15]
 * Example: total=23, setSize=15 → [12, 11]
 */
export function divideIntoSets(total: number, setSize: number = 15): { offset: number; count: number }[] {
    if (total <= 0) return [];
    if (total <= setSize) return [{ offset: 0, count: total }];

    const numSets = Math.ceil(total / setSize);
    const baseSize = Math.floor(total / numSets);
    const remainder = total % numSets;

    const sets: { offset: number; count: number }[] = [];
    let offset = 0;

    for (let i = 0; i < numSets; i++) {
        // Distribute remainder across first `remainder` sets
        const size = baseSize + (i < remainder ? 1 : 0);
        sets.push({ offset, count: size });
        offset += size;
    }

    return sets;
}
