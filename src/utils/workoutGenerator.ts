import type { Exercise, MusclePillar } from '../types/exercise';
import type {
  WorkoutDifficulty,
  WorkoutPlan,
  WorkoutStep,
  WorkoutPillarFocus,
} from '../types/workout';
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
 * the entire workout remains around 12 minutes (warmup 2m + cooldown 2m + main ~8m = 12m),
 * strictly preventing real-world sessions from ever exceeding 15 minutes.
 *
 * Timed exercises are adjusted specifically to 30s, 40s, or 45s.
 * Rep exercises are estimated based on target reps and allocated budgeted set intervals.
 */
export function calculateAdaptiveDurations(
  mainExercises: Exercise[],
  targetReps: number = 10
): {
  repDurationSeconds: number;
  timedDurationSeconds: number;
} {
  const repExercises = mainExercises.filter((e) => e.type === 'reps');
  const timedExercises = mainExercises.filter((e) => e.type === 'time');

  const nReps = repExercises.length;
  const nTimed = timedExercises.length;

  // Main circuit target per round: 230s (2 rounds x 230s + 20s rest = 480s, exactly 8 min; total workout = 2m warmup + 8m main + 2m cooldown = 12 min)
  const targetRoundBudget = 230;

  if (nTimed === 0) {
    // When all exercises in the round are rep-based:
    const budgeted = Math.round(targetRoundBudget / Math.max(1, nReps));
    const repDuration = Math.min(55, Math.max(35, budgeted));
    return {
      repDurationSeconds: repDuration,
      timedDurationSeconds: 0,
    };
  }

  if (nReps === 0) {
    const budgeted = Math.round(targetRoundBudget / Math.max(1, nTimed));
    const allowedTimedOptions = [30, 40, 45];
    const timedDuration = allowedTimedOptions.reduce((prev, curr) =>
      Math.abs(curr - budgeted) < Math.abs(prev - budgeted) ? curr : prev
    );
    return {
      repDurationSeconds: 0,
      timedDurationSeconds: timedDuration,
    };
  }

  // When there are both timed and rep exercises:
  const estimatedRepTime = Math.round(targetReps * 2.5 + 15);
  const totalRepTimeInRound = nReps * estimatedRepTime;
  const remainingForTimed = targetRoundBudget - totalRepTimeInRound;
  const idealTimed = remainingForTimed / nTimed;

  // Discrete options: 30s, 40s, or 45s
  const allowedTimedOptions = [30, 40, 45];
  const timedDuration = allowedTimedOptions.reduce((prev, curr) =>
    Math.abs(curr - idealTimed) < Math.abs(prev - idealTimed) ? curr : prev
  );

  // Compensate by allocating remaining budget to rep exercises (bounded between 35s and 55s)
  const remainingForReps = (targetRoundBudget - nTimed * timedDuration) / nReps;
  const repDuration = Math.max(35, Math.min(55, Math.round(remainingForReps)));

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
        targetReps: exercise.type === 'reps' ? (targetReps ?? exercise.defaultReps ?? 10) : undefined,
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
        targetReps: exercise.type === 'reps' ? (targetReps ?? exercise.defaultReps ?? 10) : undefined,
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
      targetReps: exercise.type === 'reps' ? (targetReps ?? exercise.defaultReps ?? 10) : undefined,
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
  difficulty: WorkoutDifficulty,
  warmupIds: string[],
  mainIds: string[],
  cooldownIds: string[]
): WorkoutPlan {
  const warmupExercises = warmupIds.map((eid) => findOrFallback(eid, 'warmup'));
  const mainExercises = mainIds.map((eid) => findOrFallback(eid, 'main', primaryPillar === 'full_body' ? undefined : primaryPillar));
  const cooldownExercises = cooldownIds.map((eid) => findOrFallback(eid, 'cooldown'));

  // 1. Warm-up Phase: Target 120 seconds (~2 minutes)
  const preliminaryWarmupSteps = warmupExercises.flatMap((ex, idx) =>
    buildStepsForExercise(ex, 'warmup', undefined, idx, 30)
  );
  const warmupStepDuration = Math.max(15, Math.round(120 / (preliminaryWarmupSteps.length || 1)));
  const warmupSteps = warmupExercises.flatMap((ex, idx) =>
    buildStepsForExercise(ex, 'warmup', undefined, idx, warmupStepDuration)
  );

  // 2. Main Circuit Phase: 2 Rounds + 20s Inter-Round Rest, Target 480 seconds (8 minutes)
  const defaultReps = 10;
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

  // 3. Cool-down Phase: Target 120 seconds (~2 minutes)
  const preliminaryCooldownSteps = cooldownExercises.flatMap((ex, idx) =>
    buildStepsForExercise(ex, 'cooldown', undefined, idx, 30)
  );
  const cooldownStepDuration = Math.max(15, Math.round(120 / (preliminaryCooldownSteps.length || 1)));
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
    difficulty,
    targetMuscles,
    totalDurationSeconds,
    steps,
  };
}

