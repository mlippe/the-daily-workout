# The Daily Workout — Master Plan

A fast, distraction-free, 15-minute personal fitness web application built with a **minimum tech stack** philosophy: zero backend, 100% client-side privacy, offline capability (PWA), and mobile-first UX.

---

## 1. Guiding Principles & "Minimum Tech Stack"

1. **Zero Backend / Zero Maintenance:**
   - Runs entirely client-side. No databases to manage, no user accounts to maintain, no monthly server costs.
   - Hosted statically on Vercel, Cloudflare Pages, or GitHub Pages.
   - Anyone opening the link gets their own private, independent experience.
2. **Local-First & Offline Capable:**
   - All state (completion history, muscle balance tracking, custom settings) is stored in `localStorage`.
   - PWA service worker caches core assets so workouts run flawlessly even without internet.
3. **The 15-Minute "Golden Rule":**
   - Every workout is strictly timed to ~15 minutes total: Warm-up → Main Circuit → Cool-down.
4. **Mobile & Mat Friendly:**
   - Fullscreen runner with high contrast.
   - Screen Wake Lock keeps the phone screen awake mid-exercise.
   - Native Web Audio API generates audio countdowns (no external audio files to download).

---

## 2. Technology Stack

| Layer                      | Technology                    | Rationale                                                                                   |
| :------------------------- | :---------------------------- | :------------------------------------------------------------------------------------------ |
| **Build Tool & Framework** | **Vite + React (TypeScript)** | Extremely lightweight, sub-second HMR, small bundle size, no Next.js SSR/server bloat.      |
| **Styling**                | **Tailwind CSS**              | Rapid mobile-first responsive layout, dark-mode first, zero runtime styling overhead.       |
| **Icons**                  | **Lucide React**              | Feather-light SVG icons for controls, status, and navigation.                               |
| **Audio Engine**           | **Web Audio API** (Native)    | Synthesizes clean 440Hz countdown pips and 880Hz completion chimes without external assets. |
| **Screen Control**         | **Screen Wake Lock API**      | Keeps device display on during active workout sessions.                                     |
| **Storage**                | **`localStorage`**            | Simple, synchronous, zero-dependency persistence for workout history and preferences.       |

---

## 3. The 4-Pillar Muscle & Zone Model

To prevent the common pitfall of bodyweight routines over-indexing on push-ups and neglecting pulling/posture movements, the app organizes all exercises into **4 balanced pillars**:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Upper Body (Push)                                        │
│    Target: Chest, Triceps, Anterior Deltoids                │
│    Key Moves: Push-up variations, Pike push-ups, Dips       │
├─────────────────────────────────────────────────────────────┤
│ 2. Back & Posture (Pull)                                    │
│    Target: Lats, Rhomboids, Traps, Rear Delts, Lower Back   │
│    Key Moves: Supermans, Swimmers, Prone Y-T-W, Doorframe   │
│               Rows, Scapular Retractions, Reverse Angels     │
├─────────────────────────────────────────────────────────────┤
│ 3. Lower Body                                               │
│    Target: Quads, Hamstrings, Glutes, Calves                │
│    Key Moves: Squats, Lunges, Glute Bridges, Calf Raises    │
├─────────────────────────────────────────────────────────────┤
│ 4. Core & Pelvic Stability                                  │
│    Target: Rectus Abdominis, Obliques, Transverse Abdominis │
│    Key Moves: Planks, Side Planks, Mountain Climbers, Hallows│
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Exercise Data Pipeline (`free-exercise-db`)

### Source & Structure

