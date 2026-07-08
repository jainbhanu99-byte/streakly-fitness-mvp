# Routine Tracker — Product Plan (v2 direction)

From a fitness-only streak app to a general-purpose routine tracker, inspired by 75 Hard, grounded in what research actually says works.

---

## 1. Research findings

### 1.1 The 75 Hard Challenge (source of truth for our default template)

Created by Andy Frisella. Five non-negotiable daily tasks for 75 days, with a **full reset to Day 1 on any miss**:

1. Follow a structured diet of your choice, zero cheat meals, zero alcohol.
2. Drink 1 gallon (3.8L) of plain water daily.
3. Two 45-minute workouts, one must be outdoors, spaced 3+ hours apart.
4. Read 10 pages of non-fiction (self-development/business).
5. Take a daily progress photo.

The all-or-nothing reset is the entire point psychologically — it's a mental-toughness program, not a wellness program. That's worth preserving as an *option*, not the default, because research below shows all-or-nothing streak mechanics are also the #1 reason generic habit apps lose users.

### 1.2 Why habit trackers fail (this is the risk we're designing against)

- **92% of habit-tracking attempts fail within 60 days.** Generic trackers let people load 10–15 habits across unrelated areas at once, which dilutes focus. Habit formation research (UCL) shows a single habit takes anywhere from 18–254 days (median ~66) to become automatic — trying to build 14 at once is close to guaranteed failure.
- **The "what-the-hell effect":** streak-reset punishment is motivating early and demoralizing later. One miss resets the counter to zero, the user feels like they've already failed, and quits entirely rather than continuing imperfectly. This is the single most-cited failure mode in the 2025–2026 research and blog analysis of the category.
- **Friction kills habits faster than lack of motivation.** The best-reviewed apps (Streaks, HabitBox) win specifically because check-in takes under 2 seconds. Every extra tap costs retention.
- **Missing emotional/social connection.** Apps that only track *what* you did, not *why* or *how it felt*, see faster drop-off than apps with any reflective or social layer.

### 1.3 What the psychology says actually works

- **BJ Fogg / Tiny Habits:** Behavior = Motivation × Ability × Prompt. Lower the effort and give a reliable trigger; don't rely on willpower.
- **Loss aversion (Duolingo's core mechanic):** losing a streak feels ~2x worse than an equivalent gain feels good. Streak wagers/freezes measurably boost retention (+14% Day-14 retention in Duolingo's own data), and users with a 7-day streak are 3.6x more likely to stay long-term. But Duolingo also shows the trap: users motivated purely by the streak, not genuine interest, churn faster once the streak breaks — so the mechanic needs a safety valve.
- **Variable reward timing** (unpredictable bonus, not the base reward) activates dopamine more than predictable rewards — this argues for milestone bonuses on top of a stable, predictable base point value, not a randomized base value (which would feel unfair).
- **Commitment devices + accountability:** Dr. Gail Matthews' study (267 participants) found people who wrote goals and sent weekly progress reports to someone hit a 76% success rate vs. 43% for those who just thought about the goal. Adding a real stake (money) roughly triples success rates; adding social monitoring on top adds another ~20 points. The mechanism that matters most for us: **someone else seeing your progress**, even passively, moves the needle more than almost anything else.
- **Habit stacking / implementation intentions:** habits tied to a specific existing trigger ("after brushing teeth") stick far better than vague time-of-day goals — relevant directly to our frequency/scheduling design.

### 1.4 Competitor scan

| App | Strength | Gap |
|---|---|---|
| **Streaks** (iOS, $4.99) | Fastest possible check-in; auto-completes from Apple Health | Single-platform, no social, no points/challenge structure |
| **Loop Habit Tracker** (Android, free) | Open-source, local-only, smart "habit score" that weights recent days | No cloud sync, no social, no verification |
| **Habitica** | Deep RPG/points system, social guilds, free core features | Generic to-do gamification, not built around a coherent multi-domain challenge; overwhelming for non-gamers; self-report only |
| **HabitShare** (free) | Best-in-class privacy-first social accountability — pick exactly who sees which habit | No points, no gamification, no verification beyond self-report |
| **Way of Life** | Simple red/green pattern view, good for spotting correlations | No social, no points, dated UX |
| **Strava** | Best verification of real activity data | Fitness-only; **as of mid-2026, third-party API access requires an active paid Strava subscription and apps are barred from showing a user's data to other users** — this closes off Strava as a free social-proof layer for us |

