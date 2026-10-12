import rawExercises from './exercises.json';
import type { Exercise, MusclePillar, ExerciseCategory } from '../types/exercise';

export const exercises: Exercise[] = rawExercises as Exercise[];

export const getExercisesByCategory = (category: ExerciseCategory): Exercise[] => {
  return exercises.filter((ex) => ex.category === category);
};

export const getExercisesByPillar = (pillar: MusclePillar): Exercise[] => {
  return exercises.filter((ex) => ex.category === 'main' && ex.pillar === pillar);
};

export const getExerciseById = (id: string): Exercise | undefined => {
  return exercises.find((ex) => ex.id === id);
};

export const TWO_SIDED_EXERCISE_IDS = new Set<string>([
  // Warmup unilateral
  'Standing_Hip_Circles',
  'Hip_Circles_prone',
  'Front_Leg_Raises',
  'Ankle_Circles',
  'Knee_Circles',
  'Worlds_Greatest_Stretch',

  // Main circuit unilateral
  'Single_Leg_Glute_Bridge',
  'Side_Bridge',
  'Glute_Kickback',
  'Rear_Leg_Raises',
  'Side_Leg_Raises',
  'Split_Squats',
  'Single-Arm_Push-Up',
  'One_Arm_Against_Wall',
  'Side_Jackknife',
  'Step-up_with_Knee_Raise',
  'Cross-Body_Crunch',

  // Cooldown unilateral
  'Triceps_Stretch',
  'Shoulder_Stretch',
  'Side_Neck_Stretch',
  'Middle_Back_Stretch',
  'Side-Lying_Floor_Stretch',
  'All_Fours_Quad_Stretch',
  'On_Your_Side_Quad_Stretch',
  'Seated_Floor_Hamstring_Stretch',
  'Calf_Stretch_Hands_Against_Wall',
  'Calf_Stretch_Elbows_Against_Wall',
  'Knee_Across_The_Body',
  'Ankle_On_The_Knee',
  '90_90_Hamstring',
  'Standing_Gastrocnemius_Calf_Stretch',
  'Leg-Up_Hamstring_Stretch',
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

