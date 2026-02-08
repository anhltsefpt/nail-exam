export interface Feedback {
    id: string;
    rating: number; // 1-5
    timestamp: number;
    userId?: string;
    comment?: string;
}

export interface FeedbackRepository {
    saveFeedback(feedback: Feedback): Promise<void>;
    getFeedback(id: string): Promise<Feedback | null>;
}

class InMemoryFeedbackRepository implements FeedbackRepository {
    private storage: Map<string, Feedback> = new Map();

    async saveFeedback(feedback: Feedback): Promise<void> {
        this.storage.set(feedback.id, feedback);
        console.log("Saving feedback to memory:", feedback);
    }

    async getFeedback(id: string): Promise<Feedback | null> {
        return this.storage.get(id) || null;
    }
}

export const feedbackRepository = new InMemoryFeedbackRepository();
