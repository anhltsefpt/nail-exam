# Features

## MVP Feature List

All four features below were selected for the initial MVP release.

### 1. Practice Questions with Explanations

Multiple-choice questions with detailed answer explanations shown after each question. This is the core product.

**Content strategy:** Combination of self-authored/sourced questions AND licensed content from existing nail education providers.

**Topic coverage:**
- Infection Control
- Anatomy & Physiology
- Chemistry
- Electricity
- Manicuring
- Nail Disorders & Diseases
- Nail Product Chemistry
- Nail Structure & Growth
- Nail Tips and Wraps
- Pedicuring
- Salon Business
- Skin Structure
- UV Gels
- Monomer-Polymer (Acrylic)
- Nail Art and Design
- Client Consultation & Customer Service
- Sanitation and Safety Practices

Questions are tagged as either **national** (NIC exam) or **state-specific** to support tailored experiences.

### 2. Timed Mock Exams

Simulate real exam conditions with a timer and scoring.

**Real exam reference (NIC):**
- 110 items total
- 90-minute time limit
- 2 sections: Scientific Concepts (44 multiple-choice questions) + Nail Technology Procedures
- Passing score: 75%

Mock exam templates define: number of questions, time limit, passing score, and topic distribution.

### 3. Study Guides / Topic Reviews

Text-based review material organized by topic. Covers all major exam areas listed above. Content stored as markdown or rich text, organized by topic category.

### 4. AI Tutor / Chat

Ask questions and get AI-powered explanations on any nail technology topic. Uses OpenAI GPT via Supabase Edge Functions.

This is the **primary differentiator** -- no competitor offers conversational AI tutoring. Users can:
- Ask follow-up questions about topics they don't understand
- Get explanations in plain language
- Request examples or mnemonics
- Get help in Vietnamese (or other supported languages)

## State Selection at Onboarding

- User picks their US state during onboarding
- App tailors content based on their state: national exam foundation + state-specific content where applicable
- 33 states use the NIC exam; remaining states use their own exams
- Special cases: Connecticut has no licensing requirements; Florida and Illinois require only training completion (no exam)

## Subscription Model

- **Free trial** period to let users experience the app
- **Monthly:** $9.99/month
- **Annual:** $59.99/year
- **Alternative under consideration:** One-time purchase ($29.99-$39.99) may be more appropriate given users are transient (study 2-4 months, pass, leave)
- **Hybrid option:** One-time exam prep access + optional AI tutor subscription add-on

Managed via RevenueCat for both Apple App Store and Google Play Store.

## Future Features

### Continuing Education Courses
Roughly half of US states require CE credits for license renewal (4-14 hours per cycle depending on state). Expanding into CE courses would serve licensed technicians post-exam and create a recurring revenue stream.

### More Languages
Expanding beyond English and Vietnamese to serve additional demographics (Spanish, Korean, etc.).

### Smart / Adaptive Learning
- Spaced repetition algorithms
- Weak-area detection and focus
- Personalized study plans
- Progress analytics and readiness scoring

These are noted as significant market gaps -- no competitor offers any of these features.
