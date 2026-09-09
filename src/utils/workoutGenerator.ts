import type { Exercise, MusclePillar } from '../types/exercise';
import type { WorkoutPlan, WorkoutStep, WorkoutPillarFocus } from '../types/workout';
import { exercises, getExerciseById, getExercisesByCategory, getExercisesByPillar } from '../data/exercises';

function findOrFallback(id: string, fallbackCategory: 'warmup' | 'main' | 'cooldown', pillar?: MusclePillar): Exercise {
  const found = getExerciseById(id);
  if (found) return found;

  const pool = pillar ? getExercisesByPillar(pillar) : getExercisesByCategory(fallbackCategory);
  if (pool.length > 0) return pool[0];
  return exercises[0];
}

function buildStep(exercise: Exercise, phase: 'warmup' | 'main' | 'cooldown', round?: number, stepIdx = 0): WorkoutStep {
  const isMain = phase === 'main';
  return {
    id: `${phase}-${round ? `r${round}-` : ''}${exercise.id}-${stepIdx}`,
    exercise,
    phase,
    round,
    workDurationSeconds: isMain ? 60 : stepIdx % 2 === 0 ? 38 : 37,
    restDurationSeconds: 0,
    targetReps: exercise.type === 'reps' ? (exercise.defaultReps ?? 12) : undefined,
  };
}

export function createWorkoutFromExercises(
  id: string,
  title: string,
  subtitle: string,
  description: string,
  primaryPillar: WorkoutPillarFocus,
  warmupIds: string[],
  mainIds: [string, string, string, string, string],
  cooldownIds: string[]
): WorkoutPlan {
  const warmupExercises = warmupIds.map((eid) => findOrFallback(eid, 'warmup'));
  const mainExercises = mainIds.map((eid) => findOrFallback(eid, 'main'));
  const cooldownExercises = cooldownIds.map((eid) => findOrFallback(eid, 'cooldown'));

  const steps: WorkoutStep[] = [];

  // Phase 1: 4 Warm-up movements (4 * 37.5s = 150s)
  warmupExercises.slice(0, 4).forEach((ex, idx) => {
    steps.push(buildStep(ex, 'warmup', undefined, idx));
  });

  // Phase 2: Main Circuit (2 rounds of 5 exercises: 10 * 60s = 600s)
  for (let round = 1; round <= 2; round++) {
    mainExercises.slice(0, 5).forEach((ex, idx) => {
      steps.push(buildStep(ex, 'main', round, idx));
    });
  }

  // Phase 3: 4 Cool-down stretches (4 * 37.5s = 150s)
  cooldownExercises.slice(0, 4).forEach((ex, idx) => {
    steps.push(buildStep(ex, 'cooldown', undefined, idx));
  });

  const targetMuscles = Array.from(
    new Set(steps.flatMap((s) => s.exercise.primaryMuscles))
  );

  return {
    id,
    title,
    subtitle,
    description,
    primaryPillar,
    targetMuscles,
    totalDurationSeconds: 900, // Exactly 15 minutes
    steps,
  };
}

// 5 Curated Core Workouts
export const WORKOUT_PUSH: WorkoutPlan = createWorkoutFromExercises(
  'workout-push-chest',
  'Upper Body Push & Chest',
  'Build chest, tricep, and shoulder strength',
  'A muscle-toning circuit focused on pressing strength, push-up variations, and shoulder stability.',
  'push',
  ['Arm_Circles', 'Dynamic_Chest_Stretch', 'Elbow_Circles', 'Inchworm'],
  ['Pushups', 'Bench_Dips', 'Plank', 'Incline_Push-Up', 'Butt_Lift_Bridge'],
  ['Overhead_Triceps', 'Shoulder_Stretch', 'Childs_Pose', 'Cat_Stretch']
);

export const WORKOUT_PULL_BACK: WorkoutPlan = createWorkoutFromExercises(
  'workout-pull-back',
  'Back & Posture Shield',
  'Strengthen posture muscles and reverse desk slouch',
  'Combats rounded shoulders and back tightness by strengthening your lats, rhomboids, and lower back.',
  'pull_back',
  ['Arm_Circles', 'Dynamic_Back_Stretch', 'Shoulder_Circles', 'Cat_Stretch'],
  ['Superman', 'Pelvic_Tilt_Into_Bridge', 'Hyperextensions_With_No_Hyperextension_Bench', 'Dead_Bug', 'Push_Up_to_Side_Plank'],
  ['Childs_Pose', 'Middle_Back_Stretch', 'Upper_Back_Stretch', 'Hug_Knees_To_Chest']
);

export const WORKOUT_LEGS: WorkoutPlan = createWorkoutFromExercises(
  'workout-lower-legs',
  'Lower Body & Glute Power',
  'Leg endurance, glute activation, and knee stability',
  'A functional lower-body workout targeting quadriceps, hamstrings, glutes, and calves with zero joint impact.',
  'legs',
  ['Standing_Hip_Circles', 'Front_Leg_Raises', 'Groiners', 'Ankle_Circles'],
  ['Bodyweight_Squat', 'Bodyweight_Walking_Lunge', 'Single_Leg_Glute_Bridge', 'Mountain_Climbers', 'Glute_Kickback'],
  ['All_Fours_Quad_Stretch', 'Seated_Floor_Hamstring_Stretch', 'Calf_Stretch_Hands_Against_Wall', 'Adductor_Groin']
);

export const WORKOUT_CORE: WorkoutPlan = createWorkoutFromExercises(
  'workout-core-stability',
  'Core & Pelvic Stability',
  'Build deep abdominal strength and lumbar support',
  'Engages the deep transverse abdominis and obliques while safeguarding your lower back.',
  'core',
  ['Worlds_Greatest_Stretch', 'Inchworm', 'Standing_Hip_Circles', 'Arm_Circles'],
  ['Plank', 'Air_Bike', 'Dead_Bug', 'Russian_Twist', 'Superman'],
  ['Childs_Pose', 'Cat_Stretch', 'Knee_Across_The_Body', 'Seated_Hamstring']
);

export const WORKOUT_FULL_BODY: WorkoutPlan = createWorkoutFromExercises(
  'workout-full-body-reset',
  'Full Body Balancing Reset',
  'Balanced total-body movement across all 4 pillars',
  'An all-round reset working push, pull, legs, and core in harmony. Ideal after rest days or for general fitness.',
  'full_body',
  ['Inchworm', 'Arm_Circles', 'Groiners', 'Dynamic_Chest_Stretch'],
  ['Bodyweight_Squat', 'Pushups', 'Superman', 'Plank', 'Bodyweight_Walking_Lunge'],
  ['Childs_Pose', 'Seated_Floor_Hamstring_Stretch', 'All_Fours_Quad_Stretch', 'Upper_Back_Stretch']
);

export const ALL_WORKOUT_PLANS: WorkoutPlan[] = [
  WORKOUT_PUSH,
  WORKOUT_PULL_BACK,
  WORKOUT_LEGS,
  WORKOUT_CORE,
  WORKOUT_FULL_BODY,
];

export function getWorkoutById(id: string): WorkoutPlan {
  const found = ALL_WORKOUT_PLANS.find((w) => w.id === id);
  return found || WORKOUT_FULL_BODY;
}

export function applyTargetRepsToWorkout(workout: WorkoutPlan, targetReps: number): WorkoutPlan {
  return {
    ...workout,
    steps: workout.steps.map((step) => ({
      ...step,
      targetReps: step.exercise.type === 'reps' ? targetReps : undefined,
    })),
  };
}

