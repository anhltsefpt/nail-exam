# Architecture

## Tech Stack

| Component         | Technology                          | Rationale                                                                                |
| ----------------- | ----------------------------------- | ---------------------------------------------------------------------------------------- |
| **Frontend**      | Expo / React Native (TypeScript)    | Cross-platform iOS + Android from single codebase; mature ecosystem                      |
| **Backend**       | Supabase (Postgres, Edge Functions) | Hosts question bank (Postgres) and proxies AI calls (Edge Functions); generous free tier |
| **AI Provider**   | OpenAI GPT API                      | Most popular, well-documented, good for conversational tutoring                          |
| **API Proxy**     | Supabase Edge Functions             | Keeps OpenAI API key server-side; enables rate limiting and logging                      |
| **Subscriptions** | RevenueCat                          | Industry-standard subscription management; free up to $2.5K MTR                          |
| **User Data**     | localStorage                        | All user state stored on-device; no auth required                                        |

## Data Model

### Supabase Tables

Only two tables in Supabase. Everything else lives in localStorage on the device.

#### `questions`

The question bank, seeded from `content/seed-questions.json` into Supabase. Read publicly via Supabase anon key.

- Question text (EN + VI)
- Answer choices (multiple choice)
- Correct answer
- Detailed explanation (EN + VI)
- Topic reference (one of 8 study domains)
- Difficulty level

#### `topics`

The 8 CA study domains (static reference data). Could also be hardcoded in-app.

| #   | Topic                            |
| --- | -------------------------------- |
| 1   | Infection Control & Safety       |
| 2   | Nail Structure & Growth          |
| 3   | Skin Structure & Disorders       |
| 4   | Nail Disorders & Diseases        |
| 5   | Manicuring & Pedicuring          |
| 6   | Nail Tips, Wraps & No-Light Gels |
| 7   | UV/LED Gels & Acrylic Nails      |
| 8   | Business Skills & CA State Law   |

### localStorage Schema

All user state is stored on-device in localStorage. No account, no sign-in.

```typescript
// User preferences
{
  language: 'en' | 'vi'
}

// Progress tracking
{
  answeredQuestions: {
    [questionId: string]: {
      correct: boolean
      attempts: number
      lastAttempt: string // ISO timestamp
    }
  },
  bookmarkedQuestions: string[] // question IDs
}

// Mock exam history
{
  examHistory: {
    score: number
    total: number
    date: string // ISO timestamp
    answers: { questionId: string, selected: string, correct: boolean }[]
  }[]
}
```

## Access Flow

No authentication. Users open the app and start using it immediately.

```
User opens app
  -> Anonymous access (no sign-in)
  -> RevenueCat subscription check (by device)
  -> Free tier or paid -> unlock premium features
  -> Free tier -> limited access (subset of questions, no AI tutor)
```

## AI Tutor Architecture

```
User sends message in chat UI
  -> React Native app sends request to Supabase Edge Function
  -> Edge Function checks subscription status (RevenueCat, by device)
  -> Edge Function rate-limits by device ID or IP
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
- No JWT validation needed (no auth) -- rate limit by device ID or IP
- Conversation context is maintained per session
- System prompt can be tuned per language (English/Vietnamese)

## Subscription Management (RevenueCat)

```
App launch
  -> RevenueCat SDK checks entitlements (by device)
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

| Expense                                     | Monthly Estimate                  |
| ------------------------------------------- | --------------------------------- |
| Supabase (Free tier initially, Pro ~$25/mo) | $0-25/mo                          |
| OpenAI API (GPT)                            | ~$500-$2,000/mo (usage-dependent) |
| RevenueCat                                  | Free up to $2.5K MTR, then 1%     |
| Apple/Google store fees                     | 15-30% of revenue                 |
