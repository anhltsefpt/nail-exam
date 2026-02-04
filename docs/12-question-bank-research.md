# Question Bank Research & Content Strategy

## How Test-Takers Actually Study

- **70-80% are memorization-first** -- they drill practice questions until they recognize patterns
- Vietnamese community shares question banks heavily (PSI Vietnamese Study-Pack 700+ q, Facebook groups, LamGiauKieuMy.com, NguoiVietUSA.net)
- Many candidates are ESL -- reading dense English theory is a barrier, so they shortcut to "see question, remember answer"
- They already completed 400 hours of hands-on training, so they feel they "know" the material
- **20-30% study theory more carefully** -- mostly candidates who failed once or twice, career changers, or younger English-proficient candidates
- The 55-60% national pass rate proves pure memorization isn't enough for ~40% of people

## Product Decision: Focus on Question Bank

- Lead with practice questions (that's what users search for and pay for)
- Theory is delivered through explanations on wrong answers, not separate study guides
- Cut study guides from MVP -- the AI tutor + question explanations replace them

## App Practice Format (3 modes)

1. **Practice by Topic** -- 8 topics, pick one, do 10-20q rounds, no timer, show answer + explanation immediately
2. **Mock Exam** -- 70q, 90min, 75% pass, random mix across topics, score at end
3. **Review Missed** -- auto-collected wrong answers, drill only those

## How PSI Exam Questions Work

- PSI maintains a **proprietary item bank** -- nobody outside PSI knows exact questions
- Each test session draws a **random subset** from the bank
- Different test-takers on the same day can get different questions
- 10 unscored pretest questions are new items PSI is testing for future inclusion
- Bank updated **periodically** (when CIB is revised), not monthly
- The community "700 question" banks are **reconstructed from memory** by past test-takers, accumulated over years -- approximate wording, not exact PSI questions, mixed accuracy

## Why Question Accuracy Is Critical

- If users memorize wrong answers from our app, they fail the real exam because of us
- AI-generated questions can have factual errors
- Competitors have this problem -- app store reviews commonly complain about wrong answers
- The question bank IS the product. If questions are wrong, nothing else matters.

### What "correct" means

| Layer              | Requirement                                               |
| ------------------ | --------------------------------------------------------- |
| Factual accuracy   | Correct answer must be correct per Milady textbook        |
| Distractor quality | Wrong options must be plausibly wrong, not obviously fake |
| Wording            | Must match exam style (not tricky, not ambiguous)         |
| CA-specific law    | BBC regulations must be current, not outdated             |

## Sources of Truth (for AI question generation & verification)

### Primary Sources

| Source                                                 | Cost      | Use                                                                                                  |
| ------------------------------------------------------ | --------- | ---------------------------------------------------------------------------------------------------- |
| PSI CIB (CA nail technology)                           | Free      | Official exam content outline -- what topics are tested                                              |
| Milady Standard Nail Technology, 8th Ed                | ~$100-150 | THE textbook 90%+ of nail schools use. PSI exam topics based on this. Source of truth for Topics 1-7 |
| BBC Laws & Regulations (barbercosmo.ca.gov/laws_regs/) | Free      | Source of truth for Topic 8 (Business Skills & CA State Law)                                         |

### Secondary Sources

| Source                             | Cost | Use                                                                                                        |
| ---------------------------------- | ---- | ---------------------------------------------------------------------------------------------------------- |
| Milady's Standard Foundations      | ~$80 | General science overlap (skin, infection control, chemistry). Optional -- mostly covered in nail tech book |
| PSI Vietnamese Study-Pack (700+ q) | Free | Community reference, validate Vietnamese translations                                                      |
| LamGiauKieuMy.com                  | Free | Vietnamese practice questions (accuracy unverified)                                                        |
| NguoiVietUSA.net                   | Free | CA theory in Vietnamese (accuracy unverified)                                                              |

### Recommendation

Buy one copy of Milady Standard Nail Technology 8th Edition (~$100). That single book + the free BBC website covers all 8 topics. Use it to:

1. Generate questions with GPT ("generate questions based on Chapter X of Milady")
2. Verify answers with expert reviewer ("is this correct per Milady page Y?")
3. Map chapters to topics so every question traces back to a source

## Question Generation Process

1. Use PSI CIB content outline as the topic map
2. Generate questions per topic using GPT + Milady chapter references
3. AI-generate Vietnamese translations
4. Licensed CA nail tech educator reviews all questions for accuracy (~$200-500 one-time)
5. Add questions based on user feedback and commonly missed topics over time

## Product Positioning

We are NOT selling "real exam questions" (illegal and impossible). We are selling:

1. Well-organized, verified practice questions covering the same content as the exam
2. In Vietnamese (community banks are poorly formatted, scattered across Facebook groups)
3. With explanations (community banks are just Q&A with no "why")
4. On a proper app (not a PDF or Facebook post)

## 8 Study Topics & Question Targets

| #   | Topic                            | Target Qs |
| --- | -------------------------------- | :-------: |
| 1   | Infection Control & Safety       |    75     |
| 2   | Nail Structure & Growth          |    50     |
| 3   | Skin Structure & Disorders       |    50     |
| 4   | Nail Disorders & Diseases        |    60     |
| 5   | Manicuring & Pedicuring          |    90     |
| 6   | Nail Tips, Wraps & No-Light Gels |    50     |
| 7   | UV/LED Gels & Acrylic Nails      |    75     |
| 8   | Business Skills & CA State Law   |    50     |
|     | **Total**                        |  **500**  |

## Files

- Seed questions (40): `content/seed-questions.json`
- This research doc: `docs/12-question-bank-research.md`
