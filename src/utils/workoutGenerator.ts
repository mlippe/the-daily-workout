import type { Exercise, MusclePillar } from '../types/exercise';
import type { WorkoutPlan, WorkoutStep, WorkoutPillarFocus } from '../types/workout';
import {
  exercises,
  getExerciseById,
  getExercisesByCategory,
  getExercisesByPillar,
  isTwoSidedExercise,
} from '../data/exercises';

function findOrFallback(id: string, fallbackCategory: 'warmup' | 'main' | 'cooldown', pillar?: MusclePillar): Exercise {
  const found = getExerciseById(id);
  if (found) return found;

  const pool = pillar ? getExercisesByPillar(pillar) : getExercisesByCategory(fallbackCategory);
  if (pool.length > 0) return pool[0];
  return exercises[0];
}

/**
 * Calculate adaptive step durations for the main circuit exercises so that
 * the entire workout remains around 15 minutes (warmup 2m + cooldown 2m + main ~10.5-11m).
 *
 * Timed exercises are adjusted specifically to 30s, 45s, or 60s.
 * Rep exercises are estimated based on target reps and allocated budgeted set intervals.
 * When reps increase, timed exercises dynamically downshift (60s -> 45s -> 30s) to compensate.
 */
export function calculateAdaptiveDurations(
  mainExercises: Exercise[],
  targetReps: number = 12
): {
  repDurationSeconds: number;
  timedDurationSeconds: number;
} {
  const repExercises = mainExercises.filter((e) => e.type === 'reps');
  const timedExercises = mainExercises.filter((e) => e.type === 'time');

  const nReps = repExercises.length;
  const nTimed = timedExercises.length;

  // Main circuit target per round: 290s (2 rounds x 290s + 20s rest = 600s, exactly 10 min)
  const targetRoundBudget = 290;

  if (nTimed === 0) {
    // When all 5 exercises are rep-based:
    // Pacing interval scales with reps, clamped between 50s and 66s so total workout never exceeds 15 minutes
    const estimated = Math.round(targetReps * 2.5 + 25);
    const repDuration = Math.min(66, Math.max(50, estimated));
    return {
      repDurationSeconds: repDuration,
      timedDurationSeconds: 0,
    };
  }

  // When there are timed exercises in the main circuit:
  // Estimate time taken by rep exercises: ~2.5s per rep + 20s recovery/transition
  const estimatedRepTime = Math.round(targetReps * 2.5 + 20);
  const totalRepTimeInRound = nReps * estimatedRepTime;
  const remainingForTimed = targetRoundBudget - totalRepTimeInRound;
  const idealTimed = remainingForTimed / nTimed;

  // Discrete options as requested: 30s, 45s, or 60s
  const allowedTimedOptions = [30, 45, 60];
  const timedDuration = allowedTimedOptions.reduce((prev, curr) =>
    Math.abs(curr - idealTimed) < Math.abs(prev - idealTimed) ? curr : prev
  );

  // Compensate by allocating remaining budget to rep exercises (bounded between 40s and 75s)
  const remainingForReps = (targetRoundBudget - nTimed * timedDuration) / nReps;
  const repDuration = Math.max(40, Math.min(75, Math.round(remainingForReps)));

  return {
    repDurationSeconds: repDuration,
    timedDurationSeconds: timedDuration,
  };
}

