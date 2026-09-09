import type { Exercise, MusclePillar } from './exercise';

export type WorkoutPhase = 'warmup' | 'main' | 'cooldown';

export interface WorkoutStep {
  id: string;
  exercise: Exercise;
  phase: WorkoutPhase;
  round?: number; // Round 1 or 2 for main circuit
  workDurationSeconds: number; // 30s for warmup/cooldown, 45s for main
  restDurationSeconds: number; // 7.5s for warmup/cooldown, 15s for main
  targetReps?: number;
}

export type WorkoutPillarFocus = MusclePillar | 'full_body';

export interface WorkoutPlan {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  primaryPillar: WorkoutPillarFocus;
  targetMuscles: string[];
  totalDurationSeconds: number; // Strictly 900 seconds (15 minutes)
  steps: WorkoutStep[];
}

export interface WorkoutHistoryEntry {
  id: string;
  date: string; // ISO 8601
  workoutId: string;
  workoutTitle: string;
  primaryPillar: WorkoutPillarFocus;
  completed: boolean;
  totalTimeSeconds: number;
}
