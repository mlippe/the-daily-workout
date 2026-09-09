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
    workDurationSeconds: isMain ? 60 : 30,
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

  // Phase 1: 4 Warm-up movements (4 * 30s = 120s)
  warmupExercises.slice(0, 4).forEach((ex, idx) => {
    steps.push(buildStep(ex, 'warmup', undefined, idx));
  });

  // Phase 2: Main Circuit (2 rounds of 5 exercises: 10 * 60s = 600s)
  for (let round = 1; round <= 2; round++) {
    mainExercises.slice(0, 5).forEach((ex, idx) => {
      steps.push(buildStep(ex, 'main', round, idx));
    });
  }

  // Phase 3: 4 Cool-down stretches (4 * 30s = 120s)
  cooldownExercises.slice(0, 4).forEach((ex, idx) => {
    steps.push(buildStep(ex, 'cooldown', undefined, idx));
  });

  const targetMuscles = Array.from(
    new Set(steps.flatMap((s) => s.exercise.primaryMuscles))
  );

  const totalDurationSeconds = steps.reduce((acc, s) => acc + s.workDurationSeconds, 0);

  return {
    id,
    title,
    subtitle,
    description,
    primaryPillar,
    targetMuscles,
    totalDurationSeconds,
    steps,
  };
}

// ==========================================
// 1. Upper Body Push Variations (Single-Only)
// ==========================================
export const WORKOUT_PUSH_1: WorkoutPlan = createWorkoutFromExercises(
  'workout-push-chest',
  'Upper Body Push & Chest',
  'Build chest, tricep, and shoulder strength',
  'A muscle-toning circuit focused on pressing strength, push-up variations, and shoulder stability.',
  'push',
  ['Arm_Circles', 'Dynamic_Chest_Stretch', 'Elbow_Circles', 'Inchworm'],
  ['Pushups', 'Bench_Dips', 'Incline_Push-Up', 'Push_Up_to_Side_Plank', 'Push-Ups_-_Close_Triceps_Position'],
  ['Triceps_Stretch', 'Shoulder_Stretch', 'Childs_Pose', 'Cat_Stretch']
);

export const WORKOUT_PUSH_2: WorkoutPlan = createWorkoutFromExercises(
  'workout-push-triceps',
  'Triceps & Lockout Power',
  'Target triceps extension and front deltoid definition',
  'Isolates upper arm pressing muscles, tricep burn, and shoulder stability without weights.',
  'push',
  ['Shoulder_Circles', 'Arm_Circles', 'Wrist_Circles', 'Inchworm'],
  ['Bench_Dips', 'Push-Ups_-_Close_Triceps_Position', 'Incline_Push-Up_Close-Grip', 'Body_Tricep_Press', 'Pushups'],
  ['Triceps_Stretch', 'Shoulder_Stretch', 'Childs_Pose', 'Side_Neck_Stretch']
);

export const WORKOUT_PUSH_3: WorkoutPlan = createWorkoutFromExercises(
  'workout-push-wide-chest',
  'Chest Expansion & Wide Press',
  'Emphasize chest fibers, wide angles, and core bracing',
  'Focuses on pectoral stretching and contracting through wide and tempo pressing movements.',
  'push',
  ['Dynamic_Chest_Stretch', 'Elbow_Circles', 'Arm_Circles', 'Worlds_Greatest_Stretch'],
  ['Push-Up_Wide', 'Incline_Push-Up_Wide', 'Clock_Push-Up', 'Pushups_Close_and_Wide_Hand_Positions', 'Bench_Dips'],
  ['Shoulder_Stretch', 'Triceps_Stretch', 'Childs_Pose', 'Upper_Back_Stretch']
);

