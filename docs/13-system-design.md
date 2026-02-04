# System Design

Bridges the high-level architecture (doc 03) and actual implementation. Covers project structure, navigation, data model, API layer, state management, screen designs, subscription, i18n, and implementation sequencing.

---

## 1. Tech Stack

| Layer          | Technology              | Purpose                                        |
| -------------- | ----------------------- | ---------------------------------------------- |
| Framework      | Expo (SDK 52+)          | React Native toolchain, OTA updates, EAS Build |
| Navigation     | Expo Router             | File-based routing with typed routes           |
| Language       | TypeScript              | Type safety across the codebase                |
| Database       | Supabase (PostgreSQL)   | Question bank, topics, rate limiting           |
| Edge Functions | Supabase Edge Functions | AI tutor proxy (Deno runtime)                  |
| Local Storage  | AsyncStorage            | Progress, bookmarks, exam history, chat        |
| Analytics      | Amplitude               | User behavior, funnel tracking, retention      |
| Subscription   | RevenueCat              | In-app purchases, subscription management      |
| AI             | OpenAI (gpt-4o-mini)    | AI tutor responses via Edge Function           |

### Amplitude

Event tracking for understanding user behavior and optimizing conversion.

**Key events:**

- `app_opened` — app launch (with properties: `language`, `is_premium`)
- `topic_started` — user taps a topic on the roadmap (`topic_id`, `topic_name`)
- `quiz_completed` — practice session finished (`topic_id`, `score`, `total`, `mode`)
- `exam_started` — mock exam begins
- `exam_completed` — mock exam submitted (`score`, `total`, `passed`, `time_taken`)
- `paywall_viewed` — paywall screen shown (`trigger_source`)
- `purchase_started` — user taps subscribe (`package_id`)
- `purchase_completed` — successful purchase (`package_id`, `price`)
- `tutor_message_sent` — AI tutor message sent (`conversation_id`)

**Setup:**

```typescript
// lib/amplitude.ts
import * as amplitude from "@amplitude/analytics-react-native";

const AMPLITUDE_API_KEY = "<amplitude-api-key>";

export function initAmplitude(): void {
  amplitude.init(AMPLITUDE_API_KEY, {
    defaultTracking: {
      sessions: true,
      appLifecycles: true,
      screenViews: false, // manual tracking via Expo Router
    },
  });
}

export function track(
  event: string,
  properties?: Record<string, string | number | boolean>,
): void {
  amplitude.track(event, properties);
}

export function setUserProperties(
  properties: Record<string, string | number | boolean>,
): void {
  const identify = new amplitude.Identify();
  Object.entries(properties).forEach(([key, value]) => {
    identify.set(key, value);
  });
  amplitude.identify(identify);
}
```

**User properties** (set on app launch and on change):

- `language` — `"en"` | `"vi"`
- `is_premium` — `true` | `false`
- `subscription_status` — `"none"` | `"trial"` | `"active"` | `"expired"`
- `questions_answered` — total count
- `exams_completed` — total count

### RevenueCat ↔ Amplitude Integration

RevenueCat sends subscription lifecycle events directly to Amplitude via server-side integration — no client code needed for these events.

**Setup (RevenueCat Dashboard):**

1. Go to RevenueCat → Project Settings → Integrations → Amplitude
2. Enter Amplitude API key
3. Enable "Send events" — RevenueCat will auto-send:
   - `rc_initial_purchase_event`
   - `rc_renewal_event`
   - `rc_cancellation_event`
   - `rc_trial_started_event`
   - `rc_trial_converted_event`
   - `rc_trial_cancelled_event`
   - `rc_expiration_event`
4. Set User ID mapping: use RevenueCat's anonymous app user ID (matches the device-based ID)

**Client-side ID sync:**

```typescript
// providers/SubscriptionProvider.tsx (on mount)
import Purchases from "react-native-purchases";
import * as amplitude from "@amplitude/analytics-react-native";

// After RevenueCat init, sync user IDs so Amplitude events
// from client and RevenueCat server-side events merge correctly
const appUserId = await Purchases.getAppUserID();
amplitude.setUserId(appUserId);
```

This ensures client-side Amplitude events and RevenueCat server-side events appear under the same user profile, enabling end-to-end funnel analysis: `paywall_viewed` → `purchase_started` → `rc_initial_purchase_event` → `rc_renewal_event`.

---

## 2. Project Structure

Expo Router file-based routing with TypeScript.

