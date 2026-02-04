# Features

## MVP Feature List

All three features below were selected for the initial MVP release.

### 1. Practice Questions with Explanations

Multiple-choice questions with detailed answer explanations. This is the core product.

**3 practice modes:**

1. **Practice by Topic** -- Pick one of 8 study domains, do 10-20 question rounds, no timer, show answer + explanation immediately after each question
2. **Mock Exam** -- 70 questions, 90-minute timer, 75% pass threshold, random mix across all topics, score shown at end (matches real CA PSI exam)
3. **Review Missed** -- Auto-collected wrong answers from practice and mock exams, drill only those

**Content strategy:** AI-generated questions based on Milady Standard Nail Technology (8th Ed) + PSI CIB content outline, reviewed by a licensed CA nail tech educator.

**8 study domains (CA PSI exam):**

| #   | Domain                           | Target Questions |
| --- | -------------------------------- | :--------------: |
| 1   | Infection Control & Safety       |        75        |
| 2   | Nail Structure & Growth          |        50        |
| 3   | Skin Structure & Disorders       |        50        |
| 4   | Nail Disorders & Diseases        |        60        |
| 5   | Manicuring & Pedicuring          |        90        |
| 6   | Nail Tips, Wraps & No-Light Gels |        50        |
| 7   | UV/LED Gels & Acrylic Nails      |        75        |
| 8   | Business Skills & CA State Law   |        50        |
|     | **Total**                        |     **500**      |

### 2. Timed Mock Exams

Simulate real CA exam conditions with a timer and scoring.

**Real CA exam reference (PSI):**

- 70 questions (60 scored + 10 unscored pretest)
- 90-minute time limit
- Multiple-choice, computer-based
- Passing score: 75%

Mock exam config is hardcoded: 70q / 90min / 75% pass.

### 3. AI Tutor / Chat

Ask questions and get AI-powered explanations on any nail technology topic. Uses OpenAI GPT via Supabase Edge Functions.

This is the **primary differentiator** -- no competitor offers conversational AI tutoring. Users can:

- Ask follow-up questions about topics they don't understand
- Get explanations in plain language
- Request examples or mnemonics
- Get help in Vietnamese (or other supported languages)

## Subscription Model

No account or sign-in required. Subscription is managed by RevenueCat and tied to the device via Apple/Google billing.

- **Free trial:** 7-day free trial with full access
- **Monthly:** $9.99/month
- **Annual:** $59.99/year
- **Free tier:** Limited practice questions (no mock exams, no AI tutor)
- **Alternative under consideration:** One-time purchase ($29.99-$39.99) may be more appropriate given users are transient (study 2-4 months, pass, leave)
- **Hybrid option:** One-time exam prep access + optional AI tutor subscription add-on

Managed via RevenueCat for both Apple App Store and Google Play Store.

## Future Features

### More Languages

Expanding beyond English and Vietnamese to serve additional demographics (Korean, Spanish, Simplified Chinese -- in that priority order).

### Multi-State Support

Expand from CA-only to other states (Texas, NIC states, New York, Florida).

### Smart / Adaptive Learning

- Spaced repetition algorithms
- Weak-area detection and focus
- Personalized study plans
- Progress analytics and readiness scoring

### Continuing Education Courses

Roughly half of US states require CE credits for license renewal (4-14 hours per cycle depending on state). Expanding into CE courses would serve licensed technicians post-exam and create a recurring revenue stream.

These are noted as significant market gaps -- no competitor offers any of these features.
