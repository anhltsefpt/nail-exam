// Mock Question Data for Nail Exam Categories

export interface QuestionOption {
    id: string;
    text: string;
}

export interface Question {
    id: string;
    categoryId: string;
    nodeId: number; // 1-7 for Core 1 - Core 7 / Final
    text: string;
    options: QuestionOption[];
    correctOptionId: string;
}

// Mock Questions by Node
export const MOCK_QUESTIONS: Question[] = [
    // Core 1 - General Knowledge Basics
    {
        id: 'q1-1',
        categoryId: 'general-knowledge',
        nodeId: 1,
        text: 'Which of the following is NOT a single-use item?',
        options: [
            { id: 'a', text: 'Wooden Pusher' },
            { id: 'b', text: 'Cotton Ball' },
            { id: 'c', text: 'Metal Pusher' },
            { id: 'd', text: 'Paper Towel' },
        ],
        correctOptionId: 'c',
    },
    {
        id: 'q1-2',
        categoryId: 'general-knowledge',
        nodeId: 1,
        text: 'What is the minimum time required for disinfecting non-porous tools?',
        options: [
            { id: 'a', text: '5 minutes' },
            { id: 'b', text: '10 minutes' },
            { id: 'c', text: '15 minutes' },
            { id: 'd', text: '20 minutes' },
        ],
        correctOptionId: 'b',
    },
    {
        id: 'q1-3',
        categoryId: 'general-knowledge',
        nodeId: 1,
        text: 'Which agency regulates salon chemicals?',
        options: [
            { id: 'a', text: 'FDA' },
            { id: 'b', text: 'OSHA' },
            { id: 'c', text: 'EPA' },
            { id: 'd', text: 'CDC' },
        ],
        correctOptionId: 'b',
    },

    // Core 2 - Sanitation
    {
        id: 'q2-1',
        categoryId: 'general-knowledge',
        nodeId: 2,
        text: 'EPA-registered disinfectants are effective against:',
        options: [
            { id: 'a', text: 'Only bacteria' },
            { id: 'b', text: 'Bacteria and some viruses' },
            { id: 'c', text: 'Bacteria, viruses, and fungi' },
            { id: 'd', text: 'All pathogens including bacterial spores' },
        ],
        correctOptionId: 'c',
    },
    {
        id: 'q2-2',
        categoryId: 'general-knowledge',
        nodeId: 2,
        text: 'What should be done with porous items that come in contact with blood?',
        options: [
            { id: 'a', text: 'Disinfect and reuse' },
            { id: 'b', text: 'Dispose in regular trash' },
            { id: 'c', text: 'Dispose in a sealed container' },
            { id: 'd', text: 'Sterilize in an autoclave' },
        ],
        correctOptionId: 'c',
    },

    // Core 3 - Tool Handling
    {
        id: 'q3-1',
        categoryId: 'general-knowledge',
        nodeId: 3,
        text: 'Metal implements should be stored in:',
        options: [
            { id: 'a', text: 'Open trays' },
            { id: 'b', text: 'Sealed, labeled containers' },
            { id: 'c', text: 'UV sanitizers only' },
            { id: 'd', text: 'Disinfectant solution continuously' },
        ],
        correctOptionId: 'b',
    },

    // Core 4 - Client Care
    {
        id: 'q4-1',
        categoryId: 'general-knowledge',
        nodeId: 4,
        text: 'Before providing nail services, a technician should:',
        options: [
            { id: 'a', text: 'Check client ID' },
            { id: 'b', text: 'Wash hands thoroughly' },
            { id: 'c', text: 'Sign a contract' },
            { id: 'd', text: 'Collect payment' },
        ],
        correctOptionId: 'b',
    },

    // Core 5 - Safety
    {
        id: 'q5-1',
        categoryId: 'general-knowledge',
        nodeId: 5,
        text: 'OSHA requires salons to provide:',
        options: [
            { id: 'a', text: 'Free parking' },
            { id: 'b', text: 'Safety Data Sheets (SDS)' },
            { id: 'c', text: 'Medical insurance' },
            { id: 'd', text: 'Break rooms' },
        ],
        correctOptionId: 'b',
    },

    // Core 6 - Ethics
    {
        id: 'q6-1',
        categoryId: 'general-knowledge',
        nodeId: 6,
        text: 'Professional ethics in a salon include:',
        options: [
            { id: 'a', text: 'Sharing client information with coworkers' },
            { id: 'b', text: 'Maintaining client confidentiality' },
            { id: 'c', text: 'Recommending unnecessary services' },
            { id: 'd', text: 'Criticizing competitors' },
        ],
        correctOptionId: 'b',
    },

    // Core 7 / Final - Review
    {
        id: 'q7-1',
        categoryId: 'general-knowledge',
        nodeId: 7,
        text: 'The primary purpose of a state board exam is to:',
        options: [
            { id: 'a', text: 'Generate revenue for the state' },
            { id: 'b', text: 'Ensure public safety' },
            { id: 'c', text: 'Limit competition' },
            { id: 'd', text: 'Promote specific products' },
        ],
        correctOptionId: 'b',
    },
];

// Helper function to get questions by node ID
export function getQuestionsByNodeId(nodeId: number): Question[] {
    return MOCK_QUESTIONS.filter((q) => q.nodeId === nodeId);
}

// Get node label from ID
export function getNodeLabel(nodeId: number): string {
    const labels: Record<number, string> = {
        1: 'Core 1',
        2: 'Core 2',
        3: 'Core 3',
        4: 'Core 4',
        5: 'Core 5',
        6: 'Core 6',
        7: 'Final',
    };
    return labels[nodeId] || `Core ${nodeId}`;
}