```
nail-exam-ai/
├── app/
│   ├── _layout.tsx                  # Root layout: providers + Stack
│   ├── (tabs)/
│   │   ├── _layout.tsx              # Bottom tab navigator (3 tabs)
│   │   ├── index.tsx                # Practice Home (tab 1)
│   │   ├── tutor.tsx                # AI Tutor conversation list (tab 2)
│   │   └── settings.tsx             # Settings (tab 3)
│   ├── (practice)/
│   │   ├── _layout.tsx              # Stack navigator for practice flow
│   │   ├── quiz.tsx                 # Practice quiz screen
│   │   └── result.tsx               # Practice result screen
│   ├── (mock-exam)/
│   │   ├── _layout.tsx              # Stack navigator for mock exam flow
│   │   ├── start.tsx                # Mock exam start/config screen
│   │   ├── exam.tsx                 # Mock exam in-progress
│   │   ├── result.tsx               # Mock exam result (pass/fail)
│   │   └── review.tsx               # Review exam answers
│   ├── (chat)/
│   │   ├── _layout.tsx              # Stack navigator for chat
│   │   └── [id].tsx                 # Individual chat conversation
│   └── paywall.tsx                  # Paywall modal
├── components/
│   ├── questions/
│   │   ├── QuestionCard.tsx         # Question display with options
│   │   ├── OptionButton.tsx         # Individual answer option
│   │   ├── ExplanationCard.tsx      # Answer explanation after selection
│   │   └── ProgressBar.tsx          # Quiz progress indicator
│   ├── exam/
│   │   ├── Timer.tsx                # Countdown timer display
│   │   ├── QuestionNavigator.tsx    # Grid of question numbers (tap to jump)
│   │   └── ExamHeader.tsx           # Timer + question count in header
│   ├── chat/
│   │   ├── ChatBubble.tsx           # Message bubble (user/AI)
│   │   ├── StreamingIndicator.tsx   # Typing/streaming animation
│   │   └── SuggestionChips.tsx      # Quick-action suggestion buttons
│   ├── practice/
│   │   ├── TopicCard.tsx            # Topic with progress ring
│   │   ├── ProgressRing.tsx         # Circular progress indicator
│   │   └── ExamHistoryCard.tsx      # Past exam result summary
│   ├── purchase/
│   │   ├── PaywallCard.tsx          # Pricing card (monthly/annual)
│   │   └── FeatureList.tsx          # Premium feature bullet list
│   ├── common/
│   │   ├── BookmarkButton.tsx       # Bookmark toggle
│   │   └── EmptyState.tsx           # Empty state placeholder
│   └── ui/
│       ├── Button.tsx               # Styled button variants
│       ├── Card.tsx                 # Card container
│       └── BottomSheet.tsx          # Bottom sheet modal
├── hooks/
│   ├── useQuestions.ts              # Fetch & cache questions from Supabase
│   ├── useProgress.ts              # Read/write question progress (AsyncStorage)
│   ├── useExamHistory.ts           # Read/write mock exam history (AsyncStorage)
│   ├── useBookmarks.ts             # Read/write bookmarked questions (AsyncStorage)
│   ├── useChat.ts                  # Chat conversation CRUD (AsyncStorage)
│   ├── useTimer.ts                 # Countdown timer with AppState handling
│   ├── useSubscription.ts          # RevenueCat subscription state
│   └── useLanguage.ts              # Current language + t() accessor
├── lib/
│   ├── supabase.ts                 # Supabase client init (anon key, no auth)
│   ├── api.ts                      # Query functions (fetchTopics, fetchQuestions, etc.)
│   ├── storage.ts                  # AsyncStorage helpers (get/set with prefix + types)
│   ├── revenueCat.ts               # RevenueCat init, purchase, restore
│   ├── constants.ts                # Exam config, storage keys, entitlement IDs
│   ├── i18n.ts                     # Translation dictionary + t() function
│   └── exam.ts                     # Exam question selection algorithm, option shuffling
├── types/
│   └── index.ts                    # All TypeScript type definitions
├── providers/
│   ├── SubscriptionProvider.tsx     # Subscription context (RevenueCat state)
│   └── LanguageProvider.tsx         # Language context (en/vi + t function)
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # Tables, RLS, indexes
│   ├── functions/
│   │   └── ai-tutor/
│   │       └── index.ts            # Edge Function: AI tutor proxy
│   └── seed.sql                    # Seed topics + questions from JSON
├── content/
│   └── seed-questions.json         # Source question data (already exists)
├── app.json                        # Expo config
├── tsconfig.json
└── package.json
```

---

## 3. Navigation Architecture

### Bottom Tabs (3)

| Tab | Label    | Icon             | Screen            |
| --- | -------- | ---------------- | ----------------- |
| 1   | Practice | `pencil`         | Practice Home     |
| 2   | AI Tutor | `message-circle` | Conversation List |
| 3   | Settings | `settings`       | Settings          |

### All Screens (11)

| #   | Screen                | Route                 | Stack Group    |
| --- | --------------------- | --------------------- | -------------- |
| 1   | Practice Home         | `/(tabs)/`            | Tabs           |
| 2   | AI Tutor List         | `/(tabs)/tutor`       | Tabs           |
| 3   | Settings              | `/(tabs)/settings`    | Tabs           |
| 4   | Practice Quiz         | `/(practice)/quiz`    | Practice Stack |
| 5   | Practice Result       | `/(practice)/result`  | Practice Stack |
| 6   | Mock Exam Start       | `/(mock-exam)/start`  | Exam Stack     |
| 7   | Mock Exam In-Progress | `/(mock-exam)/exam`   | Exam Stack     |
| 8   | Mock Exam Result      | `/(mock-exam)/result` | Exam Stack     |
| 9   | Mock Exam Review      | `/(mock-exam)/review` | Exam Stack     |
| 10  | Chat Conversation     | `/(chat)/[id]`        | Chat Stack     |
| 11  | Paywall               | `/paywall`            | Modal          |

### Navigation Flows

**Practice by Topic:**
Practice Home → select topic → Practice Quiz → (complete) → Practice Result → (back) → Practice Home

**Mock Exam:**
Practice Home → Mock Exam Start → (begin) → Mock Exam In-Progress → (submit/timer expires) → Mock Exam Result → (review) → Mock Exam Review → (back) → Practice Home

**Review Missed:**
Practice Home → Practice Quiz (pre-filtered to missed questions) → Practice Result → Practice Home

**AI Tutor:**
AI Tutor List → Chat Conversation (new or existing) → (back) → AI Tutor List

**Paywall (modal, triggered from any flow):**
Any screen → Paywall modal → (purchase/dismiss) → return to previous screen

---

## 4. Supabase Schema

### `topics` Table

8 rows. Static reference data.

```sql
CREATE TABLE topics (
  id          INTEGER PRIMARY KEY,
  name_en     TEXT NOT NULL,
  name_vi     TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- RLS: public read, no writes
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON topics FOR SELECT USING (true);
```

Seed data:

| id  | name_en                          | name_vi                             | sort_order |
| --- | -------------------------------- | ----------------------------------- | ---------- |
| 1   | Infection Control & Safety       | Kiểm Soát Nhiễm Trùng & An Toàn     | 1          |
| 2   | Nail Structure & Growth          | Cấu Trúc & Sự Phát Triển Của Móng   | 2          |
| 3   | Skin Structure & Disorders       | Cấu Trúc Da & Các Bệnh Về Da        | 3          |
| 4   | Nail Disorders & Diseases        | Các Bệnh & Rối Loạn Về Móng         | 4          |
| 5   | Manicuring & Pedicuring          | Làm Móng Tay & Móng Chân            | 5          |
| 6   | Nail Tips, Wraps & No-Light Gels | Móng Tip, Wraps & Gel Không Cần Đèn | 6          |
| 7   | UV/LED Gels & Acrylic Nails      | Gel UV/LED & Móng Acrylic           | 7          |
| 8   | Business Skills & CA State Law   | Kỹ Năng Kinh Doanh & Luật CA        | 8          |

### `questions` Table

500+ rows at launch. Bilingual columns with `_en`/`_vi` suffix.