export const WORKOUT_PUSH_4: WorkoutPlan = createWorkoutFromExercises(
  'workout-push-elevation',
  'Incline & Dynamic Push Power',
  'Multi-angle upper and lower chest conditioning',
  'Alternates incline and decline angles to develop balanced shoulder and pectoral strength.',
  'push',
  ['Arm_Circles', 'Inchworm', 'Shoulder_Circles', 'Dynamic_Chest_Stretch'],
  ['Decline_Push-Up', 'Incline_Push-Up', 'Pushups', 'Bench_Dips', 'Push_Up_to_Side_Plank'],
  ['Triceps_Stretch', 'Shoulder_Stretch', 'Childs_Pose', 'Cat_Stretch']
);

// ==========================================
// 2. Back & Posture (Pull) Variations (Single-Only)
// ==========================================
export const WORKOUT_PULL_1: WorkoutPlan = createWorkoutFromExercises(
  'workout-pull-posture',
  'Back & Posture Shield',
  'Strengthen posture muscles and reverse desk slouch',
  'Combats rounded shoulders and back tightness by strengthening your lats, rhomboids, and lower back.',
  'pull_back',
  ['Arm_Circles', 'Dynamic_Back_Stretch', 'Shoulder_Circles', 'Cat_Stretch'],
  ['Superman', 'Pelvic_Tilt_Into_Bridge', 'Butt_Lift_Bridge', 'Spinal_Stretch', 'Push_Up_to_Side_Plank'],
  ['Childs_Pose', 'Middle_Back_Stretch', 'Upper_Back_Stretch', 'Hug_Knees_To_Chest']
);

export const WORKOUT_PULL_2: WorkoutPlan = createWorkoutFromExercises(
  'workout-pull-lumbar',
  'Lumbar & Erector Spine Support',
  'Lower back health, posterior chain, and spinal decompress',
  'Reinforces the spinal erectors and glute-lumbar connection for pain-free posture.',
  'pull_back',
  ['Cat_Stretch', 'Shoulder_Circles', 'Dynamic_Back_Stretch', 'Standing_Hip_Circles'],
  ['Superman', 'Lower_Back_Curl', 'Pelvic_Tilt_Into_Bridge', 'Butt_Lift_Bridge', 'Chair_Lower_Back_Stretch'],
  ['Childs_Pose', 'Hug_Knees_To_Chest', 'Middle_Back_Stretch', 'Side-Lying_Floor_Stretch']
);

export const WORKOUT_PULL_3: WorkoutPlan = createWorkoutFromExercises(
  'workout-pull-scapular',
  'Scapular & Rhomboid Tone',
  'Upper back retraction and shoulder girdle stability',
  'Activates middle back, rear delts, and thoracic spine to pull shoulders back naturally.',
  'pull_back',
  ['Shoulder_Circles', 'Arm_Circles', 'Dynamic_Back_Stretch', 'Cat_Stretch'],
  ['Superman', 'One_Arm_Against_Wall', 'Standing_Pelvic_Tilt', 'Butt_Lift_Bridge', 'Upper_Back-Leg_Grab'],
  ['Upper_Back_Stretch', 'Middle_Back_Stretch', 'Childs_Pose', 'Side_Neck_Stretch']
);

export const WORKOUT_PULL_4: WorkoutPlan = createWorkoutFromExercises(
  'workout-pull-mobility',
  'Posterior Chain Mobility & Flow',
  'Relieve spinal compression and tone posterior muscles',
  'A flowing back circuit designed to release tight fascia while building enduring posture strength.',
  'pull_back',
  ['Dynamic_Back_Stretch', 'Cat_Stretch', 'Standing_Hip_Circles', 'Arm_Circles'],
  ['Pelvic_Tilt_Into_Bridge', 'Superman', 'Side-Lying_Floor_Stretch', 'Butt_Lift_Bridge', 'Spinal_Stretch'],
  ['Childs_Pose', 'Hug_Knees_To_Chest', 'Upper_Back_Stretch', 'Chin_To_Chest_Stretch']
);