// ==========================================
// 1. Upper Body Push (Easy / Medium x2 / Hard)
// ==========================================
export const WORKOUT_PUSH_1: WorkoutPlan = createWorkoutFromExercises(
  'workout-push-chest',
  'Chest & Dumbbell Press',
  'Balanced floor pressing, overhead strength, and wrist relief',
  'Alternates floor push-ups and incline couch presses with standing and supine dumbbell work so wrists stay fresh.',
  'push',
  'medium',
  ['Arm_Circles', 'Dynamic_Chest_Stretch', 'Wrist_Circles'],
  ['Pushups', 'Dumbbell_Shoulder_Press', 'Incline_Push-Up', 'Dumbbell_Floor_Press'],
  ['Elbows_Back', 'Kneeling_Forearm_Stretch', 'Triceps_Stretch']
);

export const WORKOUT_PUSH_2: WorkoutPlan = createWorkoutFromExercises(
  'workout-push-triceps',
  'Joint-Friendly Arm & Shoulder Press',
  'Build pressing foundation with gentler leverage and scapular control',
  'Uses couch-elevated push-ups, neutral dumbbell floor presses, overhead extensions, and scaption for shoulder health.',
  'push',
  'easy',
  ['Shoulder_Circles', 'Elbow_Circles', 'Wrist_Circles'],
  ['Incline_Push-Up', 'Dumbbell_Floor_Press', 'Standing_Dumbbell_Triceps_Extension', 'Dumbbell_Scaption'],
  ['Triceps_Stretch', 'Shoulder_Stretch']
);

export const WORKOUT_PUSH_3: WorkoutPlan = createWorkoutFromExercises(
  'workout-push-wide-chest',
  'Wide Chest & Shoulder Control',
  'Chest expansion, rotational overhead pressing, and tricep focus',
  'Pairs wide push-ups with Arnold presses, isometric chest squeezes, and tricep kickbacks without stacking wrist load.',
  'push',
  'medium',
  ['Dynamic_Chest_Stretch', 'Elbow_Circles', 'Wrist_Circles'],
  ['Push-Up_Wide', 'Arnold_Dumbbell_Press', 'Isometric_Chest_Squeezes', 'Tricep_Dumbbell_Kickback'],
  ['One_Arm_Against_Wall', 'Childs_Pose']
);

export const WORKOUT_PUSH_4: WorkoutPlan = createWorkoutFromExercises(
  'workout-push-elevation',
  'Decline Push & Tricep Power',
  'Challenging upper-chest angles, rotational stability, and triceps',
  'Elevates feet on the couch for decline push-ups alongside overhead triceps extensions and push-up-to-side-planks.',
  'push',
  'hard',
  ['Arm_Circles', 'Dynamic_Chest_Stretch', 'Wrist_Circles'],
  ['Decline_Push-Up', 'Standing_Dumbbell_Triceps_Extension', 'Push_Up_to_Side_Plank', 'Push-Ups_-_Close_Triceps_Position'],
  ['Kneeling_Forearm_Stretch', 'Tricep_Side_Stretch', 'Elbows_Back']
);

// ==========================================
// 2. Back & Posture (Pull) (Easy / Medium x2 / Hard)
// ==========================================
export const WORKOUT_PULL_1: WorkoutPlan = createWorkoutFromExercises(
  'workout-pull-posture',
  'Posture Reset & Upper Back',
  'Counter desk slouch with rear-delt raises, glute bridges, and back endurance',
  'Awakens mid-back retractors and glutes without overloading the lower back or adding pushing fatigue.',
  'pull_back',
  'easy',
  ['Shoulder_Circles', 'Dynamic_Back_Stretch', 'Standing_Hip_Circles'],
  ['Butt_Lift_Bridge', 'Seated_Bent-Over_Rear_Delt_Raise', 'Pelvic_Tilt_Into_Bridge', 'Superman'],
  ['Upper_Back_Stretch', 'Childs_Pose', 'One_Knee_To_Chest']
);