```sql
CREATE TABLE questions (
  id              SERIAL PRIMARY KEY,
  topic_id        INTEGER NOT NULL REFERENCES topics(id),
  question_en     TEXT NOT NULL,
  question_vi     TEXT,                          -- nullable, English fallback
  options_en      JSONB NOT NULL,                -- ["option A", "option B", "option C", "option D"]
  options_vi      JSONB,                         -- nullable, English fallback
  correct_index   SMALLINT NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
  explanation_en  TEXT NOT NULL,
  explanation_vi  TEXT,                          -- nullable, English fallback
  difficulty      TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_active       BOOLEAN NOT NULL DEFAULT true, -- soft delete
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_questions_topic ON questions(topic_id);
CREATE INDEX idx_questions_active ON questions(is_active) WHERE is_active = true;

-- RLS: public read active questions only, no writes
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active" ON questions FOR SELECT USING (is_active = true);
```

**Key decisions:**

- `correct_index` is 0-based into the `options_en`/`options_vi` arrays (matches `seed-questions.json` `correct` field)
- Vietnamese columns are nullable — English is the fallback when Vietnamese is missing
- `options` stored as JSONB arrays of 4 strings (not separate columns)
- `is_active` for soft-delete without breaking references in user's local exam history
- No client write access — all data is seeded via migration/admin

### `rate_limits` Table

Rate limiting for AI tutor Edge Function.

```sql
CREATE TABLE rate_limits (
  device_id    TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  request_count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (device_id, window_start)
);

-- Cleanup: delete rows older than 2 hours
-- (run via pg_cron or Edge Function cleanup)

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
-- No public access — only Edge Functions access this table via service role key
```

### Seed Data Strategy

1. `seed-questions.json` contains English-only questions with fields: `id`, `topic_id`, `question`, `options`, `correct`, `explanation`
2. Migration script maps these to the bilingual schema: `question` → `question_en`, `options` → `options_en`, `explanation` → `explanation_en`, `correct` → `correct_index`
3. After seeding with explicit IDs, reset the serial sequence: `SELECT setval('questions_id_seq', (SELECT MAX(id) FROM questions))` — prevents primary key collisions when adding questions later
4. Vietnamese translations added in a subsequent migration or data update
5. Topic seed data is hardcoded in the migration (8 rows, rarely changes)

---

## 5. AsyncStorage Schema

All keys are prefixed with `@nailexam:` to avoid collisions.

### Key Map

| Key                         | Type               | Description                    |
| --------------------------- | ------------------ | ------------------------------ |
| `@nailexam:language`        | `Language`         | User's selected language       |
| `@nailexam:progress`        | `QuestionProgress` | Per-question answer history    |
| `@nailexam:bookmarks`       | `Bookmarks`        | Bookmarked question IDs        |
| `@nailexam:exam_history`    | `ExamHistory`      | Past mock exam results         |
| `@nailexam:chat_history`    | `ChatHistory`      | AI tutor conversations         |
| `@nailexam:questions_cache` | `QuestionsCache`   | Cached questions from Supabase |

### TypeScript Interfaces

```typescript
// @nailexam:language
type Language = "en" | "vi";

// @nailexam:progress
interface QuestionProgress {
  [questionId: string]: {
    correct: boolean; // last attempt result
    attempts: number; // total attempts
    lastAttempt: string; // ISO 8601 timestamp
  };
}

// @nailexam:bookmarks
type Bookmarks = number[]; // array of question IDs

// @nailexam:exam_history
interface ExamHistory {
  exams: ExamRecord[];
}

interface ExamRecord {
  id: string; // UUID, generated client-side
  date: string; // ISO 8601 timestamp
  score: number; // correct count
  total: number; // total questions (70)
  passed: boolean; // score/total >= 0.75
  timeTaken: number; // seconds spent
  topicBreakdown: {
    // per-topic score
    topicId: number;
    correct: number;
    total: number;
  }[];
  answers: {
    // full answer record for review
    questionId: number;
    selectedIndex: number;
    correctIndex: number;
    correct: boolean;
  }[];
}

// @nailexam:chat_history
interface ChatHistory {
  conversations: ChatConversation[]; // max 20, oldest dropped when exceeded
}

interface ChatConversation {
  id: string; // UUID
  title: string; // first user message, truncated to 50 chars
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  messages: ChatMessage[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string; // ISO 8601
}

// @nailexam:questions_cache
interface QuestionsCache {
  fetchedAt: string; // ISO 8601 timestamp
  questions: Question[]; // full question data
  topics: Topic[]; // full topic data
}
```

### Cache Invalidation

- **Questions cache**: Refresh if `fetchedAt` is older than 24 hours. On failure to refresh, continue using stale cache.
- **Chat history**: Capped at 20 conversations. When adding a 21st, drop the oldest by `updatedAt`.
- **All keys**: Cleared together only on explicit "Reset Progress" from Settings.

---

## 6. TypeScript Types

All types live in `types/index.ts`.

