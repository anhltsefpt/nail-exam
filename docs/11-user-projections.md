# CA MVP Year 1 User & Revenue Projections

## Total Addressable Market

| Metric                               | Value        | Source                           |
| ------------------------------------ | ------------ | -------------------------------- |
| CA annual exam attempts              | 7,000-9,000  | Doc 10 (BBC data)                |
| Unique exam-takers (est.)            | ~6,000-7,000 | Deduplicating retakes            |
| National fail rate                   | 40-45%       | Doc 05 (NIC data)                |
| CA retakers (est.)                   | ~2,800-4,000 | Fail rate applied to CA attempts |
| Hard ceiling (unique individuals/yr) | ~6,000-7,000 | This is the max reachable market |

California represents 20-25% of national exam volume. The market is fixed -- it does not grow with ad spend. Every user who passes stops using the app.

---

## Year 1 Projections ($500/mo Ad Budget)

### Assumptions Baked Into the Table

- Ad budget: $500/mo ($6,000/yr) on Apple Search Ads
- Blended CPI: $1.00-$2.00 (Vietnamese keywords at $0.50-$1.00 pull the average down)
- Organic multiplier: 1.5-2x paid installs (ASO, word-of-mouth in Vietnamese community)
- Free-to-paid conversion: 10-20%
- Average subscription duration: 3 months at $9.99/mo

### Projection Table

| Metric                                | Conservative | Moderate | Optimistic |
| ------------------------------------- | ------------ | -------- | ---------- |
| **Blended CPI**                       | $2.00        | $1.50    | $1.00      |
| **Paid installs (Year 1)**            | 3,000        | 4,000    | 6,000      |
| **Organic installs**                  | 1,000        | 1,500    | 2,500      |
| **Total downloads**                   | 4,000        | 5,500    | 8,500      |
| **Free-to-paid conversion**           | 10%          | 15%      | 20%        |
| **Paying subscribers (cumulative)**   | 400          | 825      | 1,700      |
| **Avg months subscribed**             | 2.5          | 3        | 3          |
| **Monthly active paying users (avg)** | ~85          | ~205     | ~425       |

Note: "Monthly active paying users" is the average number of paying subscribers in any given month, accounting for the rolling churn cycle. Cumulative paying subscribers is the total unique users who ever paid during Year 1.

---

## Revenue Math

### Lifetime Value per Paying User

| Component                 | Value     |
| ------------------------- | --------- |
| Monthly price             | $9.99     |
| Avg subscription length   | ~3 months |
| LTV (gross)               | ~$30      |
| LTV after Apple's 30% cut | ~$21      |

### Year 1 Gross Revenue

| Scenario     | Paying Subs | LTV | Gross Revenue | After Apple Cut (70%) |
| ------------ | ----------- | --- | ------------- | --------------------- |
| Conservative | 400         | $30 | **$12,000**   | $8,400                |
| Moderate     | 825         | $30 | **$24,750**   | $17,325               |
| Optimistic   | 1,700       | $30 | **$51,000**   | $35,700               |

### Year 1 Net (After Ad Spend)

| Scenario     | After Apple Cut | Ad Spend | Net Revenue |
| ------------ | --------------- | -------- | ----------- |
| Conservative | $8,400          | $6,000   | **$2,400**  |
| Moderate     | $17,325         | $6,000   | **$11,325** |
| Optimistic   | $35,700         | $6,000   | **$29,700** |

Note: Apple reduces its cut to 15% after the first year for developers earning under $1M (App Store Small Business Program). This does not apply in Year 1 since the 30% rate applies for the first 12 months of each subscription.

---

## Key Assumptions

1. **Vietnamese CPI advantage** -- Vietnamese keywords ("thi nail", "luyen thi nail") are estimated at $0.50-$1.00, roughly 50-75% cheaper than English keywords. With bilingual EN/VI support, the blended CPI should be well below the $4.06 US median.

2. **AI tutor as differentiator** -- No competitor offers conversational AI tutoring. This is the primary conversion lever for free-to-paid. Without it, conversion rates would likely be at the low end (5-10%).

3. **2-4 month churn cycle** -- Users study for 2-4 months, pass (or give up), and cancel. This is inherent to exam prep -- not a product problem to solve. Revenue per user is capped at ~$30.

4. **10-20% free-to-paid conversion** -- Industry average for education apps is 2-5%. The higher estimate here assumes the AI tutor and bilingual support justify the premium, and the 7-day free trial reduces friction.

5. **Organic multiplier of 1.5-2x** -- The Vietnamese nail tech community is tight-knit. Word-of-mouth and ASO (App Store Optimization) for Vietnamese keywords should drive meaningful organic installs beyond paid.

6. **No annual plan impact** -- Projections assume monthly subscriptions only. An annual plan ($59.99/yr) would increase LTV for users who choose it but is unlikely to materially change Year 1 totals.

---

## Risks

| Risk                               | Impact                                    | Mitigation                                                                           |
| ---------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------ |
| **Content quality**                | Poor questions = bad reviews = dead app   | Expert review by licensed CA nail tech educator before launch                        |
| **Competitor response**            | Existing apps add Vietnamese/AI features  | First-mover advantage in Vietnamese AI tutoring; competitors are slow-moving         |
| **Fixed market size**              | 6-7K unique exam-takers/yr is the ceiling | CA is validation only; expansion to TX, NIC states unlocks 25K-40K/yr nationally     |
| **Higher-than-expected CPI**       | $500/mo buys fewer installs               | Vietnamese keyword targeting keeps floor low; optimize or pause if CPI exceeds $3.00 |
| **Lower-than-expected conversion** | Lots of downloads, few subscribers        | A/B test paywall, trial length, and pricing; add social proof (pass rate stats)      |
| **Apple review delays**            | Launch timing affected                    | Submit early; have TestFlight beta running before App Store submission               |

---

## Bottom Line

This is a **validation play**, not a venture-scale business in Year 1.

| Metric                          | Range               |
| ------------------------------- | ------------------- |
| Total downloads                 | 4,000 - 8,500       |
| Paying subscribers              | 400 - 1,700         |
| Gross revenue                   | $12,000 - $51,000   |
| Net revenue (after Apple + ads) | $2,400 - $29,700    |
| Ad budget                       | $6,000/yr ($500/mo) |

**What success looks like:**

- 400+ paying subscribers proves product-market fit in the Vietnamese nail tech community
- CPI under $2.00 confirms the Vietnamese keyword advantage is real
- Free-to-paid conversion above 10% validates the AI tutor as a conversion lever

**What it unlocks:**

- Phase 2 languages (Korean, Spanish, Chinese) within the CA market
- Phase 3 expansion to Texas (2nd largest market, state-specific exam)
- Phase 4 expansion to 25+ NIC states with shared content
- National TAM: 25,000-40,000 exam attempts/yr with an LTV of ~$30 each