**The gap nobody's filled:** a structured, science-backed, multi-domain challenge (like 75 Hard) combined with a *fair and transparent* points system, near-zero-friction logging, real verification instead of pure self-report, and privacy-first accountability — without the guilt-driven all-or-nothing streak spiral that makes most trackers a source of shame instead of support.

### 1.5 Proposed USP

> The only routine tracker that turns a proven, multi-domain challenge structure into a fair points system, lets you check in from WhatsApp in one tap, verifies real progress instead of trusting self-reports, and never punishes one bad day by erasing everything you've built.

---

## 2. Product framework

### 2.1 Categories (Uber-level — pick one, then customize)

Kept deliberately small at the top level; everything else is a customizable activity underneath.

1. **Movement** — workouts, walks, sports, steps
2. **Nutrition** — diet adherence, water, alcohol-free days, supplements
3. **Sleep** — hours, wind-down routine
4. **Mind & Growth** — reading, courses, professional development, journaling
5. **Mental Wellness** — meditation, gratitude, mood check-in, "positivity" actions
6. **Self-Care** — skincare, grooming, hygiene
7. **Custom** — anything else, user-defined

### 2.2 Frequency model (replaces the MVP's daily/specific-days toggle)

Needs to support real cases like "cleanser twice a day, every day" vs. "retinol twice a week":

- **Times per day** (e.g., cleanser: 2x/day, AM + PM slots)
- **Specific weekdays** (e.g., gym: Mon/Wed/Fri)
- **Times per week, flexible days** (e.g., "workout 4x/week," any 4 days — matches how people actually plan a training week)
- **Every N days** (e.g., every 3rd day)
- **Time-of-day binding** (optional): morning / afternoon / evening / exact clock time — this is also what drives the WhatsApp reminder timing and implementation-intention framing ("after breakfast" beats "sometime today")

### 2.3 Points & difficulty framework

Goal: fair and transparent (a stated part of our USP), simple enough that users don't need to think about math, and resistant to the "why is this worth so little" complaint that undermines trust in Habitica-style systems.

**Step 1 — Difficulty tiers** (base point value tied to real effort/willpower cost, not frequency):

| Tier | Point value | Examples |
|---|---|---|
| Micro | 1 | Take vitamins, drink a glass of water, apply cleanser, eat a healthy snack |
| Easy | 2 | Read 10 pages, gratitude journal, skincare routine, 10-min walk |
| Moderate | 3–4 | 30-min walk/run, meal prep, 15-min meditation, no-alcohol day |
| Hard | 5 | Full workout (45min+), cold shower, outdoor run, sticking to a strict diet all day |
| Extreme | 8 | Compound/rare asks — e.g., a 75-Hard-style double workout day |

