// Roadmap configuration – maps nodes into phase categories with configurable row patterns

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

export const CATEGORIES: CategoryConfig[] = [
    {
        id: 'high-yield-foundations',
        title: 'High-Yield Foundations',
        phaseIndex: 1,
        nodes: [
            { id: 1, label: 'Core 1' },
            { id: 2, label: 'Core 2' },
            { id: 3, label: 'Core 3' },
        ],
        rowPattern: [1, 2],
    },
    {
        id: 'core-procedures',
        title: 'Core Procedures',
        phaseIndex: 2,
        nodes: [
            { id: 4, label: 'Core 4' },
            { id: 5, label: 'Core 5' },
            { id: 6, label: 'Core 6' },
        ],
        rowPattern: [1, 2],
    },
    {
        id: 'chemistry-theory',
        title: 'Chemistry & Theory',
        phaseIndex: 3,
        nodes: [
            { id: 7, label: 'Final' },
        ],
        rowPattern: [1],
    },
];