```typescript
// --- Database types (from Supabase) ---

export interface Topic {
  id: number;
  name_en: string;
  name_vi: string;
  sort_order: number;
}

export interface Question {
  id: number;
  topic_id: number;
  question_en: string;
  question_vi: string | null;
  options_en: string[]; // always 4 items
  options_vi: string[] | null;
  correct_index: number; // 0-3
  explanation_en: string;
  explanation_vi: string | null;
  difficulty: "easy" | "medium" | "hard";
}

// --- Display types (language-resolved) ---

export interface DisplayQuestion {
  id: number;
  topicId: number;
  question: string; // resolved to current language
  options: string[]; // resolved to current language
  correctIndex: number;
  explanation: string; // resolved to current language
  difficulty: "easy" | "medium" | "hard";
}

export interface DisplayTopic {
  id: number;
  name: string; // resolved to current language
  sortOrder: number;
}

// --- Exam types ---

export interface ExamConfig {
  totalQuestions: number; // 70
  timeLimit: number; // 5400 (seconds = 90 min)
  passThreshold: number; // 0.75
}

export interface PracticeSessionConfig {
  topicId: number | null; // null = review missed
  questionCount: number; // 10-20 for practice, all for review missed
  mode: "practice" | "review-missed";
}

export interface PracticeSession {
  config: PracticeSessionConfig;
  questions: DisplayQuestion[];
  currentIndex: number;
  answers: UserAnswer[];
}

export interface UserAnswer {
  questionId: number;
  selectedIndex: number; // 0-3
  correctIndex: number;
  correct: boolean;
  timeSpent?: number; // seconds on this question (mock exam only)
}

export interface PracticeResult {
  mode: "practice" | "review-missed";
  topicId: number | null;
  score: number;
  total: number;
  answers: UserAnswer[];
}

export interface TopicScore {
  topicId: number;
  correct: number;
  total: number;
  percentage: number;
}

// --- Subscription types ---

export type SubscriptionStatus = "active" | "trial" | "expired" | "none";

export interface SubscriptionState {
  status: SubscriptionStatus;
  isPremium: boolean; // true if active or trial
  expiresAt: string | null; // ISO 8601
}

// --- Chat types ---

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

// --- AI Tutor API types ---

export interface AIChatRequest {
  deviceId: string;
  language: "en" | "vi";
  messages: { role: "user" | "assistant"; content: string }[];
  context?: {
    topicId?: number;
    questionId?: number;
  };
}

export interface AIChatResponse {
  content: string; // streamed via SSE
  rateLimitRemaining: number; // requests left in current window
}

// --- Navigation param types ---

export type PracticeQuizParams = {
  topicId?: string; // undefined = review missed
  mode: "practice" | "review-missed";
};

export type MockExamReviewParams = {
  examId: string; // ID into exam history
};

export type ChatParams = {
  id: string; // conversation ID, "new" for new conversation
};
```

---

## 7. API Layer

### Supabase Client Setup

```typescript
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://<project-ref>.supabase.co";
const SUPABASE_ANON_KEY = "<anon-key>";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

No auth. Anon key provides public read access only (enforced by RLS).

### Query Functions

```typescript
// lib/api.ts

// Fetch all 8 topics
export async function fetchTopics(): Promise<Topic[]>;

// Fetch all active questions (for initial cache load)
export async function fetchQuestions(): Promise<Question[]>;

// Fetch questions for a single topic
export async function fetchQuestionsByTopic(
  topicId: number,
): Promise<Question[]>;

// Fetch a single question by ID
export async function fetchQuestion(id: number): Promise<Question | null>;

// Fetch question counts per topic (for UI progress display)
export async function fetchQuestionCounts(): Promise<
  { topicId: number; count: number }[]
>;
```

### Caching Strategy

```
App launch
  → Check AsyncStorage for @nailexam:questions_cache
  → If cache exists AND fetchedAt < 24 hours ago → use cache
  → If cache missing OR stale → fetch all questions from Supabase
    → On success → write to AsyncStorage, use fresh data
    → On failure → use stale cache if available, show offline banner
```

All 500 questions are fetched in a single request on first launch (~50-100KB JSON). This avoids per-screen network requests and enables full offline practice.

### AI Tutor Edge Function

**Endpoint:** `POST /functions/v1/ai-tutor`

**Request body:**

```json
{
  "deviceId": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "language": "en",
  "messages": [{ "role": "user", "content": "What is a pterygium?" }],
  "context": {
    "topicId": 4,
    "questionId": 42
  }
}
```

**Response:** Server-Sent Events (SSE) stream.

```
data: {"content": "A pterygium is "}
data: {"content": "an overgrowth of "}
data: {"content": "the cuticle skin..."}
data: {"done": true, "rateLimitRemaining": 28}
```

**Edge Function internals:**

```typescript
// supabase/functions/ai-tutor/index.ts

// 1. Parse request, extract deviceId
// 2. Rate limit check: query rate_limits table
//    - 30 requests per hour per device
//    - If exceeded → return 429 with retry-after
// 3. Build OpenAI messages array:
//    - System prompt (language-specific, see below)
//    - User conversation history (from request body)
// 4. Call OpenAI API with streaming enabled
//    - Model: gpt-4o-mini
//    - Max tokens: 500
//    - Temperature: 0.7
// 5. Stream response chunks back as SSE
// 6. Increment rate_limits counter
```

**Note on server-side subscription enforcement:** The Edge Function does NOT verify premium subscription status — enforcement is client-side (paywall blocks the AI Tutor tab for free users). This is an intentional MVP trade-off: adding server-side RevenueCat validation would add latency and a dependency to every request. The 30 req/hr rate limit provides natural abuse protection. A determined user who discovers the endpoint URL could bypass the paywall, but the rate limit caps their usage. Server-side enforcement can be added later if abuse becomes an issue.

**System prompts:**

English:

> You are a nail technology tutor helping students prepare for the California PSI nail technology exam. Give clear, concise explanations based on the Milady Standard Nail Technology textbook and California Board of Barbering and Cosmetology regulations. When explaining concepts, use simple language and practical examples from nail salon work. Keep responses focused and under 200 words unless the student asks for more detail.

Vietnamese:

> Bạn là gia sư công nghệ móng giúp học viên chuẩn bị cho kỳ thi PSI công nghệ móng California. Hãy đưa ra giải thích rõ ràng, ngắn gọn dựa trên sách giáo khoa Milady Standard Nail Technology và quy định của Hội Đồng Cắt Tóc & Thẩm Mỹ California. Khi giải thích khái niệm, sử dụng ngôn ngữ đơn giản và ví dụ thực tế từ công việc tiệm nail. Giữ câu trả lời tập trung và dưới 200 từ trừ khi học viên yêu cầu chi tiết hơn.

**Device ID acquisition:**

```typescript
import * as Application from "expo-application";

// iOS: Application.getIosIdForVendorAsync()
// Android: Application.getAndroidId()
```

---

## 8. State Management

### Architecture

No Redux or Zustand. Two React Context providers + custom hooks + AsyncStorage is sufficient at this scale.

### Provider Hierarchy

```tsx
// app/_layout.tsx
<SafeAreaProvider>
  <LanguageProvider>
    <SubscriptionProvider>
      <Stack />
    </SubscriptionProvider>
  </LanguageProvider>