// ==========================================
// 3. Lower Body (Legs) Variations (Single-Only)
// ==========================================
export const WORKOUT_LEGS_1: WorkoutPlan = createWorkoutFromExercises(
  'workout-legs-power',
  'Lower Body & Glute Power',
  'Leg endurance, glute activation, and knee stability',
  'A functional lower-body workout targeting quadriceps, hamstrings, glutes, and calves with zero joint impact.',
  'legs',
  ['Standing_Hip_Circles', 'Front_Leg_Raises', 'Groiners', 'Ankle_Circles'],
  ['Bodyweight_Squat', 'Bodyweight_Walking_Lunge', 'Single_Leg_Glute_Bridge', 'Glute_Kickback', 'Leg_Lift'],
  ['All_Fours_Quad_Stretch', 'Seated_Floor_Hamstring_Stretch', 'Calf_Stretch_Hands_Against_Wall', 'Knee_Across_The_Body']
);

export const WORKOUT_LEGS_2: WorkoutPlan = createWorkoutFromExercises(
  'workout-legs-glutes',
  'Glute Sculpt & Hip Abduction',
  'Gluteus medius, hip stabilizer, and pelvic control',
  'Isolates glute activation, lateral hip power, and pelvis alignment to relieve hip flexor tightness.',
  'legs',
  ['Standing_Hip_Circles', 'Knee_Circles', 'Groiners', 'Front_Leg_Raises'],
  ['Single_Leg_Glute_Bridge', 'Glute_Kickback', 'Side_Leg_Raises', 'Rear_Leg_Raises', 'Bodyweight_Squat'],
  ['On_Your_Side_Quad_Stretch', 'Seated_Floor_Hamstring_Stretch', 'Ankle_On_The_Knee', 'Childs_Pose']
);

export const WORKOUT_LEGS_3: WorkoutPlan = createWorkoutFromExercises(
  'workout-legs-unilateral',
  'Single-Leg Balance & Lunges',
  'Unilateral leg drive, ankle stability, and hip symmetry',
  'Corrects left-right strength imbalances with single-leg lunges, split squats, and glute bridges.',
  'legs',
  ['Ankle_Circles', 'Knee_Circles', 'Standing_Hip_Circles', 'Front_Leg_Raises'],
  ['Bodyweight_Walking_Lunge', 'Split_Squats', 'Single_Leg_Glute_Bridge', 'Step-up_with_Knee_Raise', 'Standing_Hip_Flexors'],
  ['All_Fours_Quad_Stretch', '90_90_Hamstring', 'Standing_Toe_Touches', 'Calf_Stretch_Elbows_Against_Wall']
);

export const WORKOUT_LEGS_4: WorkoutPlan = createWorkoutFromExercises(
  'workout-legs-stamina',
  'Quad Burn & Leg Stamina',
  'Deep squats, explosive drive, and calf endurance',
  'High-volume bodyweight leg training for athletic power, quad hypertrophy, and muscular stamina.',
  'legs',
  ['Fast_Skipping', 'Groiners', 'Ankle_Circles', 'Front_Leg_Raises'],
  ['Bodyweight_Squat', 'Freehand_Jump_Squat', 'Bodyweight_Walking_Lunge', 'Glute_Kickback', 'Sit_Squats'],
  ['Standing_Gastrocnemius_Calf_Stretch', 'Seated_Floor_Hamstring_Stretch', 'All_Fours_Quad_Stretch', 'The_Straddle']
);

// ==========================================
// 4. Core & Stability Variations (Single-Only)
// ==========================================
export const WORKOUT_CORE_1: WorkoutPlan = createWorkoutFromExercises(
  'workout-core-stability',
  'Core & Pelvic Stability',
  'Build deep abdominal strength and lumbar support',
  'Engages the deep transverse abdominis and obliques while safeguarding your lower back.',
  'core',
  ['Worlds_Greatest_Stretch', 'Inchworm', 'Standing_Hip_Circles', 'Arm_Circles'],
  ['Plank', 'Air_Bike', 'Dead_Bug', 'Russian_Twist', 'Side_Bridge'],
  ['Childs_Pose', 'Cat_Stretch', 'Knee_Across_The_Body', 'All_Fours_Quad_Stretch']
);

