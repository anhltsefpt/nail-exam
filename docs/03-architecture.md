# Architecture

## Tech Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Frontend** | Expo / React Native (TypeScript) | Cross-platform iOS + Android from single codebase; mature ecosystem |
| **Backend** | Supabase (Postgres, Auth, Edge Functions, Storage) | Open-source Firebase alternative; SQL-based; generous free tier; built-in auth and edge functions |
| **AI Provider** | OpenAI GPT API | Most popular, well-documented, good for conversational tutoring |
| **API Proxy** | Supabase Edge Functions | Keeps OpenAI API key server-side; enables rate limiting and logging |
| **Subscriptions** | RevenueCat | Industry-standard subscription management; free up to $2.5K MTR |
| **Auth** | Supabase Auth | Email/password + Apple Sign-In + Google Sign-In |

## Data Model

### Core Tables

#### `users`
User profile, selected state, subscription status, language preference.

#### `states`
List of US states with exam metadata (which exam body, exam format, CE requirements).

#### `topics`
Exam topic categories (e.g., sanitation, nail anatomy, chemistry, infection control, salon business).

#### `questions`
The question bank:
- Question text
- Answer choices (multiple choice)
- Correct answer
- Detailed explanation
- Source (authored / licensed)
- Tags (national / state-specific)
- Topic reference
- Difficulty level

#### `user_progress`
Tracks which questions a user has attempted:
- User reference
- Question reference
- Correct / incorrect
- Timestamps
- Number of attempts

#### `mock_exams`
Exam templates:
- Number of questions
- Time limit
- Passing score
- Topic distribution

#### `exam_attempts`
User's mock exam history:
- User reference
- Mock exam reference
- Score
- Individual answers
- Time taken
- Timestamp

#### `study_guides`
Topic-based review content:
- Topic reference
- Content (markdown or rich text)
- Language (English / Vietnamese)
- Last updated timestamp

## Auth Flow

```
User opens app
  -> Sign in (email/password, Apple Sign-In, or Google Sign-In)
  -> Supabase Auth issues JWT
  -> First-time users: State selection onboarding
  -> RevenueCat subscription check
  -> Free trial or paid -> unlock premium features
  -> Free tier -> limited access (subset of questions, no AI tutor)
```

## AI Tutor Architecture

```
User sends message in chat UI
  -> React Native app sends request to Supabase Edge Function
  -> Edge Function validates auth (JWT)
  -> Edge Function checks subscription status (RevenueCat)
  -> Edge Function calls OpenAI GPT API with:
      - System prompt (nail technology tutor persona)
      - User's conversation history
      - Context about user's current topic/question
  -> OpenAI returns response
  -> Edge Function logs usage and returns response to app
  -> App displays AI response in chat UI
```

**Key design decisions:**
- API key stays server-side (never in the mobile app)
- Edge Function acts as proxy with rate limiting
- Conversation context is maintained per session
- System prompt can be tuned per language (English/Vietnamese)

## Subscription Management (RevenueCat)

```
App launch
  -> RevenueCat SDK checks entitlements
  -> If active subscription -> full access
  -> If trial period -> full access with trial badge
  -> If no subscription -> limited free tier
  -> Purchase flow handled by RevenueCat
  -> RevenueCat syncs with Apple/Google billing
```

**RevenueCat pricing:**
- Free up to $2,500 MTR (monthly tracked revenue)
- 1% fee above $2,500 MTR

## Infrastructure Cost Estimates

| Expense | Monthly Estimate |
|---------|-----------------|
| Supabase (Pro plan) | ~$25/mo |
| OpenAI API (GPT) | ~$500-$2,000/mo (usage-dependent) |
| RevenueCat | Free up to $2.5K MTR, then 1% |
| Apple/Google store fees | 15-30% of revenue |
| Licensed question content | Varies (one-time or royalty) |