export const WORKOUT_PULL_2: WorkoutPlan = createWorkoutFromExercises(
  'workout-pull-lumbar',
  'Dumbbell Row & Spine Support',
  'True upper-back pulling balanced with glute and erector strength',
  'Alternates bent-over dumbbell rows with supine glute bridges so spinal erectors stay supported and strong.',
  'pull_back',
  'medium',
  ['Dynamic_Back_Stretch', 'Elbow_Circles', 'Hip_Circles_prone'],
  ['Bent_Over_Two-Dumbbell_Row', 'Butt_Lift_Bridge', 'Seated_Bent-Over_Rear_Delt_Raise', 'Lower_Back_Curl'],
  ['Hug_Knees_To_Chest', 'Childs_Pose', 'Side-Lying_Floor_Stretch']
);

export const WORKOUT_PULL_3: WorkoutPlan = createWorkoutFromExercises(
  'workout-pull-scapular',
  'Scapular Pull & Posterior Chain',
  'Neutral-grip rows, unilateral glutes, and arm pulling balance',
  'Combines neutral-grip rows, single-leg glute bridges, hammer curls, and Supermans for upright posture.',
  'pull_back',
  'medium',
  ['Arm_Circles', 'Dynamic_Back_Stretch', 'Inchworm'],
  ['Bent_Over_Two-Dumbbell_Row_With_Palms_In', 'Single_Leg_Glute_Bridge', 'Alternate_Hammer_Curl', 'Superman'],
  ['Upper_Back_Stretch', 'Middle_Back_Stretch', 'Childs_Pose']
);

export const WORKOUT_PULL_4: WorkoutPlan = createWorkoutFromExercises(
  'workout-pull-mobility',
  'Heavy Hinge & Single-Arm Row',
  'Unilateral couch-braced rows, hamstring deadlifts, and posterior endurance',
  'Pairs single-arm rows on your couch with stiff-legged dumbbell deadlifts and single-leg bridges for full posterior power.',
  'pull_back',
  'hard',
  ['Shoulder_Circles', 'Dynamic_Back_Stretch', 'Worlds_Greatest_Stretch'],
  ['One-Arm_Dumbbell_Row', 'Stiff-Legged_Dumbbell_Deadlift', 'Seated_Bent-Over_Rear_Delt_Raise', 'Single_Leg_Glute_Bridge'],
  ['Hug_Knees_To_Chest', 'Knee_Across_The_Body', 'Childs_Pose']
);

// ==========================================
// 3. Lower Body (Legs) (Easy / Medium x2 / Hard)
// ==========================================
export const WORKOUT_LEGS_1: WorkoutPlan = createWorkoutFromExercises(
  'workout-legs-power',
  'Foundational Legs & Glutes',
  'Zero-impact squats, glute bridges, kickbacks, and calf strength',
  'Builds knee-friendly lower-body endurance across quads, glutes, and calves with zero jumping.',
  'legs',
  'easy',
  ['Ankle_Circles', 'Standing_Hip_Circles'],
  ['Bodyweight_Squat', 'Butt_Lift_Bridge', 'Glute_Kickback', 'Standing_Dumbbell_Calf_Raise'],
  ['Ankle_On_The_Knee', 'Seated_Floor_Hamstring_Stretch']
);

export const WORKOUT_LEGS_2: WorkoutPlan = createWorkoutFromExercises(
  'workout-legs-glutes',
  'Glutes & Hamstring Hinge',
  'Dumbbell deadlifts, box squats to couch, and glute stability',
  'Balances quad squatting with stiff-legged hamstring deadlifts and unilateral bridges to protect knees and hips.',
  'legs',
  'medium',
  ['Hip_Circles_prone', 'Inchworm'],
  ['Stiff-Legged_Dumbbell_Deadlift', 'Single_Leg_Glute_Bridge', 'Dumbbell_Squat_To_A_Bench', 'Glute_Kickback'],
  ['Ankle_On_The_Knee', 'On_Your_Side_Quad_Stretch']
);

