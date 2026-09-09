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
