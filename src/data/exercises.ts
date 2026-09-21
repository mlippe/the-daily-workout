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
  'Triceps_Stretch',
  'Shoulder_Stretch',
  'Side_Neck_Stretch',
  'Middle_Back_Stretch',
  'Side-Lying_Floor_Stretch',
  'All_Fours_Quad_Stretch',
  'Seated_Floor_Hamstring_Stretch',
  'Calf_Stretch_Hands_Against_Wall',
  'Knee_Across_The_Body',
  'On_Your_Side_Quad_Stretch',
  'Ankle_On_The_Knee',
  '90_90_Hamstring',
  'Standing_Gastrocnemius_Calf_Stretch',
  'Leg-Up_Hamstring_Stretch',
  'Worlds_Greatest_Stretch',
  'Standing_Hip_Circles',
  'Front_Leg_Raises',
  'Ankle_Circles',
  'Hip_Circles_prone',
]);

export const isTwoSidedExercise = (exerciseOrId?: Exercise | string | null): boolean => {
  if (!exerciseOrId) return false;
  if (typeof exerciseOrId === 'string') {
    return TWO_SIDED_EXERCISE_IDS.has(exerciseOrId);
  }
  return Boolean(exerciseOrId.isTwoSided || TWO_SIDED_EXERCISE_IDS.has(exerciseOrId.id));
};

