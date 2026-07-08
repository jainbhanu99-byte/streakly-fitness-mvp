# Streakly — Fitness Consistency MVP

A mobile-first web app for building consistency on fitness goals through binary daily check-ins, streaks, and milestone badges. No build step, no backend — plain HTML/CSS/JS, data stored in the browser via `localStorage`.

## Why this scope

Consistency research points to a few reliable levers: a specific trigger (time/place) beats a vague goal, one-tap logging removes the friction that kills follow-through, visible streaks exploit loss-aversion ("don't break the chain"), and milestone badges give small, honest wins without over-engineering a rewards economy before the core loop is proven. This MVP intentionally leaves out social features, points economies, and adaptive reminders — those are retention multipliers to layer on once check-in habits stick.

## What's in the MVP

- Create a fitness goal from a template (Workout, Run, Yoga, Walk, Cycle, Swim, Gym, Stretch, or Custom)
- Set frequency: every day, or specific weekdays
- Optional trigger note (e.g. "after breakfast")
- One-tap binary check-in per day
- Current streak, longest streak, and total check-ins per goal
- 12-week calendar heatmap per goal
- Milestone badges at 3 / 7 / 14 / 30 / 60 / 100 days
- Insights tab: active goals, best streak, total check-ins, weekly completion rate

## Running locally

No build step required.

```
python3 -m http.server 8000
```

Then open `http://localhost:8000` on a phone or in a mobile-width browser window.

## Deploying

Static site — deploys on Vercel with zero configuration. Push this folder to a GitHub repo and import it in Vercel, or run `vercel` from this directory with the Vercel CLI.

## Roadmap (post-MVP)

- Social layer: accountability pods, shared progress (not a public feed)
- Gamification economy: XP/levels, streak freezes, cohort challenges
- Smarter reminders based on actual check-in patterns
- Weekly reflection / trend insights across goals
- Numeric logging option alongside binary check-ins