Data is extracted once from [free-exercise-db](https://github.com/yuhonas/free-exercise-db) and saved directly in the project repository:

- Data catalog: `src/data/exercises.json`
- 2-Step images: `public/exercises/{exercise-id}/0.jpg` and `1.jpg`

### Target Curated Dataset (~140 Exercises Total)

1. **Warm-Up (~20 exercises):**
   - Category: Dynamic mobility & stretching.
   - Focus: Joint lubrication and heart-rate elevation (arm circles, torso twists, high knees, inchworms, hip openers, cat-cow).
2. **Main Movements (~100 exercises):**
   - Divided across the 4 pillars:
     - ~25 Upper Push
     - ~25 Back & Posture
     - ~25 Lower Body
     - ~25 Core & Stability
3. **Cool-Down (~20 exercises):**
   - Category: Static stretching.
   - Focus: Muscle recovery and down-regulation (child's pose, cobra, hamstring reach, quad stretch, chest stretch, pigeon pose).

### TypeScript Schema (Designed for Future Equipment Expansion)

```ts
export type MusclePillar = 'push' | 'pull_back' | 'legs' | 'core';
export type ExerciseCategory = 'warmup' | 'main' | 'cooldown';
export type EquipmentType =
  | 'body only'
  | 'dumbbell'
  | 'pull-up bar'
  | 'resistance bands';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  pillar?: MusclePillar; // Defined for 'main' exercises
  primaryMuscles: string[]; // e.g., ["lats", "middle back"]
  secondaryMuscles: string[];
  equipment: EquipmentType; // "body only" for v1; ready for filter additions later
  level: 'beginner' | 'intermediate' | 'expert';
  type: 'time' | 'reps';
  defaultDuration?: number; // e.g. 35s
  defaultReps?: number; // e.g. 15
  instructions: string[];
  images: [string, string]; // ["/exercises/pushup/0.jpg", "/exercises/pushup/1.jpg"]
}
```

> **Future Equipment Note:**
> The `equipment` attribute is preserved on all records. When equipment like dumbbells, pull-up bars, or bands are added in future iterations, a simple user filter setting (`equipmentPreferences: string[]`) will unlock those exercises without altering the core database structure.

---

## 5. The 15-Minute Workout Structure

Total duration: **Exactly 15 Minutes (900 seconds)**

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: DYNAMIC WARM-UP (~2.5 Minutes / 150s)              │
│ • 4 targeted mobility movements (30s work + 7.5s prep each) │
│ • Specific to today's muscle focus                          │
├─────────────────────────────────────────────────────────────┤
│ PHASE 2: MAIN CIRCUIT (~10.0 Minutes / 600s)                │
│ • 2 Rounds of 5 Exercises (10 sets total)                   │
│ • Interval: 45s Work / 15s Rest & Transition                │
│ • Balance: Structured across primary target pillar + combo  │
├─────────────────────────────────────────────────────────────┤
│ PHASE 3: STATIC COOL-DOWN (~2.5 Minutes / 150s)             │
│ • 4 deep recovery stretches (30s hold + 7.5s transition)    │
│ • Emphasizes the muscle zones worked today                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Recommendation Algorithm (Progress-Driven)

The app prioritizes whole-body health by maintaining muscle balance over time:

1. **Workout History in `localStorage`:**
   ```json
   [
     {
       "id": "workout-2026-09-09-01",
       "date": "2026-09-09T18:30:00Z",
       "primaryPillar": "push",
       "completed": true,
       "totalTimeSeconds": 900
     }
   ]
   ```
2. **Next-Up Determination:**
   - Reads history of completed workouts.
   - Determines which of the 4 pillars (`push`, `pull_back`, `legs`, `core`) has been rested the longest.
   - If the user missed several days, defaults to a **Full Body Balancing** routine.
   - Generates or selects today's recommended workout targeting that underserved pillar.

---

## 7. Fullscreen Workout Runner UX

- **Visual Toggle Animation:**
  - Displays `0.jpg` and `1.jpg`, toggling between them every 1.0 to 1.2 seconds to produce a clear looping animation of the movement.
- **Auto-Advance & Web Audio Countdown:**
  - For timed exercises:
    - Displays a countdown ring / big digital seconds display.
    - At `5, 4, 3, 2, 1` seconds remaining: Emits crisp, short `440Hz` sine-wave beeps.
    - At `0` seconds: Emits an uplifting `880Hz` dual-tone chime and auto-advances to the next exercise or rest step.
  - For rep exercises:
    - Displays the target reps with a giant fullscreen tap area to advance.
- **Screen Wake Lock:**
  - Requests `navigator.wakeLock.request('screen')` on workout start to prevent phone sleep during holds (e.g. planks).
- **Controls:**
  - Prominent Pause/Resume toggle.
  - Skip step button.
  - Phase progress indicator (Warm-up [Green] → Main [Blue] → Cool-down [Purple]).

---

## 8. Screen Flow & UI Views

1. **Start Screen:**
   - **Today's Daily Recommendation Card:** Large card highlighting today's workout (e.g., _"15-Min Back & Posture Shield"_, reason: _"Balances yesterday's Upper Push"_). Big **"Start Workout"** button.
   - **Workout Grid:** Grid of all available workouts categorized by pillar (Push, Back/Pull, Legs, Core, Full Body, Mobility).
   - **Streak & Activity Pill Bar:** Visual indicator of recent activity.
2. **Active Fullscreen Runner:**
   - Immersive distraction-free layout.
   - Exercise title, target muscles, 2-step animated illustration, timer/reps, next-up preview.
3. **Completion Screen:**
   - Celebration animation (confetti / congratulatory checkmark).
   - Stats summary (15 minutes completed, muscle areas stimulated).
   - One-tap return to home.

---

## 9. Implementation Roadmap

- [ ] **Step 1: Project Initialization**
  - Initialize Vite + React + TypeScript in `/Users/manuel.lippmann/Development/the-daily-workout`.
  - Configure Tailwind CSS and Lucide React.
- [ ] **Step 2: Data Extraction & Asset Preparation**
  - Script/fetch curated ~140 exercises and their 2-step images from `free-exercise-db`.
  - Organize into `src/data/exercises.json` and `public/exercises/`.
- [ ] **Step 3: Audio & Wake-Lock Utilities**
  - Build `audio.ts` (Web Audio API 5-second countdown beeps and completion chime).
  - Build `useWakeLock.ts` hook.
- [ ] **Step 4: Workout Generation & Logic Engine**
  - Implement 15-minute workout templates (Warmup + Main + Cooldown).
  - Implement history logging and next-pillar recommendation engine in `src/utils/recommendation.ts`.
- [ ] **Step 5: Fullscreen Workout Runner Component**
  - 2-step image toggling animation.
  - Timer state machine with auto-advance and countdown sounds.
  - Large tap-to-advance handling for rep sets.
- [ ] **Step 6: Start Screen & Set Browser**
  - Hero card for Daily Recommended workout.
  - Grid browser for all sets.
  - Completion modal/screen.
- [ ] **Step 7: PWA Setup & Polish**
  - Add `manifest.json` and basic offline caching for mobile home-screen install.
