#!/usr/bin/env python3
"""
Build the complete nailstest.json by:
1. Fetching pages 1-4 from nailstest.com/nailstestmcq_eng/CheckAnswer (q1-400)
2. Loading already-extracted q401-861 from questions_401_861.json
3. Combining all 861 questions into the CrawlResult format
"""

import json
import math
import re
import sys
import time
from datetime import datetime, timezone

import requests
from bs4 import BeautifulSoup

# --- Configuration ---
BASE_URL = "https://nailstest.com/nailstestmcq_eng/CheckAnswer"
QUESTIONS_PER_PAGE = 100
PAGES_TO_FETCH = 4  # Pages 1-4 for q1-400
DELAY_BETWEEN_PAGES = 2  # seconds
EXISTING_JSON = "/private/tmp/claude-501/-Users-david-Desktop-Do-my-own-nail-exam-ai/b06525b7-4264-4e77-979b-fec57d94d384/scratchpad/questions_401_861.json"
OUTPUT_FILE = "/Users/david/Desktop/Do-my-own/nail-exam-ai/crawler/data/raw/nailstest.json"


def fetch_page(page_num: int) -> str:
    """Fetch a CheckAnswer page and return the HTML."""
    url = f"{BASE_URL}?page={page_num}" if page_num > 1 else BASE_URL
    print(f"  Fetching page {page_num}: {url}", file=sys.stderr)
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    return resp.text


def parse_questions_from_html(html: str, page_num: int) -> list[dict]:
    """Parse questions from a CheckAnswer HTML page.

    HTML structure:
    <li class="item">
      <p class="question">
        <span class="questionNo">1.</span>...question text...
      </p>
      <p class="option col-sm-offset-1">
        <input class="incorrect|correct" ...>
        <span class="optionLetter">A. </span> option text
        <span class="feedback hidden">sai|đúng</span>
      </p>
      ... more options ...
    </li>
    """
    soup = BeautifulSoup(html, "html.parser")
    questions = []

    for item in soup.select("li.item"):
        # Extract question text
        q_elem = item.select_one("p.question")
        if not q_elem:
            continue

        # Get question number from the page
        q_no_elem = q_elem.select_one("span.questionNo")
        if q_no_elem:
            local_num = int(q_no_elem.get_text(strip=True).rstrip("."))
        else:
            continue

        # Global question number
        global_num = (page_num - 1) * QUESTIONS_PER_PAGE + local_num

        # Extract question text (excluding the questionNo span and comments)
        # Remove the questionNo span text, then get remaining text
        q_no_text = q_no_elem.get_text()
        full_text = q_elem.get_text(strip=True)
        question_text = full_text[len(q_no_text.strip()):].strip()

        # Extract options
        options = []
        correct_index = None
        correct_text = None

        for i, opt_elem in enumerate(item.select("p.option")):
            # Check if this option is correct
            input_elem = opt_elem.select_one("input[type='checkbox']")
            is_correct = False
            if input_elem:
                css_class = input_elem.get("class", [])
                if isinstance(css_class, list):
                    is_correct = "correct" in css_class
                else:
                    is_correct = "correct" in css_class

            # Get option text
            option_letter_elem = opt_elem.select_one("span.optionLetter")
            feedback_elem = opt_elem.select_one("span.feedback")

            # Build option text: letter + content (exclude feedback)
            # Get all text, then remove feedback text
            opt_text_parts = []
            for child in opt_elem.children:
                if hasattr(child, 'get_text'):
                    if 'feedback' in child.get('class', []):
                        continue
                    if child.name == 'input':
                        continue
                    opt_text_parts.append(child.get_text())
                elif isinstance(child, str):
                    opt_text_parts.append(child)

            opt_text = ''.join(opt_text_parts).strip()
            # Clean up excessive whitespace
            opt_text = re.sub(r'\s+', ' ', opt_text).strip()

            options.append(opt_text)

            if is_correct:
                correct_index = i
                correct_text = opt_text

        if question_text and options:
            questions.append({
                "questionNumber": global_num,
                "questionText": question_text,
                "options": options,
                "correctIndex": correct_index,
                "correctText": correct_text,
            })

    return questions


def to_raw_question(q: dict) -> dict:
    """Convert a question dict to the RawQuestion format."""
    page_num = math.ceil(q["questionNumber"] / QUESTIONS_PER_PAGE)
    return {
        "source": "nailstest.com",
        "sourceUrl": f"https://nailstest.com/nailstestmcq_eng/CheckAnswer?page={page_num}",
        "questionText": q["questionText"],
        "options": q["options"],
        "correctIndex": q["correctIndex"],
        "correctText": q["correctText"],
        "language": "vi",
        "category": "nail-exam",
    }