</SafeAreaProvider>
```

LanguageProvider wraps SubscriptionProvider because the paywall UI needs translations.

### SubscriptionProvider

```typescript
// Exposes via useSubscription() hook:
interface SubscriptionContextValue {
  state: SubscriptionState; // { status, isPremium, expiresAt }
  loading: boolean; // true during initial RevenueCat check
  purchase: (packageId: string) => Promise<void>;
  restore: () => Promise<void>;
}
```

On mount: calls `Purchases.getCustomerInfo()`, maps entitlements to `SubscriptionState`.

### LanguageProvider

```typescript
// Exposes via useLanguage() hook:
interface LanguageContextValue {
  language: Language; // 'en' | 'vi'
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}
```

On mount: reads `@nailexam:language` from AsyncStorage. Defaults to `'en'`.

### State Location Matrix

| Data               | Location               | Why                                       |
| ------------------ | ---------------------- | ----------------------------------------- |
| Current language   | Context + AsyncStorage | Needs to be globally accessible + persist |
| Subscription state | Context                | Needs to be globally accessible           |
| Questions cache    | AsyncStorage           | Large dataset, loaded on demand by hooks  |
| Question progress  | AsyncStorage           | Persists across sessions, read by hooks   |
| Bookmarks          | AsyncStorage           | Persists across sessions                  |
| Exam history       | AsyncStorage           | Persists across sessions                  |
| Chat history       | AsyncStorage           | Persists across sessions                  |
| Current quiz state | Component state        | Ephemeral, only exists during active quiz |
| Current exam state | Component state        | Ephemeral, only exists during active exam |
| Timer value        | Component state        | Ephemeral, driven by interval             |
| Chat input text    | Component state        | Ephemeral                                 |

---

## 9. Screen Designs (Functional Spec)

### Screen 1: Practice Home

**Purpose:** Main landing screen. Shows a roadmap-style topic progression with progress tracking and access to all practice modes.

**Data needed:** Topics (cache), question progress (AsyncStorage), exam history (AsyncStorage), subscription state (context).

**Layout:**

- **Overall progress** at top: "X of Y questions answered" with progress bar, recent exam score badge
- **Topic roadmap**: 8 topics displayed as a vertical roadmap/learning path (not a flat grid). Each node shows: topic name, progress ring (answered/total), completion %. Topics flow top-to-bottom in order, connected visually. Tapping a topic → Practice Quiz.
- **Action buttons** below roadmap: "Mock Exam" (lock if not premium), "Review Missed" (count badge + lock if not premium)
- **Recent exams** section: Last 2-3 mock exam results — date, score, pass/fail

**Actions:**

- Tap topic node → navigate to Practice Quiz with `topicId`
- Tap "Mock Exam" → if premium: navigate to Mock Exam Start; else: navigate to Paywall
- Tap "Review Missed" → if premium: navigate to Practice Quiz (review-missed mode); else: navigate to Paywall
- Tap exam history card → navigate to Mock Exam Review

### Screen 2: Practice Quiz

**Purpose:** Answer questions one at a time with immediate feedback.

**Params:** `topicId` (number or undefined), `mode` ('practice' | 'review-missed').

**Data needed:** Questions for topic or missed questions (from cache + progress), subscription state, bookmarks.

**Layout:**

- **Header**: Topic name, progress ("Q 5 of 10"), bookmark button
- **Question card**: Question text, 4 option buttons
- **After answering**: Selected option highlighted green (correct) or red (wrong), correct option always highlighted green, explanation card slides up from bottom
- **Footer**: "Next" button (appears after answering)

**Behavior:**

- Questions are shuffled at session start
- Option order is shuffled per question (with `correctIndex` remapped)
- Progress saved to AsyncStorage after each answer
- Free users: limited to first 10 questions per topic. On question 11 → Paywall

**Actions:**

- Tap option → lock in answer, show feedback
- Tap bookmark → toggle bookmark for this question
- Tap "Next" → advance to next question
- Last question "Next" → navigate to Practice Result

### Screen 3: Practice Result

**Purpose:** Summary after completing a practice session.

**Data needed:** Session answers (passed from quiz screen).

**Layout:**

- **Score**: "8 of 10 correct" with percentage
- **Per-question breakdown**: Scrollable list showing each question with correct/incorrect indicator
- **Actions**: "Practice Again" (same topic), "Back to Topics"

### Screen 4: Mock Exam Start

**Purpose:** Pre-exam screen with exam info and start button.

**Premium only.** Navigates to Paywall if not premium.

**Layout:**

- **Exam info card**: "70 questions, 90 minutes, 75% to pass"
- **Instructions**: Brief text about exam format
- **"Start Exam" button**

### Screen 5: Mock Exam In-Progress

**Purpose:** Timed exam simulation.

**Data needed:** 70 questions (selected by algorithm), timer state.

**Layout:**

- **Header**: Timer (MM:SS countdown), question count ("Q 23 of 70"), navigator button
- **Question card**: Question text, 4 option buttons (no immediate feedback)
- **Footer**: "Previous" / "Next" / "Flag for Review" buttons
- **Question navigator** (bottom sheet): Grid of 70 numbered circles — gray (unanswered), blue (answered), orange (flagged), tap to jump

**Behavior:**

- No immediate answer feedback — just records selection
- User can navigate freely between questions
- Flag for review marks questions to revisit
- Timer persists through app backgrounding (using `AppState`)
- Timer expiry → auto-submit with warning alert
- "Submit Exam" button appears in navigator (requires confirmation)

### Screen 6: Mock Exam Result

**Purpose:** Pass/fail result with score breakdown.

**Data needed:** Completed exam answers, questions data.

**Layout:**

- **Pass/Fail banner**: Large pass (green) or fail (red) indicator
- **Score**: "52 of 70 correct (74%)" with pass threshold line
- **Topic breakdown**: 8 rows, each showing topic name, score, mini progress bar
- **Actions**: "Review Answers", "Try Again", "Back to Practice"

**Behavior:**

- Exam record saved to AsyncStorage exam history on mount
- Topic breakdown calculated from answers grouped by `topicId`

### Screen 7: Mock Exam Review

**Purpose:** Review all answers from a completed exam.

**Data needed:** Exam record from history (by examId).

**Layout:**

- **Filter tabs**: All / Correct / Incorrect / Flagged
- **Question list**: Each item shows question text, selected answer, correct answer, explanation
- Color-coded: green (correct), red (incorrect)
- Tap to expand explanation

### Screen 8: AI Tutor Conversation List

**Purpose:** List of past and new chat conversations.

**Premium only.** Shows Paywall if not premium.

**Data needed:** Chat history (AsyncStorage), subscription state.

**Layout:**

- **"New Conversation" button** at top
- **Conversation list**: Each item shows title (first message truncated), last updated date, message count
- **Empty state**: "Ask me anything about nail technology!" with suggestion chips

**Actions:**

- Tap "New Conversation" → navigate to Chat with `id="new"`
- Tap conversation → navigate to Chat with `id=<conversationId>`

### Screen 9: Chat Conversation

**Purpose:** Chat with AI tutor.

**Params:** `id` (conversation ID or "new").

**Data needed:** Conversation messages (AsyncStorage), subscription state, language.

**Layout:**

- **Header**: Conversation title, back button
- **Message list**: Chat bubbles — user (right-aligned), assistant (left-aligned)
- **Streaming indicator**: Animated dots while AI is responding
- **Suggestion chips**: Quick-tap suggestions when conversation is empty or after AI response (e.g., "Explain infection control", "What's the difference between UV and LED gels?")
- **Input bar**: Text input + send button

**Behavior:**

- Messages sent to AI tutor Edge Function
- Response streamed via SSE — text appears incrementally
- Conversation saved to AsyncStorage after each exchange
- Rate limit feedback: show remaining requests, gentle warning at 5 remaining
- Network error: show retry button on failed message

### Screen 10: Settings

**Purpose:** App preferences and account management.

**Data needed:** Language (context), subscription state (context).

**Layout:**

- **Language**: Toggle between English / Tiếng Việt
- **Subscription**: Current status (Free / Trial / Premium), manage subscription link
- **Restore Purchases** button
- **Reset Progress**: Clears all AsyncStorage data (with confirmation dialog)
- **Support**: Link to email support
- **About**: App version, credits
- **Legal**: Privacy policy, terms of service links

### Screen 11: Paywall

**Purpose:** Convert free users to paid subscribers.

**Presented as modal.** Triggered from premium-locked features.

**Data needed:** Subscription packages (RevenueCat), subscription state.

**Layout:**

- **Header**: "Unlock Full Access" with close (X) button
- **Feature list**: Checkmark list of premium features (all 500+ questions, mock exams, review missed, AI tutor)
- **Pricing cards**: Two cards side by side:
  - Monthly: $9.99/mo
  - Annual: $59.99/yr (with "Save 50%" badge)
- **Free trial CTA**: "Start 7-Day Free Trial" button (prominent)
- **Restore purchases** link (small text below)
- **Legal**: Subscription terms, auto-renewal disclaimer (required by Apple)

---

## 10. Subscription & Paywall

### RevenueCat Configuration

| Setting          | Value                          |
| ---------------- | ------------------------------ |
| Entitlement ID   | `premium`                      |
| Product: Monthly | `nailexam_monthly_999`         |
| Product: Annual  | `nailexam_annual_5999`         |
| Free trial       | 7 days (on both plans)         |
| Platform         | iOS (launch), Android (future) |

### Implementation

```typescript
// lib/revenueCat.ts