export const WORKOUT_LEGS_3: WorkoutPlan = createWorkoutFromExercises(
  'workout-legs-unilateral',
  'Single-Leg Step & Balance',
  'Knee-friendly rear lunges, couch step-ups, and posterior chain',
  'Uses controlled reverse lunges and step-ups onto your couch to even out side-to-side leg strength safely.',
  'legs',
  'medium',
  ['Standing_Hip_Circles', 'Worlds_Greatest_Stretch'],
  ['Dumbbell_Squat', 'Step-up_with_Knee_Raise', 'Dumbbell_Rear_Lunge', 'Stiff-Legged_Dumbbell_Deadlift'],
  ['Kneeling_Hip_Flexor', 'Leg-Up_Hamstring_Stretch']
);

export const WORKOUT_LEGS_4: WorkoutPlan = createWorkoutFromExercises(
  'workout-legs-stamina',
  'Split Squat & Dumbbell Strength',
  'Quiet high-tension unilateral leg strength without impact jumping',
  'Challenges lower-body strength with couch-elevated Bulgarian split squats, dumbbell step-ups, deadlifts, and calves.',
  'legs',
  'hard',
  ['Front_Leg_Raises', 'Worlds_Greatest_Stretch'],
  ['Split_Squat_with_Dumbbells', 'Stiff-Legged_Dumbbell_Deadlift', 'Dumbbell_Step_Ups', 'Standing_Dumbbell_Calf_Raise'],
  ['All_Fours_Quad_Stretch', 'Calf_Stretch_Hands_Against_Wall']
);

// ==========================================
// 4. Core & Stability (Easy / Medium x2 / Hard)
// ==========================================
export const WORKOUT_CORE_1: WorkoutPlan = createWorkoutFromExercises(
  'workout-core-stability',
  'Deep Core & Spine Shield',
  'Spine-safe anti-extension bracing, side planks, and pelvic control',
  'Strengthens deep transverse abs and lateral stabilizers with zero neck pulling or lumbar compression.',
  'core',
  'easy',
  ['Hip_Circles_prone', 'Dynamic_Back_Stretch', 'Shoulder_Circles'],
  ['Dead_Bug', 'Plank', 'Side_Bridge', 'Butt_Lift_Bridge'],
  ['Cat_Stretch', 'Knee_Across_The_Body', 'Childs_Pose']
);

export const WORKOUT_CORE_2: WorkoutPlan = createWorkoutFromExercises(
  'workout-core-obliques',
  'Obliques & Anti-Rotation',
  'Side bridges, cross-body control, and posterior spine balance',
  'Targets lateral core endurance and rotational control while balancing flexion with Superman back support.',
  'core',
  'medium',
  ['Standing_Hip_Circles', 'Worlds_Greatest_Stretch'],
  ['Side_Bridge', 'Dead_Bug', 'Cross-Body_Crunch', 'Superman'],
  ['Knee_Across_The_Body', 'Side-Lying_Floor_Stretch']
);

export const WORKOUT_CORE_3: WorkoutPlan = createWorkoutFromExercises(
  'workout-core-rectus',
  'Balanced Ab Endurance',
  'Lower abs, plank bracing, controlled cycling, and pelvic balance',
  'Combines reverse crunches and slow air-bike tempo with static planks and bridges for complete trunk balance.',
  'core',
  'medium',
  ['Dynamic_Back_Stretch', 'Inchworm', 'Shoulder_Circles'],
  ['Reverse_Crunch', 'Plank', 'Air_Bike', 'Pelvic_Tilt_Into_Bridge'],
  ['Hug_Knees_To_Chest', 'Cat_Stretch', 'Childs_Pose']
);

export const WORKOUT_CORE_4: WorkoutPlan = createWorkoutFromExercises(
  'workout-core-isometrics',
  'Full-Tension Core Circuit',
  'Quiet high-tension planks, spider crawls, and side-plank holds',
  'Sustains deep trunk bracing across quiet mountain climbers, dead bugs, spider crawls, and side bridges.',
  'core',
  'hard',
  ['Worlds_Greatest_Stretch', 'Inchworm', 'Wrist_Circles'],
  ['Mountain_Climbers', 'Dead_Bug', 'Spider_Crawl', 'Side_Bridge'],
  ['Childs_Pose', 'Kneeling_Forearm_Stretch', 'One_Knee_To_Chest']
);