export const WORKOUT_CORE_2: WorkoutPlan = createWorkoutFromExercises(
  'workout-core-obliques',
  'Oblique Sculpt & Rotational Control',
  'Side ab definition, lateral bridges, and rotational torso power',
  'Directly sculpts the internal and external obliques for a tapered waist and strong lateral core.',
  'core',
  ['Standing_Hip_Circles', 'Arm_Circles', 'Dynamic_Chest_Stretch', 'Cat_Stretch'],
  ['Side_Bridge', 'Russian_Twist', 'Oblique_Crunches_-_On_The_Floor', 'Cross-Body_Crunch', 'Plank'],
  ['Childs_Pose', 'Knee_Across_The_Body', 'Middle_Back_Stretch', 'Shoulder_Stretch']
);

export const WORKOUT_CORE_3: WorkoutPlan = createWorkoutFromExercises(
  'workout-core-rectus',
  'Abdominal Definition & Burn',
  'Direct upper and lower abdominal burn with zero back strain',
  'Focused anterior core training targeting the six-pack wall through controlled flexion and hollow bracing.',
  'core',
  ['Inchworm', 'Arm_Circles', 'Dynamic_Back_Stretch', 'Cat_Stretch'],
  ['Crunches', 'Reverse_Crunch', 'Air_Bike', 'Flutter_Kicks', 'Dead_Bug'],
  ['Childs_Pose', 'Cat_Stretch', 'Upper_Back_Stretch', 'Seated_Floor_Hamstring_Stretch']
);

export const WORKOUT_CORE_4: WorkoutPlan = createWorkoutFromExercises(
  'workout-core-isometrics',
  'Isometric Hold & Core Shield',
  'Static tension, anti-extension, and hollow endurance',
  'Builds unshakeable core resilience with static planks, bridges, and slow-tempo control.',
  'core',
  ['Worlds_Greatest_Stretch', 'Inchworm', 'Cat_Stretch', 'Shoulder_Circles'],
  ['Plank', 'Side_Bridge', 'Dead_Bug', 'Spider_Crawl', 'Bent-Knee_Hip_Raise'],
  ['Childs_Pose', 'Knee_Across_The_Body', 'All_Fours_Quad_Stretch', 'Shoulder_Stretch']
);

// ==========================================
// 5. Full Body Variations (Single-Only)
// ==========================================
export const WORKOUT_FULL_BODY_1: WorkoutPlan = createWorkoutFromExercises(
  'workout-full-body-reset',
  'Full Body Balancing Reset',
  'Balanced total-body movement across all 4 pillars',
  'An all-round reset working push, pull, legs, and core in harmony. Ideal after rest days or for general fitness.',
  'full_body',
  ['Inchworm', 'Arm_Circles', 'Groiners', 'Dynamic_Chest_Stretch'],
  ['Bodyweight_Squat', 'Pushups', 'Superman', 'Plank', 'Bodyweight_Walking_Lunge'],
  ['Childs_Pose', 'Seated_Floor_Hamstring_Stretch', 'All_Fours_Quad_Stretch', 'Shoulder_Stretch']
);

export const WORKOUT_FULL_BODY_2: WorkoutPlan = createWorkoutFromExercises(
  'workout-full-body-athletic',
  'Athletic Conditioning Circuit',
  'High-energy full-body stamina and functional power',
  'Fast-flowing compound circuit engaging every major muscle group for total metabolic conditioning.',
  'full_body',
  ['Fast_Skipping', 'Groiners', 'Arm_Circles', 'Inchworm'],
  ['Pushups', 'Bodyweight_Squat', 'Mountain_Climbers', 'Dead_Bug', 'Bench_Dips'],
  ['Childs_Pose', 'Calf_Stretch_Hands_Against_Wall', 'Triceps_Stretch', 'Leg-Up_Hamstring_Stretch']
);