import Purchases from "react-native-purchases";

const REVENUECAT_API_KEY = "<revenuecat-public-sdk-key>";

export async function initRevenueCat(): Promise<void> {
  Purchases.configure({ apiKey: REVENUECAT_API_KEY });
}

export async function checkSubscription(): Promise<SubscriptionState> {
  const customerInfo = await Purchases.getCustomerInfo();
  const entitlement = customerInfo.entitlements.active["premium"];

  if (!entitlement) {
    return { status: "none", isPremium: false, expiresAt: null };
  }

  return {
    status: entitlement.periodType === "TRIAL" ? "trial" : "active",
    isPremium: true,
    expiresAt: entitlement.expirationDate,
  };
}

export async function purchasePackage(packageId: string): Promise<boolean> {
  const offerings = await Purchases.getOfferings();
  const pkg = offerings.current?.availablePackages.find(
    (p) => p.identifier === packageId,
  );
  if (!pkg) return false;

  await Purchases.purchasePackage(pkg);
  return true;
}

export async function restorePurchases(): Promise<SubscriptionState> {
  await Purchases.restorePurchases();
  return checkSubscription();
}
```

### Development Mode Override

For testing without real purchases during development:

```typescript
// lib/constants.ts
export const DEV_OVERRIDE_PREMIUM = __DEV__ && true; // toggle for dev testing
```

```typescript
// providers/SubscriptionProvider.tsx
// In dev mode, if DEV_OVERRIDE_PREMIUM is true, force isPremium: true
```

### Paywall Trigger Points (4)

| Trigger                        | Condition                              | Behavior              |
| ------------------------------ | -------------------------------------- | --------------------- |
| Mock Exam (Practice Home)      | Tap "Mock Exam" + not premium          | Present Paywall modal |
| Review Missed (Practice Home)  | Tap "Review Missed" + not premium      | Present Paywall modal |
| AI Tutor (Tutor tab)           | Open tutor tab + not premium           | Present Paywall modal |
| Practice by Topic question 11+ | Attempt Q11 in any topic + not premium | Present Paywall modal |

Free users always get: first 10 questions per topic (80 total across 8 topics), bookmarks, progress tracking on free questions, bilingual UI.

---

## 11. Internationalization (i18n)

Two layers. No heavyweight i18n library needed for 2 languages.

### Layer 1: Content (Questions & Topics)

Bilingual columns in Supabase: `_en` / `_vi` suffix. Resolved at display time.

```typescript
// lib/i18n.ts (or within useLanguage hook)

export function resolveQuestion(q: Question, lang: Language): DisplayQuestion {
  return {
    id: q.id,
    topicId: q.topic_id,
    question: lang === "vi" && q.question_vi ? q.question_vi : q.question_en,
    options: lang === "vi" && q.options_vi ? q.options_vi : q.options_en,
    correctIndex: q.correct_index,
    explanation:
      lang === "vi" && q.explanation_vi ? q.explanation_vi : q.explanation_en,
    difficulty: q.difficulty,
  };
}

export function resolveTopic(t: Topic, lang: Language): DisplayTopic {
  return {
    id: t.id,
    name: lang === "vi" ? t.name_vi : t.name_en,
    sortOrder: t.sort_order,
  };
}
```

English is always the fallback when Vietnamese is null.

### Layer 2: UI Strings

Simple key-value dictionary with interpolation.

```typescript
// lib/i18n.ts

