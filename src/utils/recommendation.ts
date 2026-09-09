import type { MusclePillar } from '../types/exercise';
import type { WorkoutPlan, WorkoutPillarFocus } from '../types/workout';
import { getWorkoutHistory } from './storage';
import {
  WORKOUT_PUSH,
  WORKOUT_PULL_BACK,
  WORKOUT_LEGS,
  WORKOUT_CORE,
  WORKOUT_FULL_BODY,
} from './workoutGenerator';

export interface RecommendationResult {
  workout: WorkoutPlan;
  reason: string;
  pillarBreakdown: Record<MusclePillar, number>;
  daysSinceLastWorkout: number | null;
}

const PILLAR_WORKOUT_MAP: Record<MusclePillar, WorkoutPlan> = {
  push: WORKOUT_PUSH,
  pull_back: WORKOUT_PULL_BACK,
  legs: WORKOUT_LEGS,
  core: WORKOUT_CORE,
};

const PILLAR_NAMES: Record<MusclePillar, string> = {
  push: 'Upper Body (Push)',
  pull_back: 'Back & Posture (Pull)',
  legs: 'Lower Body',
  core: 'Core & Stability',
};

export function getDailyRecommendation(): RecommendationResult {
  const history = getWorkoutHistory().filter((entry) => entry.completed);

  // Initialize breakdown count of completed workouts
  const pillarBreakdown: Record<MusclePillar, number> = {
    push: 0,
    pull_back: 0,
    legs: 0,
    core: 0,
  };

  // Case 1: First-time user with no history
  if (history.length === 0) {
    return {
      workout: WORKOUT_FULL_BODY,
      reason: 'Welcome! Start with this full-body reset to wake up all major muscle groups.',
      pillarBreakdown,
      daysSinceLastWorkout: null,
    };
  }

  // Count completions in the last 14 days
  const now = new Date().getTime();
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;

  const lastEntry = history[0];
  const lastWorkoutTime = new Date(lastEntry.date).getTime();
  const diffDays = Math.max(0, Math.floor((now - lastWorkoutTime) / (24 * 60 * 60 * 1000)));

  // Calculate days since each pillar was last completed
  const daysSincePillar: Record<MusclePillar, number> = {
    push: 999,
    pull_back: 999,
    legs: 999,
    core: 999,
  };

  history.forEach((h) => {
    const entryTime = new Date(h.date).getTime();
    const entryDaysAgo = Math.floor((now - entryTime) / (24 * 60 * 60 * 1000));

    if (h.primaryPillar !== 'full_body') {
      const p = h.primaryPillar as MusclePillar;
      if (entryDaysAgo < daysSincePillar[p]) {
        daysSincePillar[p] = entryDaysAgo;
      }
      if (now - entryTime <= fourteenDaysMs) {
        pillarBreakdown[p] = (pillarBreakdown[p] || 0) + 1;
      }
    } else {
      // Full body counts slightly toward all
      (['push', 'pull_back', 'legs', 'core'] as MusclePillar[]).forEach((p) => {
        if (entryDaysAgo < daysSincePillar[p]) {
          daysSincePillar[p] = entryDaysAgo;
        }
      });
    }
  });

  // Case 2: Inactivity break (> 3 days since last session)
  if (diffDays >= 4) {
    return {
      workout: WORKOUT_FULL_BODY,
      reason: `Welcome back! Re-activate your whole body after ${diffDays} days of rest.`,
      pillarBreakdown,
      daysSinceLastWorkout: diffDays,
    };
  }

  // Case 3: Counter-balance pairing if workout was yesterday or today
  const lastPillar: WorkoutPillarFocus = lastEntry.primaryPillar;
  if (diffDays <= 1) {
    if (lastPillar === 'push') {
      return {
        workout: WORKOUT_PULL_BACK,
        reason: "Balances yesterday's Upper Push with posterior back and posture work.",
        pillarBreakdown,
        daysSinceLastWorkout: diffDays,
      };
    }
    if (lastPillar === 'pull_back') {
      return {
        workout: WORKOUT_LEGS,
        reason: 'Gives your upper back recovery while mobilizing lower body and glutes.',
        pillarBreakdown,
        daysSinceLastWorkout: diffDays,
      };
    }
    if (lastPillar === 'legs') {
      return {
        workout: WORKOUT_CORE,
        reason: 'Rests leg muscles with focused pelvic and spinal stability.',
        pillarBreakdown,
        daysSinceLastWorkout: diffDays,
      };
    }
    if (lastPillar === 'core') {
      return {
        workout: WORKOUT_PUSH,
        reason: 'Builds upper body pushing power with a fresh, stabilized core.',
        pillarBreakdown,
        daysSinceLastWorkout: diffDays,
      };
    }
  }

  // Case 4: Pick the pillar that has been rested the longest
  const pillars: MusclePillar[] = ['push', 'pull_back', 'legs', 'core'];
  pillars.sort((a, b) => {
    // Sort primarily by days rested descending, secondarily by 14-day completion ascending
    if (daysSincePillar[b] !== daysSincePillar[a]) {
      return daysSincePillar[b] - daysSincePillar[a];
    }
    return pillarBreakdown[a] - pillarBreakdown[b];
  });

  const selectedPillar = pillars[0];
  const restedDays = daysSincePillar[selectedPillar];

  return {
    workout: PILLAR_WORKOUT_MAP[selectedPillar],
    reason: restedDays < 999 
      ? `${PILLAR_NAMES[selectedPillar]} hasn't been targeted in ${restedDays} days.`
      : `${PILLAR_NAMES[selectedPillar]} is ready for focus to maintain muscle balance.`,
    pillarBreakdown,
    daysSinceLastWorkout: diffDays,
  };
}