function buildStepsForExercise(
  exercise: Exercise,
  phase: 'warmup' | 'main' | 'cooldown',
  round?: number,
  stepIdx = 0,
  workDurationSeconds = phase === 'main' ? 45 : 25,
  targetReps?: number
): WorkoutStep[] {
  const isTwoSided = Boolean(exercise.isTwoSided || isTwoSidedExercise(exercise.id));

  if (isTwoSided) {
    // Unilateral exercise: First Right, then Left as separate steps
    const rightExercise: Exercise = {
      ...exercise,
      name: `${exercise.name} (Right)`,
    };
    const leftExercise: Exercise = {
      ...exercise,
      name: `${exercise.name} (Left)`,
    };

    return [
      {
        id: `${phase}-${round ? `r${round}-` : ''}${exercise.id}-right-${stepIdx}`,
        exercise: rightExercise,
        phase,
        round,
        workDurationSeconds,
        restDurationSeconds: 0,
        targetReps: exercise.type === 'reps' ? (targetReps ?? exercise.defaultReps ?? 12) : undefined,
        side: 'right',
        isTwoSided: true,
      },
      {
        id: `${phase}-${round ? `r${round}-` : ''}${exercise.id}-left-${stepIdx}`,
        exercise: leftExercise,
        phase,
        round,
        workDurationSeconds,
        restDurationSeconds: 0,
        targetReps: exercise.type === 'reps' ? (targetReps ?? exercise.defaultReps ?? 12) : undefined,
        side: 'left',
        isTwoSided: true,
      },
    ];
  }

  return [
    {
      id: `${phase}-${round ? `r${round}-` : ''}${exercise.id}-${stepIdx}`,
      exercise,
      phase,
      round,
      workDurationSeconds,
      restDurationSeconds: 0,
      targetReps: exercise.type === 'reps' ? (targetReps ?? exercise.defaultReps ?? 12) : undefined,
    },
  ];
}

export const REST_EXERCISE: Exercise = {
  id: 'rest-inter-round',
  name: 'Rest & Recover',
  category: 'main',
  pillar: 'core',
  primaryMuscles: [],
  secondaryMuscles: [],
  equipment: 'body only',
  level: 'beginner',
  type: 'time',
  defaultDuration: 20,
  instructions: [
    'Take slow, deep diaphragmatic breaths to bring your heart rate down.',
    'Drink a sip of water and shake out tension in your limbs.',
    'Mentally prepare for Round 2.',
  ],
  images: ['/exercises/Cat_Stretch/0.jpg', '/exercises/Cat_Stretch/1.jpg'],
};

export function createRestStep(durationSeconds = 20, afterRound = 1): WorkoutStep {
  return {
    id: `main-r${afterRound}-rest`,
    exercise: REST_EXERCISE,
    phase: 'main',
    round: afterRound,
    workDurationSeconds: durationSeconds,
    restDurationSeconds: 0,
    isRest: true,
  };
}

export function createWorkoutFromExercises(
  id: string,
  title: string,
  subtitle: string,
  description: string,
  primaryPillar: WorkoutPillarFocus,
  warmupIds: string[],
  mainIds: string[],
  cooldownIds: string[]
): WorkoutPlan {
  const warmupExercises = warmupIds.map((eid) => findOrFallback(eid, 'warmup'));
  const mainExercises = mainIds.map((eid) => findOrFallback(eid, 'main', primaryPillar === 'full_body' ? undefined : primaryPillar));
  const cooldownExercises = cooldownIds.map((eid) => findOrFallback(eid, 'cooldown'));

  // 1. Warm-up Phase: Target 150 seconds (~2.5 minutes)
  const preliminaryWarmupSteps = warmupExercises.flatMap((ex, idx) =>
    buildStepsForExercise(ex, 'warmup', undefined, idx, 30)
  );
  const warmupStepDuration = Math.max(15, Math.round(150 / (preliminaryWarmupSteps.length || 1)));
  const warmupSteps = warmupExercises.flatMap((ex, idx) =>
    buildStepsForExercise(ex, 'warmup', undefined, idx, warmupStepDuration)
  );

  // 2. Main Circuit Phase: 2 Rounds + 20s Inter-Round Rest, Target 600 seconds total
  const defaultReps = 12;
  const preliminaryRound1 = mainExercises.flatMap((ex, idx) =>
    buildStepsForExercise(ex, 'main', 1, idx, 45, defaultReps)
  );
  const { repDurationSeconds, timedDurationSeconds } = calculateAdaptiveDurations(
    preliminaryRound1.map((s) => s.exercise),
    defaultReps
  );

  const mainSteps: WorkoutStep[] = [];
  for (let round = 1; round <= 2; round++) {
    mainExercises.forEach((ex, idx) => {
      const duration = ex.type === 'reps' ? repDurationSeconds : timedDurationSeconds;
      const stepsForEx = buildStepsForExercise(ex, 'main', round, idx, duration, defaultReps);
      mainSteps.push(...stepsForEx);
    });
    if (round === 1) {
      // Dedicated 20s rest interval between Round 1 and Round 2
      mainSteps.push(createRestStep(20, 1));
    }
  }

  // 3. Cool-down Phase: Target 150 seconds (~2.5 minutes)
  const preliminaryCooldownSteps = cooldownExercises.flatMap((ex, idx) =>
    buildStepsForExercise(ex, 'cooldown', undefined, idx, 30)
  );
  const cooldownStepDuration = Math.max(15, Math.round(150 / (preliminaryCooldownSteps.length || 1)));
  const cooldownSteps = cooldownExercises.flatMap((ex, idx) =>
    buildStepsForExercise(ex, 'cooldown', undefined, idx, cooldownStepDuration)
  );

  const steps = [...warmupSteps, ...mainSteps, ...cooldownSteps];

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
  ['Dynamic_Chest_Stretch', 'Arm_Circles', 'Shoulder_Circles', 'Wrist_Circles'],
  ['Pushups', 'Incline_Push-Up', 'Push-Up_Wide', 'Pushups_Close_and_Wide_Hand_Positions', 'Isometric_Chest_Squeezes'],
  ['One_Arm_Against_Wall', 'Shoulder_Stretch', 'Triceps_Stretch', 'Side_Neck_Stretch']
);