def main():
    print("=" * 60, file=sys.stderr)
    print("Building nailstest.json", file=sys.stderr)
    print("=" * 60, file=sys.stderr)

    # Step 1: Fetch and parse pages 1-4 (q1-400)
    all_questions = []
    print(f"\nStep 1: Fetching pages 1-{PAGES_TO_FETCH} from nailstest.com...", file=sys.stderr)
    for page in range(1, PAGES_TO_FETCH + 1):
        html = fetch_page(page)
        questions = parse_questions_from_html(html, page)
        print(f"    Page {page}: parsed {len(questions)} questions "
              f"(#{questions[0]['questionNumber']}-#{questions[-1]['questionNumber']})",
              file=sys.stderr)
        all_questions.extend(questions)
        if page < PAGES_TO_FETCH:
            time.sleep(DELAY_BETWEEN_PAGES)

    print(f"  Total from pages 1-{PAGES_TO_FETCH}: {len(all_questions)} questions", file=sys.stderr)

    # Step 2: Load existing q401-861
    print(f"\nStep 2: Loading existing questions 401-861...", file=sys.stderr)
    with open(EXISTING_JSON, "r", encoding="utf-8") as f:
        existing_questions = json.load(f)
    print(f"  Loaded {len(existing_questions)} questions "
          f"(#{existing_questions[0]['questionNumber']}-#{existing_questions[-1]['questionNumber']})",
          file=sys.stderr)

    # Step 3: Also fetch pages 5-9 to cross-check / fill any gaps
    print(f"\nStep 3: Fetching pages 5-9 from nailstest.com (to cross-validate)...", file=sys.stderr)
    pages_5_9_questions = []
    for page in range(5, 10):
        time.sleep(DELAY_BETWEEN_PAGES)
        html = fetch_page(page)
        questions = parse_questions_from_html(html, page)
        print(f"    Page {page}: parsed {len(questions)} questions "
              f"(#{questions[0]['questionNumber']}-#{questions[-1]['questionNumber']})",
              file=sys.stderr)
        pages_5_9_questions.extend(questions)

    print(f"  Total from pages 5-9: {len(pages_5_9_questions)} questions", file=sys.stderr)

    # Step 4: Validate existing JSON against freshly parsed pages 5-9
    print(f"\nStep 4: Cross-validating existing JSON vs fresh parse...", file=sys.stderr)
    existing_by_num = {q["questionNumber"]: q for q in existing_questions}
    fresh_by_num = {q["questionNumber"]: q for q in pages_5_9_questions}

    mismatches = 0
    for num in sorted(set(existing_by_num.keys()) & set(fresh_by_num.keys())):
        e = existing_by_num[num]
        f_ = fresh_by_num[num]
        if e["correctIndex"] != f_["correctIndex"]:
            print(f"  WARNING: Q#{num} correctIndex mismatch: "
                  f"existing={e['correctIndex']} vs fresh={f_['correctIndex']}", file=sys.stderr)
            mismatches += 1

    if mismatches == 0:
        print(f"  All overlapping questions match!", file=sys.stderr)
    else:
        print(f"  {mismatches} mismatches found!", file=sys.stderr)

    # Step 5: Combine all questions - prefer fresh data for everything
    print(f"\nStep 5: Combining all questions...", file=sys.stderr)
    combined = all_questions + pages_5_9_questions  # q1-400 + q401-861 (all fresh)

    # Sort by question number
    combined.sort(key=lambda q: q["questionNumber"])

    # Verify continuity
    expected_nums = set(range(1, combined[-1]["questionNumber"] + 1))
    actual_nums = set(q["questionNumber"] for q in combined)
    missing = expected_nums - actual_nums
    if missing:
        print(f"  WARNING: Missing question numbers: {sorted(missing)}", file=sys.stderr)
    else:
        print(f"  No gaps! Questions #{combined[0]['questionNumber']}-#{combined[-1]['questionNumber']}", file=sys.stderr)

    # Check for duplicates
    from collections import Counter
    num_counts = Counter(q["questionNumber"] for q in combined)
    dupes = {num: cnt for num, cnt in num_counts.items() if cnt > 1}
    if dupes:
        print(f"  WARNING: Duplicate question numbers: {dupes}", file=sys.stderr)
        # Deduplicate - keep first occurrence
        seen = set()
        deduped = []
        for q in combined:
            if q["questionNumber"] not in seen:
                seen.add(q["questionNumber"])
                deduped.append(q)
        combined = deduped

    total = len(combined)
    print(f"  Final total: {total} questions", file=sys.stderr)

    # Step 6: Convert to RawQuestion format
    print(f"\nStep 6: Converting to RawQuestion format...", file=sys.stderr)
    raw_questions = [to_raw_question(q) for q in combined]

    # Step 7: Build CrawlResult
    crawl_result = {
        "source": "nailstest.com",
        "crawledAt": datetime.now(timezone.utc).isoformat(),
        "totalQuestions": total,
        "questions": raw_questions,
        "errors": [],
    }

    # Step 8: Write output
    print(f"\nStep 7: Writing to {OUTPUT_FILE}...", file=sys.stderr)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(crawl_result, f, ensure_ascii=False, indent=2)

    print(f"\nDone! {total} questions written to {OUTPUT_FILE}", file=sys.stderr)

    # Final verification
    print(f"\nVerification:", file=sys.stderr)
    print(f"  Total questions: {total}", file=sys.stderr)
    print(f"  Expected: 861", file=sys.stderr)
    print(f"  Match: {'YES' if total == 861 else 'NO - MISMATCH!'}", file=sys.stderr)

    # Spot check a few
    print(f"\n  Sample Q#1: {raw_questions[0]['questionText'][:60]}...", file=sys.stderr)
    print(f"  Sample Q#100: {raw_questions[99]['questionText'][:60]}...", file=sys.stderr)
    print(f"  Sample Q#400: {raw_questions[399]['questionText'][:60]}...", file=sys.stderr)
    print(f"  Sample Q#861: {raw_questions[-1]['questionText'][:60]}...", file=sys.stderr)


if __name__ == "__main__":
    main()