const strings: Record<Language, Record<string, string>> = {
  en: {
    "practice.title": "Practice",
    "practice.progress": "{{answered}} of {{total}} questions",
    "practice.mock_exam": "Mock Exam",
    "practice.review_missed": "Review Missed",
    "practice.review_missed_count": "{{count}} missed",
    "practice.questions_progress": "{{done}} / {{total}}",
    "quiz.question_of": "Q {{current}} of {{total}}",
    "quiz.next": "Next",
    "quiz.bookmark": "Bookmark",
    "exam.start_title": "Mock Exam",
    "exam.info": "70 questions · 90 minutes · 75% to pass",
    "exam.start": "Start Exam",
    "exam.submit": "Submit Exam",
    "exam.time_up": "Time's Up!",
    "exam.auto_submit": "Your exam has been automatically submitted.",
    "exam.pass": "Passed",
    "exam.fail": "Not Yet",
    "exam.score": "{{score}} of {{total}} correct ({{pct}}%)",
    "exam.review": "Review Answers",
    "exam.try_again": "Try Again",
    "result.score": "{{score}} of {{total}} correct",
    "result.practice_again": "Practice Again",
    "result.back": "Back to Topics",
    "tutor.title": "AI Tutor",
    "tutor.new": "New Conversation",
    "tutor.empty": "Ask me anything about nail technology!",
    "tutor.rate_limit": "{{remaining}} questions remaining this hour",
    "tutor.rate_limit_exceeded":
      "Limit reached. Try again in {{minutes}} minutes.",
    "tutor.send": "Send",
    "settings.title": "Settings",
    "settings.language": "Language",
    "settings.subscription": "Subscription",
    "settings.restore": "Restore Purchases",
    "settings.reset": "Reset Progress",
    "settings.reset_confirm":
      "This will delete all your progress, bookmarks, and exam history. This cannot be undone.",
    "settings.reset_yes": "Reset Everything",
    "settings.cancel": "Cancel",
    "paywall.title": "Unlock Full Access",
    "paywall.trial": "Start 7-Day Free Trial",
    "paywall.monthly": "$9.99 / month",
    "paywall.annual": "$59.99 / year",
    "paywall.save": "Save 50%",
    "paywall.restore": "Restore Purchases",
    "paywall.feature.all_questions": "All 500+ practice questions",
    "paywall.feature.mock_exam": "Timed mock exams",
    "paywall.feature.review_missed": "Review missed questions",
    "paywall.feature.ai_tutor": "AI tutor in English & Vietnamese",
    "common.loading": "Loading...",
    "common.error": "Something went wrong",
    "common.retry": "Retry",
    "common.offline": "You're offline. Some features may be unavailable.",
  },
  vi: {
    "practice.title": "Luyện Tập",
    "practice.progress": "{{answered}} / {{total}} câu hỏi",
    "practice.mock_exam": "Thi Thử",
    "practice.review_missed": "Ôn Câu Sai",
    "practice.review_missed_count": "{{count}} câu sai",
    "practice.questions_progress": "{{done}} / {{total}}",
    "quiz.question_of": "Câu {{current}} / {{total}}",
    "quiz.next": "Tiếp",
    "quiz.bookmark": "Đánh Dấu",
    "exam.start_title": "Thi Thử",
    "exam.info": "70 câu · 90 phút · Đạt 75%",
    "exam.start": "Bắt Đầu Thi",
    "exam.submit": "Nộp Bài",
    "exam.time_up": "Hết Giờ!",
    "exam.auto_submit": "Bài thi đã được nộp tự động.",
    "exam.pass": "Đậu",
    "exam.fail": "Chưa Đạt",
    "exam.score": "{{score}} / {{total}} đúng ({{pct}}%)",
    "exam.review": "Xem Lại Đáp Án",
    "exam.try_again": "Thi Lại",
    "result.score": "{{score}} / {{total}} đúng",
    "result.practice_again": "Luyện Lại",
    "result.back": "Về Chủ Đề",
    "tutor.title": "Gia Sư AI",
    "tutor.new": "Cuộc Trò Chuyện Mới",
    "tutor.empty": "Hỏi tôi bất cứ điều gì về công nghệ móng!",
    "tutor.rate_limit": "Còn {{remaining}} câu hỏi trong giờ này",
    "tutor.rate_limit_exceeded":
      "Đã đạt giới hạn. Thử lại sau {{minutes}} phút.",
    "tutor.send": "Gửi",
    "settings.title": "Cài Đặt",
    "settings.language": "Ngôn Ngữ",
    "settings.subscription": "Gói Đăng Ký",
    "settings.restore": "Khôi Phục Giao Dịch",
    "settings.reset": "Xóa Tiến Trình",
    "settings.reset_confirm":
      "Thao tác này sẽ xóa tất cả tiến trình, đánh dấu và lịch sử thi. Không thể hoàn tác.",
    "settings.reset_yes": "Xóa Tất Cả",
    "settings.cancel": "Hủy",
    "paywall.title": "Mở Khóa Toàn Bộ",
    "paywall.trial": "Dùng Thử 7 Ngày Miễn Phí",
    "paywall.monthly": "$9.99 / tháng",
    "paywall.annual": "$59.99 / năm",
    "paywall.save": "Tiết Kiệm 50%",
    "paywall.restore": "Khôi Phục Giao Dịch",
    "paywall.feature.all_questions": "Hơn 500 câu hỏi luyện tập",
    "paywall.feature.mock_exam": "Thi thử có tính giờ",
    "paywall.feature.review_missed": "Ôn lại câu trả lời sai",
    "paywall.feature.ai_tutor": "Gia sư AI bằng Tiếng Anh & Tiếng Việt",
    "common.loading": "Đang tải...",
    "common.error": "Đã xảy ra lỗi",
    "common.retry": "Thử Lại",
    "common.offline":
      "Bạn đang ngoại tuyến. Một số tính năng có thể không khả dụng.",
  },
};