**Step 2 — Frequency multiplier** (small, intentionally subtle — 1.0 to 1.2x — so harder-to-maintain cadences aren't undervalued, but the base tier still dominates the score):
- Daily: 1.0x
- A few times a week: 1.1x
- Weekly or less: 1.2x

**Step 3 — Assignment UX:** when a user adds an activity, ask two quick questions — "how long does this take?" and "how hard is this for you to stick to?" — and auto-suggest a tier (fully overridable). Template activities ship with sensible presets (workout = 5, eat nuts = 1, 10 pages = 2, 10k steps = 3, skincare = 1, retinol = 2) that the user can still adjust.

**Step 4 — Where the "variable reward" dopamine hit goes:** *not* in the base points (that stays predictable and fair), but in milestone bonuses — streak-based bonus points at 3/7/14/30/60/100 days, badge unlocks, and occasional surprise bonus multipliers. This mirrors what actually works in Duolingo without making the everyday point value feel arbitrary.

### 2.4 Templates

- **75 Hard (Purist Mode)** — the exact 5 rules, with the full reset-on-miss behavior available as an explicit toggle for people who want the original intensity.
- **75 Hard (Adaptive Mode)** — same 5 categories of activity, but with streak freezes instead of full resets, aimed at people who want the structure without the all-or-nothing failure spiral (directly answering the #1 reason generic trackers lose people).
- **Atomic Habits Starter** — 2–3 tiny habits total across categories, intentionally small, for people at risk of overloading (addresses the 10–15-habits failure mode directly).
- **Morning Routine**, **Skincare AM/PM**, **Digital Wellbeing**, **New Year Reset** — smaller, single-focus templates.
- All templates are fully editable before starting and mid-run: swap, remove, add activities, adjust frequency and points.

---

## 3. Progress logging & verification

Ranked roughly by friction (lowest first), since research says friction is the single biggest lever:

1. **In-app tap check-in** (already built) — keep as the zero-setup default.
2. **WhatsApp reminder + reply** — send a templated message at the activity's scheduled time with quick-reply buttons (Yes / No / Snooze); a webhook logs the reply automatically. This meets people where they already are — no need to open the app at all. Technically: Meta's WhatsApp Cloud API, utility-template pricing (roughly $0.004/message in the US, cheaper in India), free if the user has messaged first within a 24-hour window. Requires a backend (see Section 4) to receive webhooks.
3. **Device/health data auto-verification** — Apple HealthKit and Google Health Connect are the priority integrations (steps, sleep, workouts) since they're free and don't require a subscription. **Strava is now a weaker option**: as of mid-2026 its API requires a paid Strava subscription for standard access and explicitly bars showing a user's data to other users — so if we support Strava at all, it should only auto-check-off the user's *own* activity, never power a social/leaderboard view.
4. **Photo proof** — an optional daily photo attached to a check-in (a direct nod to 75 Hard's progress photo rule), shareable only with an accountability buddy if the user chooses, never public by default.
5. **Buddy/pod verification** — opt-in, privacy-first sharing modeled on HabitShare's approach (pick exactly who sees which habit) rather than Strava/Habitica-style public feeds. Small pods (3–5 people) for shared challenges, not open leaderboards.

**Anti-"what-the-hell-effect" design (important, and not optional):** default mode uses limited streak freezes (Duolingo-style) instead of hard resets, since the research is unambiguous that reset-driven guilt is the top reason people abandon trackers entirely. The strict all-or-nothing 75 Hard "Purist Mode" stays available for people who explicitly opt into that intensity, but it will not be the default experience.

---

## 4. Implementation roadmap

| Phase | Scope | Architecture impact |
|---|---|---|
| **Phase 1** | Generalize categories, new frequency model, points framework, 75 Hard + 2–3 more templates, keep tap check-in | Still fits the current no-backend, localStorage architecture. No new infra. |
| **Phase 2** | WhatsApp reminders + reply-based check-in | **Requires a real backend** — a database (e.g., Vercel Postgres or Supabase free tier) to replace localStorage, plus a webhook endpoint for WhatsApp Cloud API. This is the first point where the app stops being "just a static site." |
| **Phase 3** | Apple Health / Google Health Connect auto-verification | Full HealthKit access typically requires a native app shell (e.g., via Capacitor), not pure mobile web — this is a real architecture decision, not just a feature flag. Health Connect on Android has more web-accessible options but is still limited. Worth a dedicated discussion before committing. |
| **Phase 4** | Buddy/pod accountability, photo proof sharing | Needs user accounts/auth on top of the Phase 2 backend. |

Flagging Phase 3 specifically: going from "web app" to "needs native health data access" is a bigger jump than the others and changes what "deploy to Vercel" even means. Worth deciding deliberately rather than backing into it.

---

## 5a. Visual design direction — confirmed: Sage and clay

Moving off orange toward the 2026 wellness-app trend of sage greens, warm creams, and muted clay/terracotta accents (rather than flat pastels or neon tones) — chosen because it's both what current calming/minimalist apps converge on and because green ties directly into the new plant-growth mechanic below.

- Background: warm cream (`#F7F4EC`), not stark white
- Cards: white (`#FFFFFF`) with a hairline border, no heavy shadows
- Primary/brand (plant, done-states, active nav): sage green (`#6B8F71`)
- CTA/accent (FAB, shop, primary buttons): muted clay/terracotta (`#C97B5F`) — warm but not neon
- Text: warm charcoal (`#2E2A25`) instead of pure black; muted taupe-gray (`#948C7E`) for secondary text
- Icons: swap emoji for simple outline icons (cleaner, more premium feel, consistent with minimalist trend) — emoji stay fine for celebratory toasts/badges, but not for persistent UI chrome

A mockup of the home screen with this palette and the plant companion is shown above for reference.

## 5b. Companion mechanic: a growing plant

Recommending a **plant** over a pet: it maps directly onto the language we already use ("growing a habit"), it's lower emotional stakes than an animal (a wilting leaf reads very differently from a sad-looking pet, which matters given we already committed to a no-guilt Adaptive mode), and it's simpler to design/animate well. Modeled on what makes Finch (self-care bird) and Forest (focus tree) work, adapted to our points system instead of inventing a parallel currency:

- **One companion per user**, not per habit — keeps focus singular instead of scattering attention (directly avoids the "10-15 habits at once" failure mode from the research).
- **Growth stages** (Seed → Sprout → Sapling → Young tree → Blooming → Flourishing) driven by cumulative points, reusing the points framework from Section 2.3 rather than a second number to track.
- **Daily vitality**: each check-in visibly waters the plant with a small immediate animation (leaf sparkle, gentle grow wiggle) — this is the "reward the act of checking in" mechanic requested, and it's cheap to build.
- **Missed days dim the plant slightly rather than killing or resetting it** — consistent with the Adaptive-mode decision and Finch's own "low-pressure, no guilt" design philosophy, which the research explicitly credits for its retention.
- **Points economy**: points buy (a) functional streak freezes — protects the plant's vitality on a day you miss — and (b) cosmetic items — pots, backgrounds (windowsill, greenhouse, garden), species/color variants, small decorations. Purely cosmetic, so there's no pay-to-win tension.
- Occasional surprise/limited-edition cosmetic items add the "variable reward" novelty effect the Duolingo and Forest research both point to, without touching the core (predictable, fair) point values.

## 5c. Making check-ins effortless

Ranked by how soon we can build them:

**Buildable now, in the current web app:**
- Swipe-right-to-complete on a goal card, in addition to the existing tap — faster for one-handed use
- An immediate, satisfying micro-animation on every check-in (leaf sparkle tied to the plant) — makes logging itself feel rewarding instead of like a chore
- A "complete all" bulk action when several items are due in the same time block (e.g., a 3-item morning routine becomes one tap)
- Smart ordering — always show the next overdue/soonest item first, so there's nothing to search for
- Web push notifications with an actionable "Done" button (solid support on Android/Chrome; iOS Safari's web-push support is newer and less consistent, worth testing rather than assuming)

**Later, once a native wrapper exists (ties to Decision 5):**
- Home-screen widget with tap-to-check-off — the single highest-leverage addition based on Streaks' own success, but it requires a native shell
- Lock-screen widget / notification action that logs without opening the app at all
- Voice shortcuts ("log workout")
- Watch complication (Apple Watch / Wear OS)

**Worth remembering:** the WhatsApp reminder-and-reply flow already planned for Phase 2 is itself one of the best answers to "make check-ins effortless" — replying "yes" to a message is arguably lower-friction than even a home-screen widget, since it doesn't require unlocking to a specific app at all.

## 6. Decisions (resolved)

1. **Build approach:** Evolve the current app in place rather than starting a fresh project. We keep the existing repo, streak/badge logic, and Vercel deployment, and extend the data model to support categories, flexible frequency, and points.
2. **Default mode:** Adaptive (streak-freeze) is the default experience for all new routines. Purist (75-Hard-style full reset) is available as an explicit opt-in toggle, not the default.
3. **Template scope at launch:** 75 Hard (both Adaptive and Purist flavors) plus 2–3 additional templates (e.g. Atomic Habits Starter, Skincare AM/PM) rather than shipping 75 Hard alone.
4. **WhatsApp integration:** In scope for Phase 2, accepted the small backend build and usage-based messaging cost. This becomes the next major milestone after Phase 1 ships.
5. **Native app wrapper:** Not immediate, but the architecture should be designed so a native wrapper (e.g. via Capacitor) can be added later for real Apple Health / Google Health Connect access, without requiring a rebuild.

### What this means for sequencing

Phase 1 stays web-only, no-backend, and builds on the current repo: new category taxonomy, flexible frequency model, points/difficulty framework, Adaptive/Purist mode toggle, and 3–4 templates. Phase 2 introduces the first real backend (database + WhatsApp webhook) once Phase 1 is validated. The native wrapper decision doesn't block either phase — it just means Phase 1's data model should avoid web-only assumptions that would make a later Capacitor wrap painful.
