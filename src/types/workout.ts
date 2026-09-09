import type { Exercise, MusclePillar } from './exercise';

export type WorkoutPhase = 'warmup' | 'main' | 'cooldown';

export interface WorkoutStep {
  id: string;
  exercise: Exercise;
  phase: WorkoutPhase;
  round?: number; // Round 1 or 2 for main circuit
  workDurationSeconds: number; // Duration of active exercise
  restDurationSeconds?: number;
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
  totalDurationSeconds: number; // Duration of workout session (seconds)
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
