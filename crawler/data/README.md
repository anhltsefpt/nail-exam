# Crawler Data

This directory contains raw crawled question data from Vietnamese nail exam websites.

## Format

Each file in `raw/` follows the `CrawlResult` interface:

```json
{
  "source": "source-name",
  "crawledAt": "2024-01-01T00:00:00.000Z",
  "totalQuestions": 100,
  "questions": [...],
  "errors": []
}
```

## Sources

| Source            | File                 | Est. Questions |
| ----------------- | -------------------- | -------------- |
| LamGiauKieuMy.com | `lamgiaukieumy.json` | ~900           |
| NailJobsUSA.com   | `nailjobsusa.json`   | ~2,600+        |
| NailsTest.com     | `nailstest.json`     | ~900           |
| NguoiVietUSA.net  | `nguoivietusa.json`  | ~100-200       |
| Tittac.com        | `tittac.json`        | ~900           |

## Usage

These raw files are intermediate data. They will be processed by AI to produce the final `content/seed-questions.json` used by the app.