// ==========================================
// 5. Full Body (Easy / Medium x2 / Hard)
// ==========================================
export const WORKOUT_FULL_BODY_1: WorkoutPlan = createWorkoutFromExercises(
  'workout-full-body-reset',
  'Full Body Joint Reset',
  'Accessible push, pull, squat, and core circuit on mat and couch',
  'Moves every major joint through safe, balanced bodyweight and light dumbbell patterns in 12 minutes.',
  'full_body',
  'easy',
  ['Shoulder_Circles', 'Standing_Hip_Circles', 'Inchworm'],
  ['Bodyweight_Squat', 'Incline_Push-Up', 'Bent_Over_Two-Dumbbell_Row', 'Dead_Bug'],
  ['Childs_Pose', 'Upper_Back_Stretch', 'Ankle_On_The_Knee']
);

export const WORKOUT_FULL_BODY_2: WorkoutPlan = createWorkoutFromExercises(
  'workout-full-body-athletic',
  'Compound Power & Conditioning',
  'Quiet high-output split squats, rows, rotational push-ups, and core',
  'Zero-jump athletic circuit uniting Bulgarian split squats, rotational push-ups, deadlifts, and mountain climbers.',
  'full_body',
  'hard',
  ['Worlds_Greatest_Stretch', 'Inchworm', 'Dynamic_Chest_Stretch'],
  ['Split_Squat_with_Dumbbells', 'Push_Up_to_Side_Plank', 'Stiff-Legged_Dumbbell_Deadlift', 'Mountain_Climbers'],
  ['Kneeling_Hip_Flexor', 'Kneeling_Forearm_Stretch', 'Childs_Pose']
);

export const WORKOUT_FULL_BODY_3: WorkoutPlan = createWorkoutFromExercises(
  'workout-full-body-strength',
  'Dumbbell Full-Body Strength',
  'Balanced squats, floor presses, neutral rows, and planks',
  'Hits all four foundational strength pillars cleanly using dumbbells and mat with zero wrist or knee strain.',
  'full_body',
  'medium',
  ['Arm_Circles', 'Dynamic_Back_Stretch', 'Worlds_Greatest_Stretch'],
  ['Dumbbell_Squat', 'Dumbbell_Floor_Press', 'Bent_Over_Two-Dumbbell_Row_With_Palms_In', 'Plank'],
  ['Knee_Across_The_Body', 'Seated_Floor_Hamstring_Stretch']
);

export const WORKOUT_FULL_BODY_4: WorkoutPlan = createWorkoutFromExercises(
  'workout-full-body-mobility',
  'Posture, Shoulder & Lunge Flow',
  'Unilateral lunges, overhead press, couch rear-delt raise, and core',
  'Pairs single-leg control with overhead pressing and upper-back posture work for full daily alignment.',
  'full_body',
  'medium',
  ['Elbow_Circles', 'Front_Leg_Raises', 'Inchworm'],
  ['Dumbbell_Rear_Lunge', 'Dumbbell_Shoulder_Press', 'Seated_Bent-Over_Rear_Delt_Raise', 'Reverse_Crunch'],
  ['One_Arm_Against_Wall', 'Childs_Pose', 'Cat_Stretch']
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

export function getWorkoutsForDifficulty(difficulty: WorkoutDifficulty): WorkoutPlan[] {
  const pillars: WorkoutPillarFocus[] = ['push', 'pull_back', 'legs', 'core', 'full_body'];
  return pillars.map((pillar) => {
    const matches = WORKOUT_VARIATIONS_BY_PILLAR[pillar].filter((w) => w.difficulty === difficulty);
    return matches[0] || WORKOUT_VARIATIONS_BY_PILLAR[pillar][0];
  });
}

export function getRandomVariation(
  pillar: WorkoutPillarFocus,
  excludeId?: string,
  preferredDifficulty?: WorkoutDifficulty
): WorkoutPlan {
  const list = WORKOUT_VARIATIONS_BY_PILLAR[pillar];
  const byDifficulty = preferredDifficulty
    ? list.filter((w) => w.difficulty === preferredDifficulty)
    : list;
  const scopedList = byDifficulty.length > 0 ? byDifficulty : list;
  const pool = excludeId ? scopedList.filter((w) => w.id !== excludeId) : scopedList;
  if (pool.length > 0) {
    return pool[Math.floor(Math.random() * pool.length)];
  }
  // If only one routine exists in that pillar+difficulty and it's currently selected,
  // allow shuffling across the pillar so Shuffle always gives another variation.
  const fallbackPool = excludeId ? list.filter((w) => w.id !== excludeId) : list;
  const activePool = fallbackPool.length > 0 ? fallbackPool : list;
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