export function t(
  key: string,
  lang: Language,
  params?: Record<string, string | number>,
): string {
  let str = strings[lang]?.[key] ?? strings.en[key] ?? key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      str = str.replace(`{{${k}}}`, String(v));
    });
  }
  return str;
}
```

Approximately 45 translation keys. Adding a new language later means adding a third key to the `strings` object.

---

## 12. Free vs Paid Feature Matrix

| Feature           | Free                              | Paid (Premium)           |
| ----------------- | --------------------------------- | ------------------------ |
| Practice by Topic | 10 questions per topic (80 total) | All 500+ questions       |
| Mock Exam         | No                                | Yes                      |
| Review Missed     | No                                | Yes                      |
| AI Tutor          | No                                | Yes (30 requests/hour)   |
| Explanations      | On free questions                 | On all questions         |
| Bookmarks         | Yes                               | Yes                      |
| Progress Tracking | Free questions only               | All questions            |
| Bilingual EN/VI   | Yes                               | Yes                      |
| 7-Day Free Trial  | —                                 | Full access during trial |

The 10-question-per-topic limit gives users enough value to evaluate the app while creating a natural upgrade point. Total free content: 80 questions across 8 topics.

---

## 13. Technical Specifications

### Exam Question Selection Algorithm

Mock exams select 70 questions from the 500+ question bank using weighted random sampling proportional to topic distribution.

```
Target distribution (mirrors real CA PSI exam proportions):
  Topic 1 (Infection Control):     15% → ~10-11 questions
  Topic 2 (Nail Structure):        10% → ~7 questions
  Topic 3 (Skin Structure):        10% → ~7 questions
  Topic 4 (Nail Disorders):        12% → ~8-9 questions
  Topic 5 (Manicuring):            18% → ~12-13 questions
  Topic 6 (Tips, Wraps, Gels):     10% → ~7 questions
  Topic 7 (UV/LED & Acrylic):      15% → ~10-11 questions
  Topic 8 (Business & Law):        10% → ~7 questions
  Total:                           100%   70 questions
```

**Algorithm:**

1. For each topic, calculate target count: `round(70 * topicWeight)`
2. Adjust rounding so total equals exactly 70 (add/remove from largest topics)
3. For each topic, randomly select `targetCount` questions from available pool
4. Shuffle the combined 70 questions
5. For each question, shuffle option order and remap `correctIndex`

**Option shuffling with correctIndex remapping:**

```typescript
function shuffleOptions(question: DisplayQuestion): DisplayQuestion {
  const indices = [0, 1, 2, 3];
  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return {
    ...question,
    options: indices.map((i) => question.options[i]),
    correctIndex: indices.indexOf(question.correctIndex),
  };
}
```

### Timer Implementation

```typescript
// hooks/useTimer.ts

// Uses setInterval with 1-second tick
// Stores timer state: { startedAt, duration, elapsed }
//
// AppState handling:
//   - On background: record timestamp
//   - On foreground: calculate elapsed time while backgrounded, add to timer
//   - This prevents timer from pausing when user switches apps
//
// Auto-submit:
//   - When elapsed >= duration, fire onExpiry callback
//   - Show alert: "Time's up! Your exam has been submitted."
//   - Navigate to result screen
//
// Cleanup:
//   - Clear interval on unmount
//   - Remove AppState listener on unmount
```

### Offline Support

| Feature            | Offline Behavior                                        |
| ------------------ | ------------------------------------------------------- |
| Practice by Topic  | Works fully — questions cached in AsyncStorage          |
| Mock Exam          | Works fully — questions cached, timer is local          |
| Review Missed      | Works fully — all data is local                         |
| AI Tutor           | Not available — requires network. Show offline message. |
| Progress/Bookmarks | Works fully — all stored in AsyncStorage                |
| Question refresh   | Skipped — uses stale cache, retries on next app launch  |
| Paywall/Purchase   | RevenueCat caches last-known entitlement state          |

### Error Handling

| Scenario                      | Handling                                                                           |
| ----------------------------- | ---------------------------------------------------------------------------------- |
| Supabase fetch fails          | Fall back to AsyncStorage cache; show "Using cached data" banner if cache is stale |
| Supabase fetch + no cache     | Show error screen with retry button                                                |
| AI tutor stream fails         | Show error on failed message with "Retry" button                                   |
| AI tutor rate limit exceeded  | Show "Limit reached" message with minutes until reset                              |
| RevenueCat unavailable        | Use last-known subscription state from cache; don't block free features            |
| Purchase fails                | Show error alert, keep user on paywall, suggest "Restore Purchases"                |
| AsyncStorage read/write fails | Log error silently; feature degrades to in-memory only for session                 |
| Network timeout               | 10-second timeout on all network requests; treat as failure                        |

---

## 14. Implementation Sequencing

### Phase 1: Foundation

- Expo project setup with TypeScript
- Expo Router file-based navigation (tabs + route groups)
- Supabase project setup, schema migration, seed data
- AsyncStorage helper functions with typed keys
- TypeScript type definitions
- LanguageProvider + i18n strings
- Supabase client + query functions + caching layer

### Phase 2: Core Practice

- Question card component with option selection and feedback
- Practice by Topic flow: topic selection → quiz → result
- Question progress tracking (AsyncStorage)
- Bookmark functionality
- Practice Home roadmap with progress display

### Phase 3: Mock Exam

- Exam question selection algorithm (weighted random + option shuffle)
- Timer with AppState background handling
- Mock exam flow: start → in-progress → result → review
- Question navigator (jump between questions, flag for review)
- Exam history persistence (AsyncStorage)
- Topic breakdown scoring

### Phase 4: AI Tutor

- Supabase Edge Function for AI proxy (OpenAI, SSE streaming)
- Rate limiting (30 req/hr per device)
- Chat UI with streaming response display
- Conversation persistence (AsyncStorage, max 20)
- Suggestion chips
- Device ID acquisition

### Phase 5: Subscription

- RevenueCat SDK integration
- SubscriptionProvider with entitlement checking
- Paywall screen (modal)
- Free tier gating at 4 trigger points
- Restore purchases flow
- Development mode premium override

### Phase 6: Polish

- Vietnamese translations for all UI strings
- Vietnamese content for seed questions
- Settings screen (language toggle, reset, support links)
- Offline handling and error states
- Loading states and skeleton screens
- Empty states

### Phase 7: Launch Prep

- App Store assets (screenshots, description, keywords)
- Privacy policy and terms of service
- TestFlight beta testing
- Performance profiling (startup time, question cache load)
- App Store submission
