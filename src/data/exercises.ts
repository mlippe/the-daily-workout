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
