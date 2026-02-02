# App Overview

## Working Title

**Nail Exam AI** (project codename: `nail-exam-ai`)

A formal branded name has not been decided yet. Candidates to consider during marketing phase.

## Core Concept

A mobile exam prep application for US nail technician licensing exams. The app combines a comprehensive question bank, timed mock exams, study guides, and an AI-powered tutor to help aspiring nail technicians pass their state board exam on the first attempt.

The app targets both the national NIC (National-Interstate Council of State Boards of Cosmetology) exam used by 33 states and state-specific exams, starting with the national exam as the foundation and expanding to state-specific content over time.

## Target Audience

- **Primary:** People preparing to take the nail technician licensing exam for the first time (~25,000-40,000 exam attempts per year in the US)
- **Secondary:** Exam retakers (~40-45% fail rate on the NIC exam means many need a second round)
- **Future expansion:** Licensed technicians needing continuing education credits

### Demographics

| Demographic | Detail |
|-------------|--------|
| Gender | 84.0% women, 16.0% men |
| Average age | 43 years old |
| Ethnicity | 51.7% Asian, 30.9% White, 12.7% Hispanic/Latino, 2.4% Black/African American |
| Vietnamese community | Largest subgroup within the 51.7% Asian demographic -- significantly underserved by English-only apps |

## Key Differentiators

### 1. AI Tutor (Primary Differentiator)

Conversational AI tutoring powered by OpenAI GPT where users can ask questions and get instant explanations on any nail technology topic. **No existing competitor offers AI-powered tutoring of any kind.** Every competitor is static question/answer only.

### 2. Vietnamese / Multilingual Support

Full Vietnamese + English support (with potential for other languages later). Only one competitor (Nails Exam -- Luyen Thi Nails) supports Vietnamese, and it is basic (iOS only, 900 questions, no AI). This targets the 51.7% Asian demographic, which is predominantly Vietnamese.

### 3. Additional Advantages Over Competitors

- **Smart study features** -- No competitor offers spaced repetition, adaptive learning, or weak-area detection
- **State-specific content tailoring** -- Most competitors are generic "national exam" prep with no state personalization
- **Cross-platform** -- iOS + Android from a single codebase (most competitors are iOS-only)
- **Modern UI/UX** -- Several competitors have dated interfaces

## Tech Stack Summary

| Component | Technology |
|-----------|-----------|
| Frontend | Expo / React Native (TypeScript) |
| Backend | Supabase (Postgres, Auth, Edge Functions, Storage) |
| AI Provider | OpenAI GPT API (via Supabase Edge Functions) |
| Subscriptions | RevenueCat |
| Auth | Supabase Auth (email/password + Apple Sign-In + Google Sign-In) |
