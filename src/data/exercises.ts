import rawExercises from './exercises.json';
import type { Exercise, MusclePillar, ExerciseCategory } from '../types/exercise';

/**
 * Hand-checked corrections on top of the generated free-exercise-db data.
 * Kept here (not in exercises.json) so re-running scripts/curate-exercises.mjs
 * does not silently undo them.
 */
const EXERCISE_OVERRIDES: Record<string, Partial<Exercise>> = {
  // Isometric holds must be timed, not counted
  Plank: { type: 'time', defaultDuration: 30, defaultReps: undefined },
  Side_Bridge: {
    type: 'time',
    defaultDuration: 30,
    defaultReps: undefined,
    instructions: [
      'Lie on your side with your forearm on the floor, elbow directly under your shoulder, legs stacked.',
      'Lift your hips until your body forms a straight line from head to feet.',
      'Brace your core and hold without letting your hips sag or rotate.',
      'Lower with control.',
    ],
  },
  // Counted movements that were mislabeled as timed
  Superman: { type: 'reps', defaultReps: 10 },
  Lower_Back_Curl: { type: 'reps', defaultReps: 10, primaryMuscles: ['lower back'] },
  Rear_Leg_Raises: {
    type: 'reps',
    defaultReps: 10,
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hamstrings'],
  },
  // Photo and instructions show standing pendulum leg swings (warmup mobility)
  Side_Leg_Raises: {
    category: 'warmup',
    type: 'time',
    defaultDuration: 25,
    primaryMuscles: ['abductors', 'adductors'],
  },
  // Core drill whose primary muscle in free-exercise-db was tagged as quadriceps
  Mountain_Climbers: {
    primaryMuscles: ['abdominals'],
    secondaryMuscles: ['shoulders', 'quadriceps'],
  },
  // Reverse lunge with rotation – used as a main unilateral lunge
  Crossover_Reverse_Lunge: { category: 'main', pillar: 'legs', type: 'reps', defaultReps: 10 },
  // Source entry is a plyometric jump lunge, not a static split squat
  Split_Squats: { name: 'Jumping Split Squats', primaryMuscles: ['quadriceps'] },
  // Stretches that were grouped into main/pull_back in free-exercise-db
  Cat_Stretch: { category: 'cooldown' },
  Hug_Knees_To_Chest: { category: 'cooldown' },
  Upper_Back_Stretch: { category: 'cooldown' },
  Middle_Back_Stretch: { category: 'cooldown' },
  One_Arm_Against_Wall: { category: 'cooldown' },
  'Side-Lying_Floor_Stretch': { category: 'cooldown' },
  // Rear-delt posture exercises train upper-back retractors and external rotators
  'Seated_Bent-Over_Rear_Delt_Raise': { pillar: 'pull_back' },
  Reverse_Flyes: { pillar: 'pull_back' },
  Reverse_Flyes_With_External_Rotation: { pillar: 'pull_back' },
};

export const exercises: Exercise[] = (rawExercises as Exercise[]).map((ex) =>
  EXERCISE_OVERRIDES[ex.id] ? { ...ex, ...EXERCISE_OVERRIDES[ex.id] } : ex,
);

export const getExercisesByCategory = (category: ExerciseCategory): Exercise[] => {
  return exercises.filter((ex) => ex.category === category);
};

// Fallback pool restricted to home gear (bodyweight + dumbbells)
export const getExercisesByPillar = (pillar: MusclePillar): Exercise[] => {
  return exercises.filter(
    (ex) =>
      ex.category === 'main' &&
      ex.pillar === pillar &&
      (ex.equipment === 'body only' || ex.equipment === 'dumbbell'),
  );
};

export const getExerciseById = (id: string): Exercise | undefined => {
  return exercises.find((ex) => ex.id === id);
};

export const TWO_SIDED_EXERCISE_IDS = new Set<string>([
  // Two-sided = performed fully on one side, then the other (split into Right/Left steps).
  // Alternating movements (walking lunge, cross-body crunch, jump lunge, hammer curl)
  // and bilateral movements (knee circles, elbows-against-wall calf stretch) do NOT belong here.

  // Warmup unilateral
  'Standing_Hip_Circles',
  'Hip_Circles_prone',
  'Front_Leg_Raises',
  'Side_Leg_Raises',
  'Ankle_Circles',
  'Worlds_Greatest_Stretch',

  // Main circuit unilateral
  'Single_Leg_Glute_Bridge',
  'Side_Bridge',
  'Glute_Kickback',
  'Rear_Leg_Raises',
  'Single-Arm_Push-Up',
  'Side_Jackknife',
  'Step-up_with_Knee_Raise',
  'Leg_Lift',
  'Dumbbell_Step_Ups',
  'Split_Squat_with_Dumbbells',
  'Dumbbell_Lunges',
  'Dumbbell_Rear_Lunge',
  'One-Arm_Dumbbell_Row',
  'Elbow_to_Knee',
  'Oblique_Crunches_-_On_The_Floor',

  // Cooldown unilateral
  'One_Arm_Against_Wall',
  'Kneeling_Hip_Flexor',
  'Triceps_Stretch',
  'Tricep_Side_Stretch',
  'Shoulder_Stretch',
  'Side_Wrist_Pull',
  'Side_Neck_Stretch',
  'Middle_Back_Stretch',
  'Side-Lying_Floor_Stretch',
  'Standing_Lateral_Stretch',
  'Dancers_Stretch',
  'All_Fours_Quad_Stretch',
  'On_Your_Side_Quad_Stretch',
  'Seated_Floor_Hamstring_Stretch',
  'Calf_Stretch_Hands_Against_Wall',
  'Knee_Across_The_Body',
  'One_Knee_To_Chest',
  'Ankle_On_The_Knee',
  '90_90_Hamstring',
  'Standing_Gastrocnemius_Calf_Stretch',
  'Leg-Up_Hamstring_Stretch',
  'Seated_Calf_Stretch',
  'Lying_Prone_Quadriceps',
  'Seated_Hamstring',
  'Lying_Glute',
  'Seated_Glute',
  'Overhead_Triceps',
  'Seated_Front_Deltoid',
]);

export const isTwoSidedExercise = (exerciseOrId?: Exercise | string | null): boolean => {
  if (!exerciseOrId) return false;
  if (typeof exerciseOrId === 'string') {
    return TWO_SIDED_EXERCISE_IDS.has(exerciseOrId);
  }
  return Boolean(exerciseOrId.isTwoSided || TWO_SIDED_EXERCISE_IDS.has(exerciseOrId.id));
};

