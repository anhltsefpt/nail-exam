# Revenue Model

## Monetization Strategy

**Primary model:** Subscription with free trial, then paid monthly or yearly.

The subscription model was chosen as the most common approach for exam prep apps and aligns well with recurring content updates. Managed via **RevenueCat** for both Apple App Store and Google Play Store billing.

## Pricing Options

| Plan | Price |
|------|-------|
| Monthly subscription | $9.99/month |
| Annual subscription | $59.99/year |

### Education App Pricing Benchmarks

| Metric | Amount |
|--------|--------|
| Average education app monthly subscription | $8.13/mo |
| Average education app yearly subscription | $56.09/yr |

### Competitor Pricing

| Competitor | Model | Price |
|-----------|-------|-------|
| Nail Technician Exam Center | Monthly subscription | $9.99/mo |
| Milady Exam Prep | In-app purchase, 1 year | $39.95 |

## Alternative: One-Time Purchase

After discovering that the nail exam is a **one-time requirement** (not annual), a one-time purchase model may be more appropriate:

- **One-time price range:** $29.99-$39.99
- **Rationale:** Users are transient -- they study for 2-4 months, pass, and leave. A subscription may feel like poor value for a short usage period.

### Hybrid Model (Recommended for Consideration)

- **One-time exam prep access** ($29.99-$39.99) -- unlocks questions, mock exams, study guides
- **Optional AI tutor subscription add-on** ($4.99-$9.99/mo) -- for users who want conversational AI help

This captures the one-time exam prep market while generating recurring revenue from the premium AI feature.

## Revenue Scenarios

### Initial Estimates (Subscription at $9.99/mo)

| Scenario | Paying Users | Monthly Revenue | Annual Revenue |
|----------|-------------|-----------------|----------------|
| Conservative | 500 | ~$5,000/mo | ~$60,000/yr |
| Moderate | 2,000 | ~$20,000/mo | ~$240,000/yr |
| Optimistic | 5,000 | ~$50,000/mo | ~$600,000/yr |
| Strong growth | 10,000 | ~$100,000/mo | ~$1,200,000/yr |

A realistic first-year target would be the **moderate scenario (~$240K/yr)** if Vietnamese community marketing and AI features are executed well.

## Adjusted Estimates (Accounting for Transient User Base)

The nail exam is a one-time event. The primary customer studies for 2-4 months and leaves. Adjusted projections:

| Metric | Estimate |
|--------|----------|
| New exam takers/year | ~30,000 |
| Realistic capture rate | 5-15% |
| Paying users/year | 1,500-4,500 |
| Average subscription length | 3 months |
| **Revenue at $9.99/mo** | **$45,000-$135,000/year** |
| **Revenue at $29.99 one-time** | **$45,000-$135,000/year** |

### Revenue Drivers

| Driver | Detail |
|--------|--------|
| New exam takers each year | ~25,000-40,000 fresh users entering the pipeline annually |
| Average subscription length | 2-4 months per user (study period) |
| Retakers | ~40-45% fail rate means many need a second round |
| Continuing education (future) | Some states require CE hours -- expansion opportunity |

## Cost Breakdown

### Monthly Operating Costs

| Expense | Monthly Estimate |
|---------|-----------------|
| Supabase (Pro plan) | ~$25 |
| OpenAI API (GPT) | ~$500-$2,000 (usage-dependent) |
| RevenueCat | Free up to $2.5K MTR, then 1% of revenue |
| Licensed question content | Varies (one-time or royalty) |
| **Total operating costs** | **~$525-$2,025/mo** (before store fees) |

### Platform Fees

| Platform | Fee |
|----------|-----|
| Apple App Store | 15% (Small Business Program) or 30% |
| Google Play Store | 15% (first $1M) or 30% |

### Conversion Metrics (Education Apps)

| Metric | Value |
|--------|-------|
| Store page to download (Google Play) | 34.4% |
| Store page to download (iOS) | 18.1% |
| Day 30 retention (education apps) | 2% (one of the lowest across all sectors) |

## Net Revenue Estimate

At the moderate scenario ($240K/yr gross):

| Item | Amount |
|------|--------|
| Gross revenue | $240,000 |
| Store fees (15%) | -$36,000 |
| RevenueCat (1% above $2.5K MTR) | -$2,100 |
| Operating costs ($1,000/mo avg) | -$12,000 |
| **Net revenue** | **~$190,000/yr** |

At the adjusted conservative scenario ($45K/yr gross):

| Item | Amount |
|------|--------|
| Gross revenue | $45,000 |
| Store fees (15%) | -$6,750 |
| RevenueCat | Free (under $2.5K MTR) |
| Operating costs ($525/mo avg) | -$6,300 |
| **Net revenue** | **~$32,000/yr** |
