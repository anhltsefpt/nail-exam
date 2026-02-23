// Roadmap configuration – types, phase metadata, and row-pattern generation

export interface RoadmapNodeConfig {
    id: number;
    label: string;
    labelEn?: string;
    labelVn?: string;
    topicId?: string; // Supabase UUID for querying questions
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
export const PHASE_META: Record<number, { id: string; title: string; title_vn?: string; phaseIndex: 1 | 2 | 3 | 4 }> = {
    1: { id: 'high-yield-foundations', title: 'High-Yield Foundations', title_vn: 'Kiến Thức Nền Tảng', phaseIndex: 1 },
    2: { id: 'core-procedures', title: 'Core Procedures', title_vn: 'Quy Trình Cốt Lõi', phaseIndex: 2 },
    3: { id: 'chemistry-theory', title: 'Chemistry & Theory', title_vn: 'Hóa Học & Lý Thuyết', phaseIndex: 3 },
    4: { id: 'quick-wins', title: 'Quick Wins', title_vn: 'Điểm Dễ Lấy', phaseIndex: 4 },
};

/**
 * Generate an alternating 1-2-1-2 row pattern for N nodes.
 * Pattern: odd rows (1st, 3rd, 5th…) have 1 node, even rows (2nd, 4th…) have 2 nodes.
 * Examples: 1→[1], 2→[1,1], 3→[1,2], 4→[1,2,1], 5→[1,2,1,1], 6→[1,2,1,2], 7→[1,2,1,2,1]
 */
export function generateRowPattern(count: number): number[] {
    if (count <= 0) return [];

    const pattern: number[] = [];
    let remaining = count;
    let rowIdx = 0;

    while (remaining > 0) {
        // Odd rows (0, 2, 4…) get 1 node; even rows (1, 3, 5…) get 2 nodes
        const target = rowIdx % 2 === 0 ? 1 : 2;
        const take = Math.min(target, remaining);
        pattern.push(take);
        remaining -= take;
        rowIdx++;
    }

    return pattern;
}