export const WORKOUT_FULL_BODY_3: WorkoutPlan = createWorkoutFromExercises(
  'workout-full-body-strength',
  'Strength & Posture Harmony',
  'Pressing strength, posterior chain, and glute tone',
  'Focuses on foundational compound bodyweight movements to build functional total-body strength.',
  'full_body',
  ['Dynamic_Back_Stretch', 'Shoulder_Circles', 'Standing_Hip_Circles', 'Inchworm'],
  ['Incline_Push-Up', 'Superman', 'Single_Leg_Glute_Bridge', 'Side_Bridge', 'Bodyweight_Walking_Lunge'],
  ['Childs_Pose', 'Upper_Back_Stretch', 'Knee_Across_The_Body', 'Triceps_Stretch']
);

export const WORKOUT_FULL_BODY_4: WorkoutPlan = createWorkoutFromExercises(
  'workout-full-body-mobility',
  'Mobility & Core Flow',
  'Low-impact total body mobility, joints, and core',
  'Restorative full-body flow combining low-impact strength, spinal decompression, and deep core work.',
  'full_body',
  ['Worlds_Greatest_Stretch', 'Arm_Circles', 'Cat_Stretch', 'Ankle_Circles'],
  ['Glute_Kickback', 'Bench_Dips', 'Pelvic_Tilt_Into_Bridge', 'Plank', 'Bodyweight_Squat'],
  ['Childs_Pose', 'All_Fours_Quad_Stretch', 'Shoulder_Stretch', 'Seated_Floor_Hamstring_Stretch']
);

// Map of 4 curated variations per category
export const WORKOUT_VARIATIONS_BY_PILLAR: Record<WorkoutPillarFocus, WorkoutPlan[]> = {
  push: [WORKOUT_PUSH_1, WORKOUT_PUSH_2, WORKOUT_PUSH_3, WORKOUT_PUSH_4],
  pull_back: [WORKOUT_PULL_1, WORKOUT_PULL_2, WORKOUT_PULL_3, WORKOUT_PULL_4],
  legs: [WORKOUT_LEGS_1, WORKOUT_LEGS_2, WORKOUT_LEGS_3, WORKOUT_LEGS_4],
  core: [WORKOUT_CORE_1, WORKOUT_CORE_2, WORKOUT_CORE_3, WORKOUT_CORE_4],
  full_body: [WORKOUT_FULL_BODY_1, WORKOUT_FULL_BODY_2, WORKOUT_FULL_BODY_3, WORKOUT_FULL_BODY_4],
};

// Aliases for backwards compatibility
export const WORKOUT_PUSH = WORKOUT_PUSH_1;
export const WORKOUT_PULL_BACK = WORKOUT_PULL_1;
export const WORKOUT_LEGS = WORKOUT_LEGS_1;
export const WORKOUT_CORE = WORKOUT_CORE_1;
export const WORKOUT_FULL_BODY = WORKOUT_FULL_BODY_1;

export const ALL_WORKOUT_PLANS: WorkoutPlan[] = [
  WORKOUT_PUSH_1,
  WORKOUT_PULL_1,
  WORKOUT_LEGS_1,
  WORKOUT_CORE_1,
  WORKOUT_FULL_BODY_1,
];

export const ALL_VARIATIONS: WorkoutPlan[] = Object.values(WORKOUT_VARIATIONS_BY_PILLAR).flat();

export function getWorkoutById(id: string): WorkoutPlan {
  const found = ALL_VARIATIONS.find((w) => w.id === id);
  return found || WORKOUT_FULL_BODY_1;
}

export function getRandomVariation(pillar: WorkoutPillarFocus, excludeId?: string): WorkoutPlan {
  const list = WORKOUT_VARIATIONS_BY_PILLAR[pillar];
  const pool = excludeId ? list.filter((w) => w.id !== excludeId) : list;
  const activePool = pool.length > 0 ? pool : list;
  return activePool[Math.floor(Math.random() * activePool.length)];
}

export function getNextVariation(pillar: WorkoutPillarFocus, currentId?: string): WorkoutPlan {
  const list = WORKOUT_VARIATIONS_BY_PILLAR[pillar];
  if (!currentId) return list[0];
  const idx = list.findIndex((w) => w.id === currentId);
  const nextIdx = (idx + 1) % list.length;
  return list[nextIdx];
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

