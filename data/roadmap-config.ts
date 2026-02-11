// Roadmap configuration – types, phase metadata, and row-pattern generation

export interface RoadmapNodeConfig {
    id: number;
    label: string;
}

export interface CategoryConfig {
    id: string;
    title: string;
    /** 1-based phase index matching Colors.phase */
    phaseIndex: 1 | 2 | 3 | 4;
    nodes: RoadmapNodeConfig[];
    /** Number of nodes per row. Sum must equal nodes.length. Min 1, max 3 per row. */
    rowPattern: number[];
}

/** Phase metadata keyed by phase_id from Supabase */
export const PHASE_META: Record<number, { id: string; title: string; phaseIndex: 1 | 2 | 3 | 4 }> = {
    1: { id: 'high-yield-foundations', title: 'High-Yield Foundations', phaseIndex: 1 },
    2: { id: 'core-procedures', title: 'Core Procedures', phaseIndex: 2 },
    3: { id: 'chemistry-theory', title: 'Chemistry & Theory', phaseIndex: 3 },
};

/**
 * Generate a balanced row pattern for N nodes.
 * Pattern: first row has 1 node, subsequent rows have 2, last row gets remainder.
 * Examples: 1→[1], 2→[1,1], 3→[1,2], 4→[1,2,1], 5→[1,2,2], 7→[1,2,2,2]
 */
export function generateRowPattern(count: number): number[] {
    if (count <= 0) return [];
    if (count === 1) return [1];

    const pattern: number[] = [1]; // first row always has 1 node
    let remaining = count - 1;

    while (remaining > 0) {
        const take = Math.min(2, remaining);
        pattern.push(take);
        remaining -= take;
    }

    return pattern;
}