export const WORKOUT_PUSH_2: WorkoutPlan = createWorkoutFromExercises(
  'workout-push-triceps',
  'Triceps & Lockout Power',
  'Target triceps extension and front deltoid definition',
  'Isolates upper arm pressing muscles, tricep burn, and shoulder stability without weights.',
  'push',
  ['Wrist_Circles', 'Elbow_Circles', 'Arm_Circles', 'Inchworm'],
  ['Bench_Dips', 'Push-Ups_-_Close_Triceps_Position', 'Body_Tricep_Press', 'Incline_Push-Up_Close-Grip', 'Dips_-_Triceps_Version'],
  ['Triceps_Stretch', 'Shoulder_Stretch', 'Side_Neck_Stretch', 'One_Arm_Against_Wall']
);

export const WORKOUT_PUSH_3: WorkoutPlan = createWorkoutFromExercises(
  'workout-push-wide-chest',
  'Chest Expansion & Wide Press',
  'Emphasize chest fibers, wide angles, and core bracing',
  'Focuses on pectoral stretching and contracting through wide and tempo pressing movements.',
  'push',
  ['Dynamic_Chest_Stretch', 'Shoulder_Circles', 'Arm_Circles', 'Inchworm'],
  ['Push-Up_Wide', 'Incline_Push-Up_Wide', 'Push_Up_to_Side_Plank', 'Pushups', 'Isometric_Chest_Squeezes'],
  ['One_Arm_Against_Wall', 'Shoulder_Stretch', 'Triceps_Stretch', 'Childs_Pose']
);

export const WORKOUT_PUSH_4: WorkoutPlan = createWorkoutFromExercises(
  'workout-push-elevation',
  'Incline & Dynamic Push Power',
  'Multi-angle upper and lower chest conditioning',
  'Alternates incline and decline angles to develop balanced shoulder and pectoral strength.',
  'push',
  ['Wrist_Circles', 'Arm_Circles', 'Shoulder_Circles', 'Elbow_Circles'],
  ['Decline_Push-Up', 'Incline_Push-Up', 'Push-Ups_With_Feet_Elevated', 'Clock_Push-Up', 'Bench_Dips'],
  ['Shoulder_Stretch', 'Triceps_Stretch', 'Side_Neck_Stretch', 'One_Arm_Against_Wall']
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
  ['Dynamic_Back_Stretch', 'Cat_Stretch', 'Shoulder_Circles', 'Elbow_Circles'],
  ['Superman', 'Pelvic_Tilt_Into_Bridge', 'Butt_Lift_Bridge', 'Standing_Pelvic_Tilt', 'Lower_Back_Curl'],
  ['Upper_Back_Stretch', 'Middle_Back_Stretch', 'Childs_Pose', 'Side_Neck_Stretch']
);

