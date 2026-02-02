# California-Only MVP Strategy

## Decisions Locked In

| Decision | Choice |
|----------|--------|
| Target state | California only |
| Languages at launch | English + Vietnamese |
| Revenue model | Monthly subscription ($9.99/mo) |
| Content creation | AI-generated questions, expert-reviewed |

---

## California Exam Spec

| Detail | Value |
|--------|-------|
| Exam type | NIC Written (Theory only -- practical eliminated Jan 1, 2022) |
| Total questions | 70 (60 scored + 10 unscored pretest) |
| Time limit | 90 minutes |
| Passing score | 75% (45 out of 60 scored) |
| Format | Multiple-choice, computer-based |
| Administrator | PSI Services |
| Official languages | EN, KO, ES, VI, ZH (app launches with EN + VI) |
| Training required | 400 hours |
| Licensing board | CA Board of Barbering & Cosmetology (BBC) |
| License renewal | Every 2 years, $50, via BreEZe |
| CA NIC CIB | https://nictesting.org/.../CA-Nail-Technology_Written_English_CIB-2.pdf |
| Est. annual exam attempts | 7,000-9,000 |

---

## Why California First

- 27% of US nail industry workforce (56,200 workers)
- 7,000-9,000 exam attempts/year (20-25% of national total)
- Written-only exam = simpler app (no practical exam content)
- Vietnamese community = biggest underserved market + cheapest CPI ($0.50-$1.00)
- Single regulatory body (BBC), single exam format (70q NIC)

---

## MVP Features

1. **Practice Questions** -- 500+ questions organized by NIC 8 domains, bilingual EN/VI, with detailed explanations
2. **Mock Exams** -- 70 questions, 90-min timer, 75% pass (matches real CA exam exactly)
3. **Study Guides** -- Topic-based review for each NIC domain, bilingual EN/VI
4. **AI Tutor** -- Conversational help in English + Vietnamese (primary differentiator, no competitor has this)
5. **CA State Law Section** -- BBC regulations, sanitation rules, licensing requirements
6. **Progress Tracking** -- Performance by domain, weak area identification

---

## Language Strategy

- **Launch:** English + Vietnamese
- **Future:** Add Korean, Spanish, Simplified Chinese (in that priority order)
- Vietnamese is the primary underserved demographic (51.7% of nail techs are Asian, majority Vietnamese)
- Only 1 competitor (Nails Exam by LineCentury) offers basic Vietnamese -- huge gap

---

## Revenue Model

- **Monthly subscription:** $9.99/mo
- **Annual option:** $59.99/yr (offer as a discount)
- **Free trial:** 7-day free trial with full access
- **Free tier:** Limited practice questions (no mock exams, no AI tutor)
- **Managed via:** RevenueCat
- Realistic revenue: Users subscribe for ~2-4 months during study period

---

## Content Creation Strategy

1. **Source:** NIC CIB 8-domain content outline + Milady Standard Nail Technology (8th Ed)
2. **Generation:** Use GPT to draft 500+ questions across all 8 NIC domains
3. **Translation:** AI-generate Vietnamese translations, then have bilingual nail tech review
4. **Review:** Licensed CA nail tech educator reviews all questions for accuracy
5. **CA Law:** Manually research BBC regulations for CA-specific law questions
6. **Ongoing:** Add questions based on user feedback and commonly missed topics

---

## NIC 8 Content Domains (Question Distribution Targets)

| Domain | Est. % of Exam | Target Questions |
|--------|---------------|-----------------|
| 1. Infection Control & Safety | ~15% | 75 |
| 2. Nail Structure & Growth | ~10% | 50 |
| 3. Skin Structure & Disorders | ~10% | 50 |
| 4. Nail Disorders & Diseases | ~12% | 60 |
| 5. Manicuring & Pedicuring | ~18% | 90 |
| 6. Nail Tips, Wraps & No-Light Gels | ~10% | 50 |
| 7. UV/LED Gels & Acrylic Nails | ~15% | 75 |
| 8. Business Skills & CA State Law | ~10% | 50 |
| **Total** | **100%** | **500** |

---

## What Simplifies (vs. Multi-State)

- No state selection in onboarding
- No `states` table or state-specific content routing
- No practical exam prep (videos, checklists)
- No multiple exam format configurations
- Single regulatory body to track
- Mock exam is hardcoded: 70q / 90min / 75%

---

## Architecture Simplifications

- Remove `states` table (or keep minimal for future)
- Remove state selection from onboarding flow
- `questions` table: no `state_id` needed
- `mock_exams` template: single config (70q, 90min, 75% pass)
- Content tagged to NIC 8 domains only
- `language` field on content: `en` or `vi` only at launch

---

## Tech Stack (Unchanged)

- Frontend: Expo/React Native (TypeScript)
- Backend: Supabase (Postgres, Auth, Edge Functions)
- AI: OpenAI GPT API (via Edge Functions)
- Subscriptions: RevenueCat
- Auth: Supabase Auth + Apple/Google Sign-In

---

## CA-Specific Content Sources

| Source | Type | Use |
|--------|------|-----|
| NIC Theory CIB (CA version) | Official exam blueprint | Domain weights, content outline |
| Milady Standard Nail Technology (8th Ed) | Primary textbook | Question source material |
| PSI Vietnamese Study-Pack (700+ q) | Vietnamese reference | Validate Vietnamese translations |
| LamGiauKieuMy.com | CA Vietnamese questions | Community reference |
| NguoiVietUSA.net | CA theory in Vietnamese | Community reference |
| CA BBC website | State regulations | Law question content |
| CA BBC Sunset Review Report | Exam statistics | Market data verification |

---

## Marketing Focus (CA-Only)

- **Primary channel:** Apple Search Ads (Vietnamese keywords: $0.50-$1.00 CPI)
- **Secondary:** Facebook/Meta targeting Vietnamese communities in CA
- **Keywords:** "thi nail", "luyen thi nail", "nail exam california", "nail tech exam prep"
- **Geography:** Focus ad spend on CA metro areas (LA, SF Bay, San Jose, OC, Sacramento)
- **Test budget:** $500/mo on Apple Search Ads

---

## Future Expansion Path

1. **Phase 2:** Add Korean, Spanish, Simplified Chinese
2. **Phase 3:** Add Texas (state-specific exam, 2nd largest market)
3. **Phase 4:** Add NIC states (25+ states, same NIC content, different exam format 110q)
4. **Phase 5:** Add New York, Florida, remaining states
