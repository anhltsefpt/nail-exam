export interface RawQuestion {
  source: string;
  sourceUrl: string;
  questionText: string;
  options: string[];
  correctIndex?: number;
  correctText?: string;
  explanation?: string;
  language: "vi" | "en";
  category?: string;
  rawHtml?: string;
}

export interface CrawlResult {
  source: string;
  crawledAt: string;
  totalQuestions: number;
  questions: RawQuestion[];
  errors: string[];
}

export interface CrawlerModule {
  name: string;
  crawl: () => Promise<CrawlResult>;
}