export const WORKOUT_PULL_2: WorkoutPlan = createWorkoutFromExercises(
  'workout-pull-lumbar',
  'Lumbar & Erector Spine Support',
  'Lower back health, posterior chain, and spinal decompress',
  'Reinforces the spinal erectors and glute-lumbar connection for pain-free posture.',
  'pull_back',
  ['Standing_Hip_Circles', 'Cat_Stretch', 'Dynamic_Back_Stretch', 'Groiners'],
  ['Lower_Back_Curl', 'Superman', 'Pelvic_Tilt_Into_Bridge', 'Single_Leg_Glute_Bridge', 'Butt_Lift_Bridge'],
  ['Hug_Knees_To_Chest', 'Childs_Pose', 'Middle_Back_Stretch', 'Spinal_Stretch']
);

export const WORKOUT_PULL_3: WorkoutPlan = createWorkoutFromExercises(
  'workout-pull-scapular',
  'Scapular & Rhomboid Tone',
  'Upper back retraction and shoulder girdle stability',
  'Activates middle back, rear delts, and thoracic spine to pull shoulders back naturally.',
  'pull_back',
  ['Shoulder_Circles', 'Arm_Circles', 'Elbow_Circles', 'Cat_Stretch'],
  ['Superman', 'Spider_Crawl', 'Standing_Pelvic_Tilt', 'Butt_Lift_Bridge', 'Pelvic_Tilt_Into_Bridge'],
  ['Upper_Back_Stretch', 'Side_Neck_Stretch', 'Middle_Back_Stretch', 'Childs_Pose']
);

export const WORKOUT_PULL_4: WorkoutPlan = createWorkoutFromExercises(
  'workout-pull-mobility',
  'Posterior Chain Mobility & Flow',
  'Relieve spinal compression and tone posterior muscles',
  'A flowing back circuit designed to release tight fascia while building enduring posture strength.',
  'pull_back',
  ['Dynamic_Back_Stretch', 'Standing_Hip_Circles', 'Cat_Stretch', 'Wrist_Circles'],
  ['Pelvic_Tilt_Into_Bridge', 'Superman', 'Single_Leg_Glute_Bridge', 'Lower_Back_Curl', 'Butt_Lift_Bridge'],
  ['Hug_Knees_To_Chest', 'Side-Lying_Floor_Stretch', 'Upper_Back_Stretch', 'Childs_Pose']
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
  ['Standing_Hip_Circles', 'Knee_Circles', 'Ankle_Circles', 'Worlds_Greatest_Stretch'],
  ['Bodyweight_Squat', 'Bodyweight_Walking_Lunge', 'Single_Leg_Glute_Bridge', 'Glute_Kickback', 'Sit_Squats'],
  ['All_Fours_Quad_Stretch', 'Seated_Floor_Hamstring_Stretch', 'Ankle_On_The_Knee', 'Calf_Stretch_Hands_Against_Wall']
);

export const WORKOUT_LEGS_2: WorkoutPlan = createWorkoutFromExercises(
  'workout-legs-glutes',
  'Glute Sculpt & Hip Abduction',
  'Gluteus medius, hip stabilizer, and pelvic control',
  'Isolates glute activation, lateral hip power, and pelvis alignment to relieve hip flexor tightness.',
  'legs',
  ['Standing_Hip_Circles', 'Hip_Circles_prone', 'Groiners', 'Front_Leg_Raises'],
  ['Glute_Kickback', 'Side_Leg_Raises', 'Rear_Leg_Raises', 'Single_Leg_Glute_Bridge', 'Bodyweight_Squat'],
  ['Ankle_On_The_Knee', 'On_Your_Side_Quad_Stretch', 'Knee_Across_The_Body', 'Seated_Floor_Hamstring_Stretch']
);

