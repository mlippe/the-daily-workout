import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'src', 'data');
const EXERCISES_IMG_DIR = path.join(ROOT_DIR, 'public', 'exercises');

async function run() {
  console.log('Fetching free-exercise-db exercises.json...');
  const res = await fetch('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json');
  if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
  const rawExercises = await res.json();
  console.log(`Loaded ${rawExercises.length} raw exercises.`);

  const byName = new Map();
  rawExercises.forEach(e => byName.set(e.name.toLowerCase().trim(), e));
  const byId = new Map();
  rawExercises.forEach(e => byId.set(e.id, e));

  function findEx(nameOrId) {
    const key = nameOrId.toLowerCase().trim();
    if (byName.has(key)) return byName.get(key);
    if (byId.has(nameOrId)) return byId.get(nameOrId);
    for (const [k, v] of byName.entries()) {
      if (k.includes(key) || key.includes(k)) return v;
    }
    return null;
  }

  // Curated lists
  const warmupNames = [
    'Arm Circles',
    'Ankle Circles',
    'Elbow Circles',
    'Shoulder Circles',
    'Standing Hip Circles',
    'Hip Circles (prone)',
    'Groiners',
    'Front Leg Raises',
    'Dynamic Chest Stretch',
    'Dynamic Back Stretch',
    'Inchworm',
    'Carioca Quick Step',
    'Alternate Leg Diagonal Bound',
    'Fast Skipping',
    'Star Jump',
    'Rocket Jump',
    'Scissors Jump',
    'Split Jump',
    "World's Greatest Stretch",
    'Wrist Circles',
    'Knee Circles',
  ];

  const pushNames = [
    'Pushups',
    'Push-Up Wide',
    'Push-Ups - Close Triceps Position',
    'Push-Ups With Feet Elevated',
    'Incline Push-Up',
    'Incline Push-Up Close-Grip',
    'Incline Push-Up Wide',
    'Incline Push-Up Medium',
    'Incline Push-Up Reverse Grip',
    'Decline Push-Up',
    'Plyo Push-up',
    'Push Up to Side Plank',
    'Bench Dips',
    'Dips - Triceps Version',
    'Handstand Push-Ups',
    'Clock Push-Up',
    'Body-Up',
    'Body Tricep Press',
    'Single-Arm Push-Up',
    'Standing Towel Triceps Extension',
    'Isometric Chest Squeezes',
    'Isometric Wipers',
    'Kneeling Arm Drill',
    'Pushups (Close and Wide Hand Positions)',
    'Close-Grip Push-Up off of a Dumbbell'
  ];

  const pullBackNames = [
    'Superman',
    'Hyperextensions With No Hyperextension Bench',
    'Pelvic Tilt Into Bridge',
    'Butt Lift (Bridge)',
    'Pullups',
    'Chin-Up',
    'Scapular Pull-Up',
    'V-Bar Pullup',
    'Wide-Grip Rear Pull-Up',
    'Cat Stretch',
    'Middle Back Stretch',
    'Upper Back Stretch',
    'Spinal Stretch',
    'Lower Back Curl',
    'Chair Lower Back Stretch',
    'One Arm Against Wall',
    'Side-Lying Floor Stretch',
    'Standing Pelvic Tilt',
    'Upper Back-Leg Grab',
    'Hug Knees To Chest',
  ];

  const legNames = [
    'Bodyweight Squat',
    'Bodyweight Walking Lunge',
    'Freehand Jump Squat',
    'Glute Kickback',
    'Single Leg Glute Bridge',
    'Step-up with Knee Raise',
    'Bench Jump',
    'Knee Tuck Jump',
    'Lateral Bound',
    'Split Squats',
    'Sit Squats',
    'Floor Glute-Ham Raise',
    'Natural Glute Ham Raise',
    'Moving Claw Series',
    'Double Leg Butt Kick',
    'Single Leg Butt Kick',
    'Side Standing Long Jump',
    'Standing Long Jump',
    'Leg Lift',
    'Prone Manual Hamstring',
    'Standing Hip Flexors',
    'Rear Leg Raises',
    'Side Leg Raises',
    'Iron Crosses (stretch)',
    'Frog Hops'
  ];

  const coreNames = [
    'Plank',
    'Side Bridge',
    'Mountain Climbers',
    'Dead Bug',
    'Russian Twist',
    'Air Bike',
    'Flutter Kicks',
    '3/4 Sit-Up',
    'Sit-Up',
    'Crunches',
    'Cross-Body Crunch',
    'Bent-Knee Hip Raise',
    'Bottoms Up',
    'Butt-Ups',
    'Cocoons',
    'Reverse Crunch',
    'Decline Crunch',
    'Decline Oblique Crunch',
    'Oblique Crunches - On The Floor',
    'Elbow to Knee',
    'Frog Sit-Ups',
    'Jackknife Sit-Up',
    'Janda Sit-Up',
    'Spider Crawl',
    'Tuck Crunch',
    'Stomach Vacuum',
    'Side Jackknife'
  ];

  const cooldownNames = [
    "Child's Pose",
    'All Fours Quad Stretch',
    'On Your Side Quad Stretch',
    'Lying Prone Quadriceps',
    'Seated Floor Hamstring Stretch',
    'Seated Hamstring',
    'Leg-Up Hamstring Stretch',
    '90/90 Hamstring',
    'Adductor/Groin',
    'Ankle On The Knee',
    'Calf Stretch Hands Against Wall',
    'Calf Stretch Elbows Against Wall',
    'Standing Toe Touches',
    'Knee Across The Body',
    'Lying Glute',
    'Seated Glute',
    'Overhead Triceps',
    'Triceps Stretch',
    'Shoulder Stretch',
    'Side Neck Stretch',
    'Chin To Chest Stretch',
    'Seated Front Deltoid',
    'Standing Gastrocnemius Calf Stretch',
    'The Straddle'
  ];

  const curated = [];
  const addedIds = new Set();

  function addItems(names, category, pillar) {
    let count = 0;
    for (const name of names) {
      const match = findEx(name);
      if (!match) {
        console.warn(`Could not find exercise: "${name}"`);
        continue;
      }
      if (addedIds.has(match.id)) {
        // If already added under another category, skip or duplicate with new id
        continue;
      }
      addedIds.add(match.id);

      const isRepBased = match.category === 'strength' || match.category === 'powerlifting';
      const defaultDuration = category === 'warmup' ? 30 : category === 'cooldown' ? 30 : 45;
      const defaultReps = isRepBased ? 12 : undefined;

      const exercise = {
        id: match.id,
        name: match.name,
        category,
        ...(pillar ? { pillar } : {}),
        primaryMuscles: match.primaryMuscles || [],
        secondaryMuscles: match.secondaryMuscles || [],
        equipment: 'body only',
        level: match.level || 'beginner',
        type: isRepBased ? 'reps' : 'time',
        ...(defaultDuration ? { defaultDuration } : {}),
        ...(defaultReps ? { defaultReps } : {}),
        instructions: match.instructions || [],
        images: [
          `/exercises/${match.id}/0.jpg`,
          `/exercises/${match.id}/1.jpg`
        ],
        rawImageUrls: [
          `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${match.images[0]}`,
          `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${match.images[1]}`
        ]
      };
      curated.push(exercise);
      count++;
    }
    console.log(`Added ${count} exercises for ${category} ${pillar || ''}`);
  }

  addItems(warmupNames, 'warmup');
  addItems(pushNames, 'main', 'push');
  addItems(pullBackNames, 'main', 'pull_back');
  addItems(legNames, 'main', 'legs');
  addItems(coreNames, 'main', 'core');
  addItems(cooldownNames, 'cooldown');

  console.log(`Total curated exercises: ${curated.length}`);

  // Create directories
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(EXERCISES_IMG_DIR, { recursive: true });

  // Save exercises.json (without rawImageUrls)
  const jsonForApp = curated.map(e => {
    const { rawImageUrls: _rawImageUrls, ...rest } = e;
    return rest;
  });

  fs.writeFileSync(
    path.join(DATA_DIR, 'exercises.json'),
    JSON.stringify(jsonForApp, null, 2)
  );
  console.log(`Saved src/data/exercises.json with ${jsonForApp.length} exercises.`);

  // Save manifest with raw URLs for image downloader
  fs.writeFileSync(
    path.join(DATA_DIR, 'exercises-manifest.json'),
    JSON.stringify(curated, null, 2)
  );
}

run().catch(console.error);
