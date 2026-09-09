# The Daily Workout

A simple, 15-minute daily workout web app. It runs in the browser, needs no equipment, and requires no account.

**Live Demo:** [the-daily-workout.vercel.app](https://your-deployed-app-url.com) _(placeholder)_

| 15 minutes | Balanced | Private |
| :--- | :--- | :--- |
| Warm-up, workout, stretch | Push, back, legs, core | No account, runs in browser |

---

## What it is

- **Runs in your browser:** Works on mobile and desktop without installing an app.
- **No account needed:** No sign-up, email, passwords, or ads.
- **Bodyweight only:** Exercises use your own bodyweight, no gear required.
- **Strictly 15 minutes:** Includes warm-up, main exercise circuit, and cool-down stretches.
- **Balanced routine:** Cycles between upper body, back/posture, legs, and core so routines don't over-index on push-ups.
- **Client-side and private:** Your workout history and streaks are stored locally in your browser (`localStorage`). Nothing is sent to a server.

---

## How to use it

1. Open the website on your phone (you can add it to your home screen as a PWA if you want).
2. Tap **Start Workout**.
3. Place your phone nearby:
   - The screen stays awake automatically while the session is running.
   - Looping images demonstrate each movement.
   - Sound prompts count down the last few seconds so you don't need to watch the screen.
4. The workout finishes automatically after 15 minutes.

---

## The 15-minute breakdown

- **2.5 minutes:** Dynamic warm-up (mobility)
- **10 minutes:** Main circuit (two rounds of 5 exercises: 45s work, 15s rest)
- **2.5 minutes:** Cool-down (static stretches)

---

## Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v20.19+)
- `npm` (v10+)

### Quickstart

```bash
# 1. Clone the repository
git clone https://github.com/your-username/the-daily-workout.git
cd the-daily-workout

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

### Available Scripts

- `npm run dev` — Starts the Vite dev server with hot module reloading.
- `npm run build` — Runs TypeScript checks and builds production assets to `dist/`.
- `npm run preview` — Previews the production build locally.
- `npm run lint` — Runs the [oxlint](https://oxc.rs/) linter.

---

## Technical Architecture

| Layer           | Technology                       | Note                                                                                                |
| :-------------- | :------------------------------- | :-------------------------------------------------------------------------------------------------- |
| **Framework**   | **Vite + React 19 (TypeScript)** | Small bundle size, fast local development.                                                          |
| **Styling**     | **Tailwind CSS v4**              | Native CSS-first setup via `@tailwindcss/vite`.                                                     |
| **Icons**       | **Lucide React**                 | Lightweight SVG icons.                                                                              |
| **Audio**       | **Web Audio API**                | Generates countdown beeps and completion tones natively in the browser without loading audio files. |
| **Screen Wake** | **Screen Wake Lock API**         | Keeps display on during active workouts.                                                            |
| **Storage**     | **`localStorage`**               | Local persistence for history and preferences.                                                      |
| **Linter**      | **Oxlint**                       | Default fast linter from modern Vite templates.                                                     |

### Exercise Data

- Exercises are curated from [free-exercise-db](https://github.com/yuhonas/free-exercise-db).
- Structured catalog stored in `src/data/exercises.json`.
- Two-frame demonstration images stored in `public/exercises/{exercise-id}/0.jpg` and `1.jpg`.
- Exercises include an `equipment` attribute (`body only` by default) for future expansion.

---

## Privacy & License

- **Privacy:** 100% client-side. No tracking, analytics, or cookies.
- **License:** MIT