export const WORKOUT_LEGS_3: WorkoutPlan = createWorkoutFromExercises(
  'workout-legs-unilateral',
  'Single-Leg Balance & Lunges',
  'Unilateral leg drive, ankle stability, and hip symmetry',
  'Corrects left-right strength imbalances with single-leg lunges, split squats, and glute bridges.',
  'legs',
  ['Ankle_Circles', 'Knee_Circles', 'Front_Leg_Raises', 'Worlds_Greatest_Stretch'],
  ['Split_Squats', 'Bodyweight_Walking_Lunge', 'Single_Leg_Glute_Bridge', 'Glute_Kickback', 'Step-up_with_Knee_Raise'],
  ['90_90_Hamstring', 'All_Fours_Quad_Stretch', 'Standing_Toe_Touches', 'Calf_Stretch_Hands_Against_Wall']
);

export const WORKOUT_LEGS_4: WorkoutPlan = createWorkoutFromExercises(
  'workout-legs-stamina',
  'Quad Burn & Leg Stamina',
  'Deep squats, explosive drive, and calf endurance',
  'High-volume bodyweight leg training for athletic power, quad hypertrophy, and muscular stamina.',
  'legs',
  ['Fast_Skipping', 'Groiners', 'Scissors_Jump', 'Ankle_Circles'],
  ['Freehand_Jump_Squat', 'Bodyweight_Squat', 'Lateral_Bound', 'Bodyweight_Walking_Lunge', 'Frog_Hops'],
  ['Standing_Gastrocnemius_Calf_Stretch', 'The_Straddle', 'All_Fours_Quad_Stretch', 'Seated_Floor_Hamstring_Stretch']
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
  ['Cat_Stretch', 'Inchworm', 'Standing_Hip_Circles', 'Arm_Circles'],
  ['Dead_Bug', 'Plank', 'Reverse_Crunch', 'Bent-Knee_Hip_Raise', 'Side_Bridge'],
  ['Childs_Pose', 'Spinal_Stretch', 'Knee_Across_The_Body', 'Middle_Back_Stretch']
);

export const WORKOUT_CORE_2: WorkoutPlan = createWorkoutFromExercises(
  'workout-core-obliques',
  'Oblique Sculpt & Rotational Control',
  'Side ab definition, lateral bridges, and rotational torso power',
  'Directly sculpts the internal and external obliques for a tapered waist and strong lateral core.',
  'core',
  ['Standing_Hip_Circles', 'Groiners', 'Inchworm', 'Arm_Circles'],
  ['Russian_Twist', 'Side_Bridge', 'Cross-Body_Crunch', 'Side_Jackknife', 'Air_Bike'],
  ['Knee_Across_The_Body', 'Spinal_Stretch', 'Side_Neck_Stretch', 'Childs_Pose']
);

export const WORKOUT_CORE_3: WorkoutPlan = createWorkoutFromExercises(
  'workout-core-rectus',
  'Abdominal Definition & Burn',
  'Direct upper and lower abdominal burn with zero back strain',
  'Focused anterior core training targeting the six-pack wall through controlled flexion and hollow bracing.',
  'core',
  ['Inchworm', 'Cat_Stretch', 'Shoulder_Circles', 'Dynamic_Back_Stretch'],
  ['Crunches', 'Reverse_Crunch', 'Air_Bike', 'Flutter_Kicks', 'Dead_Bug'],
  ['Spinal_Stretch', 'Hug_Knees_To_Chest', 'Childs_Pose', 'Upper_Back_Stretch']
);

