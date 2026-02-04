import * as fs from "fs";
import * as path from "path";
import type { CrawlResult } from "./types.js";

const DATA_DIR = path.resolve(import.meta.dirname, "../data/raw");

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  url: string,
  retries = 3,
  delayMs = 2000
): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      log(`  Fetching: ${url} (attempt ${attempt})`);
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "vi,en-US;q=0.9,en;q=0.8",
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return await res.text();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (attempt === retries) {
        throw new Error(
          `Failed after ${retries} attempts for ${url}: ${message}`
        );
      }
      log(`  Retry ${attempt}/${retries} for ${url}: ${message}`);
      await delay(delayMs);
    }
  }
  throw new Error("Unreachable");
}

export function saveCrawlResult(result: CrawlResult): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const filePath = path.join(DATA_DIR, `${result.source}.json`);
  fs.writeFileSync(filePath, JSON.stringify(result, null, 2), "utf-8");
  log(`Saved ${result.totalQuestions} questions to ${filePath}`);
}

export function log(message: string): void {
  const timestamp = new Date().toISOString().slice(11, 19);
  console.log(`[${timestamp}] ${message}`);
}

export function cleanText(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
