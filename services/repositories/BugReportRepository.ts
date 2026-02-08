export interface BugReport {
    id: string;
    category: string;
    description: string;
    timestamp: number;
    userId?: string;
}

export interface BugReportRepository {
    saveBugReport(report: BugReport): Promise<void>;
}

class InMemoryBugReportRepository implements BugReportRepository {
    private storage: Map<string, BugReport> = new Map();

    async saveBugReport(report: BugReport): Promise<void> {
        this.storage.set(report.id, report);
        console.log("Saving bug report to memory:", report);
    }
}

export const bugReportRepository = new InMemoryBugReportRepository();