export const WORKOUT_CORE_4: WorkoutPlan = createWorkoutFromExercises(
  'workout-core-isometrics',
  'Isometric Hold & Core Shield',
  'Static tension, anti-extension, and hollow endurance',
  'Builds unshakeable core resilience with static planks, bridges, and slow-tempo control.',
  'core',
  ['Worlds_Greatest_Stretch', 'Inchworm', 'Shoulder_Circles', 'Cat_Stretch'],
  ['Mountain_Climbers', 'Plank', 'Dead_Bug', 'Spider_Crawl', 'Bent-Knee_Hip_Raise'],
  ['Childs_Pose', 'Knee_Across_The_Body', 'Middle_Back_Stretch', 'Hug_Knees_To_Chest']
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
  ['Inchworm', 'Arm_Circles', 'Worlds_Greatest_Stretch', 'Cat_Stretch'],
  ['Bodyweight_Squat', 'Pushups', 'Superman', 'Dead_Bug', 'Bodyweight_Walking_Lunge'],
  ['Childs_Pose', 'One_Arm_Against_Wall', 'Seated_Floor_Hamstring_Stretch', 'Shoulder_Stretch']
);

export const WORKOUT_FULL_BODY_2: WorkoutPlan = createWorkoutFromExercises(
  'workout-full-body-athletic',
  'Athletic Conditioning Circuit',
  'High-energy full-body stamina and functional power',
  'Fast-flowing compound circuit engaging every major muscle group for total metabolic conditioning.',
  'full_body',
  ['Fast_Skipping', 'Groiners', 'Arm_Circles', 'Inchworm'],
  ['Freehand_Jump_Squat', 'Pushups', 'Mountain_Climbers', 'Bench_Dips', 'Superman'],
  ['Calf_Stretch_Hands_Against_Wall', 'Triceps_Stretch', 'All_Fours_Quad_Stretch', 'Childs_Pose']
);

export const WORKOUT_FULL_BODY_3: WorkoutPlan = createWorkoutFromExercises(
  'workout-full-body-strength',
  'Strength & Posture Harmony',
  'Pressing strength, posterior chain, and glute tone',
  'Focuses on foundational compound bodyweight movements to build functional total-body strength.',
  'full_body',
  ['Dynamic_Back_Stretch', 'Shoulder_Circles', 'Standing_Hip_Circles', 'Inchworm'],
  ['Incline_Push-Up', 'Superman', 'Split_Squats', 'Single_Leg_Glute_Bridge', 'Russian_Twist'],
  ['Upper_Back_Stretch', 'Knee_Across_The_Body', 'Triceps_Stretch', 'Seated_Floor_Hamstring_Stretch']
);

export const WORKOUT_FULL_BODY_4: WorkoutPlan = createWorkoutFromExercises(
  'workout-full-body-mobility',
  'Mobility & Core Flow',
  'Low-impact total body mobility, joints, and core',
  'Restorative full-body flow combining low-impact strength, spinal decompression, and deep core work.',
  'full_body',
  ['Worlds_Greatest_Stretch', 'Cat_Stretch', 'Ankle_Circles', 'Arm_Circles'],
  ['Glute_Kickback', 'Bench_Dips', 'Spider_Crawl', 'Plank', 'Bodyweight_Squat'],
  ['All_Fours_Quad_Stretch', 'Shoulder_Stretch', 'Spinal_Stretch', 'Childs_Pose']
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
  // Extract main circuit exercises (round 1), excluding rest steps
  const mainExercises = workout.steps
    .filter((s) => s.phase === 'main' && s.round === 1 && !s.isRest)
    .map((s) => s.exercise);

  const { repDurationSeconds, timedDurationSeconds } = calculateAdaptiveDurations(
    mainExercises,
    targetReps
  );

  const updatedSteps = workout.steps.map((step) => {
    if (step.phase !== 'main' || step.isRest) {
      return step;
    }
    const isRep = step.exercise.type === 'reps';
    return {
      ...step,
      targetReps: isRep ? targetReps : undefined,
      workDurationSeconds: isRep ? repDurationSeconds : timedDurationSeconds,
    };
  });

  const totalDurationSeconds = updatedSteps.reduce((acc, s) => acc + s.workDurationSeconds, 0);

  return {
    ...workout,
    totalDurationSeconds,
    steps: updatedSteps,
  };
}

