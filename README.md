# Sprout — Routine Tracker

A mobile-first web app for building any routine — fitness, nutrition, sleep, reading, mindset, self-care — through simple check-ins, a fair points system, and a plant that visibly grows with your consistency. No build step, no backend — plain HTML/CSS/JS, data stored in the browser via `localStorage`.

See `routine-tracker-product-plan.md` for the full research, framework, and decision log behind this direction.

## What's in this version

- Seven categories (Movement, Nutrition, Sleep, Mind & growth, Mental wellness, Self-care, Custom)
- Flexible frequency: every day, N times a day, specific weekdays, or N times a week
- A difficulty tier (Micro/Easy/Moderate/Hard/Extreme) that sets a transparent point value per completion
- Adaptive mode (miss a day, spend a streak freeze) or Purist mode (true 75-Hard-style reset on any miss), chosen per routine
- A growing plant companion: lifetime points drive growth stages (Seed → Sprout → Sapling → Young tree → Blooming → Flourishing), spendable points buy streak freezes and cosmetic pots/backgrounds/decorations in the Garden shop
- Templates: 75 Hard, Atomic habits starter, Skincare AM/PM — fully editable before you start
- Low-friction check-ins: tap or swipe-right to complete, a "complete all" bulk action, and a satisfying micro-animation on the plant with every check-in
- Insights tab: streaks, weekly completion rate, category breakdown

## Running locally

No build step required.

```
python3 -m http.server 8000
```

Then open `http://localhost:8000` on a phone or in a mobile-width browser window.

## Deploying

Static site — deploys on Vercel with zero configuration. Already connected: this repo auto-deploys to Vercel on every push to `main`.

## Roadmap

- WhatsApp reminders with yes/no reply-based check-ins (needs a backend — see the product plan)
- Apple Health / Google Health Connect auto-verification (needs a native wrapper)
- Buddy/pod accountability with photo-proof sharing
- Weekly reflection / trend insights across categories
