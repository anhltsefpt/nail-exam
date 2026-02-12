import { CategoryConfig, generateRowPattern, PHASE_META } from '@/data/roadmap-config';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface TopicRow {
    id: string;
    name: string | null;
    order: number | null;
    phase_id: number | null;
}

export function useTopics() {
    const [categories, setCategories] = useState<CategoryConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchTopics() {
            try {
                setLoading(true);
                const { data, error: fetchError } = await supabase
                    .from('topics')
                    .select('*')
                    .order('order', { ascending: true });

                if (fetchError) throw fetchError;
                if (cancelled) return;

                const topics = (data as TopicRow[]) || [];

                // Group by phase_id (skip null)
                const grouped = new Map<number, TopicRow[]>();
                for (const topic of topics) {
                    const pid = topic.phase_id;
                    if (pid == null) continue;
                    if (!grouped.has(pid)) grouped.set(pid, []);
                    grouped.get(pid)!.push(topic);
                }

                // Build CategoryConfig[] in phase order (1, 2, 3, 4)
                const cats: CategoryConfig[] = [];
                for (const phaseId of [1, 2, 3, 4]) {
                    const meta = PHASE_META[phaseId];
                    if (!meta) continue;
                    const phaseTopics = grouped.get(phaseId) || [];
                    if (phaseTopics.length === 0) continue;

                    cats.push({
                        id: meta.id,
                        title: meta.title,
                        phaseIndex: meta.phaseIndex,
                        nodes: phaseTopics.map((t) => ({
                            id: t.order ?? 0,
                            label: t.name ?? 'Untitled',
                            topicId: t.id,
                        })),
                        rowPattern: generateRowPattern(phaseTopics.length),
                    });
                }

                setCategories(cats);
                setError(null);
            } catch (err: any) {
                if (!cancelled) {
                    setError(err.message || 'Failed to fetch topics');
                    console.error('useTopics error:', err);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchTopics();
        return () => { cancelled = true; };
    }, []);

    return { categories, loading, error };
}
