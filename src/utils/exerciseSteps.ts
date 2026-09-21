import type { Exercise } from '../types/exercise';

// Curated high-precision 3-step cues for core daily workout movements
const CURATED_CUES: Record<string, [string, string, string]> = {
  Pushups: [
    'Start in a high plank with hands slightly wider than shoulders and glutes squeezed.',
    'Lower your chest toward the floor until your elbows form a 90-degree angle.',
    'Push firmly through your palms back to starting position without sagging your hips.',
  ],
  'Push-Up Wide': [
    'Place hands well outside shoulder width with fingers pointing slightly outward.',
    'Lower your chest until you feel a deep, controlled stretch across your chest.',
    'Press back up explosively, driving through your chest and palms.',
  ],
  'Incline Push-Up': [
    'Place hands shoulder-width apart on a sturdy elevated surface or platform.',
    'Keeping your body in a rigid straight line, lower your chest to the edge.',
    'Press up to full arm extension while keeping your core braced.',
  ],
  'Bench Dips': [
    'Sit on the edge of a sturdy surface, hands gripping beside hips, legs extended forward.',
    'Slide forward off the edge and lower your hips by bending elbows to 90 degrees.',
    'Drive through your palms to press your body straight back up, locking out triceps.',
  ],
  Plank: [
    'Rest on forearms and toes with elbows directly under shoulders.',
    'Squeeze your glutes and brace your abs to create a flat, rigid line from head to heels.',
    'Hold completely still and breathe deeply through your diaphragm.',
  ],
  'Side Bridge': [
    'Lie on your side propped on your forearm with elbow directly beneath shoulder.',
    'Lift your hips off the ground until your body forms a straight diagonal line.',
    'Hold with hips high and chest open, breathing steadily throughout.',
  ],
  Superman: [
    'Lie flat on your stomach with arms extended overhead and legs straight.',
    'Simultaneously lift your chest, arms, and thighs a few inches off the floor.',
    'Squeeze your upper and lower back at the top, hold for 2 seconds, then lower gently.',
  ],
  'Hyperextensions With No Hyperextension Bench': [
    'Lie face down on the mat with hands lightly behind head or ears.',
    'Using your spinal erectors and glutes, gently raise your torso upward.',
    'Pause briefly at the top without straining your neck, then control the descent.',
  ],
  'Pelvic Tilt Into Bridge': [
    'Lie on your back with knees bent and feet flat on the floor hip-width apart.',
    'Flatten your lower back into the mat, then drive hips up toward the ceiling.',
    'Squeeze your glutes hard at the top in a straight line from knees to shoulders.',
  ],
  'Butt Lift (Bridge)': [
    'Lie on your back with arms by sides and feet planted firmly near your hips.',
    'Drive through your heels to raise your pelvis upward toward the ceiling.',
    'Lock out your glutes and hamstrings at the top, pause, then lower with control.',
  ],
  'Single Leg Glute Bridge': [
    'Lie on back with one knee bent and the other leg extended straight out.',
    'Drive through the planted heel to raise hips while keeping hips level.',
    'Hold at top for a 1-second glute squeeze, then slowly lower without resting.',
  ],
  'Bodyweight Squat': [
    'Stand with feet shoulder-width apart, chest tall, and toes angled slightly outward.',
    'Push hips back and bend knees to sink down until thighs are parallel to floor.',
    'Drive through your midfoot and heels to stand back up, squeezing glutes at top.',
  ],
  'Bodyweight Walking Lunge': [
    'Take a large step forward and drop your back knee toward the floor.',
    'Keep your front knee stacked over your ankle and your torso upright.',
    'Drive through your front heel to step straight into the next forward lunge.',
  ],
  'Glute Kickback': [
    'Start on all fours with wrists under shoulders and knees under hips.',
    'Keeping your knee bent at 90 degrees, drive one foot upward toward the ceiling.',
    'Squeeze your glute at peak contraction, then lower knee without touching the floor.',
  ],
  'Dead Bug': [
    'Lie on your back with arms pointed at ceiling and knees bent at 90 degrees.',
    'Press your lower back firmly into the floor so there is zero gap.',
    'Slowly extend opposite arm and leg outward without letting lower back lift.',
  ],
  'Mountain Climbers': [
    'Start in a solid high plank with shoulders directly above wrists.',
    'Drive one knee quickly toward your chest while keeping hips low and level.',
    'Alternate legs in a rhythmic, controlled running motion while bracing core.',
  ],
  'Air Bike': [
    'Lie on back with hands behind head and legs lifted in tabletop position.',
    'Rotate your torso to bring opposite elbow to knee while extending other leg.',
    'Alternate smoothly in a continuous cycling rhythm without pulling your neck.',
  ],
  'Russian Twist': [
    'Sit on floor with knees bent, lean back 45 degrees, and lift feet slightly.',
    'Clasp hands together and rotate your shoulders and torso fully from side to side.',
    'Engage your obliques to control the twist rather than just moving your arms.',
  ],
  Inchworm: [
    'Stand tall, hinge at your hips, and place hands on floor in front of feet.',
    'Walk your hands out forward step-by-step into a solid high plank.',
    'Walk your feet in short steps toward your hands keeping legs as straight as possible.',
  ],
  'Arm Circles': [
    'Stand tall with arms outstretched directly to your sides parallel to the floor.',
    'Make slow, controlled circular rotations about 1 foot in diameter.',
    'Keep your shoulders down away from your ears and breathe steadily.',
  ],
  "Child's Pose": [
    'Kneel on the floor, bring big toes together, and sit hips back onto heels.',
    'Reach your arms out long in front of you and rest your forehead on the mat.',
    'Breathe deeply into your ribcage and allow your spine and shoulders to decompress.',
  ],
  'Cat Stretch': [
    'Begin on all fours with a flat spine, hands under shoulders, knees under hips.',
    'Arch your back upward toward the ceiling, tucking your chin toward your chest.',
    'Hold the gentle spinal stretch, breathe out, then return to neutral.',
  ],
  'All Fours Quad Stretch': [
    'On hands and knees, reach one hand back to grasp the same-side ankle or foot.',
    'Gently draw your heel toward your glutes until you feel a stretch in the thigh.',
    'Keep your hips square to the mat and hold without arching your lower back.',
  ],
  'Triceps Stretch': [
    'Reach one hand behind head, bend elbow, and grasp it with opposite hand.',
    'Gently pull elbow until feeling a triceps and shoulder stretch.',
    'Hold steadily on the first side, then smoothly switch arms when prompted.',
  ],
  'Shoulder Stretch': [
    'Bring one arm straight across your chest parallel to the floor.',
    'Use your opposite forearm to gently hug the arm closer to your chest.',
    'Hold upright posture on the first arm, then switch to the other side.',
  ],
  'Side Neck Stretch': [
    'Relax shoulders down and gently tilt your head toward one shoulder.',
    'Rest your hand lightly on the side of head for a gentle stretch.',
    'Hold the neck stretch smoothly, then switch to the opposite side.',
  ],
  'Middle Back Stretch': [
    'Stand tall with feet shoulder-width apart and hands resting on hips.',
    'Gently twist your torso and shoulders toward one side until you feel a stretch.',
    'Hold the spinal rotation with steady breaths, then switch to the other side.',
  ],
  'Side-Lying Floor Stretch': [
    'Lie on one side with bottom knee bent to stabilize your body.',
    'Reach top arm long overhead while gently extending top leg backward.',
    'Lengthen through your entire side body, then roll over to switch sides.',
  ],
  'Seated Floor Hamstring Stretch': [
    'Sit with one leg straight out and the opposite foot against inner thigh.',
    'Hinge forward from hips and reach toward your extended ankle.',
    'Hold the deep hamstring stretch, then switch legs when prompted.',
  ],
  'Calf Stretch Hands Against Wall': [
    'Place hands on wall at chest height and step one foot straight back.',
    'Press back heel firmly into floor while bending front knee forward.',
    'Feel the calf stretch through the back leg, then switch to other foot.',
  ],
  'Knee Across The Body': [
    'Lie flat on back with one leg straight, bend opposite knee to 90 degrees.',
    'Guide bent knee across body toward floor with opposite hand.',
    'Keep both shoulders grounded on mat, then switch sides when prompted.',
  ],
  'On Your Side Quad Stretch': [
    'Lie on side with bottom knee bent 90 degrees to stabilize your torso.',
    'Bend top knee and hold top foot with top hand behind your glutes.',
    'Press hip forward as you draw foot back, then switch sides when prompted.',
  ],
  'Ankle On The Knee': [
    'Lie on back with knees bent, resting one ankle over opposite knee.',
    'Clasp hands around bottom thigh and gently draw both legs toward chest.',
    'Feel stretch deep in outer hip and glute, then switch to other leg.',
  ],
  '90/90 Hamstring': [
    'Lie on back with one leg flat and other leg bent 90 degrees at hip and knee.',
    'Extend lifted leg up toward ceiling, holding a gentle hamstring stretch.',
    'Maintain lower back contact with floor, then switch legs when prompted.',
  ],
  'Standing Gastrocnemius Calf Stretch': [
    'Elevate one heel or step forward, hinging at hips with leg straight.',
    'Reach forward toward toes to stretch the calf muscle deeply.',
    'Hold with steady breathing, then switch to the other foot on cue.',
  ],
  'Leg-Up Hamstring Stretch': [
    'Lie on back, bend one knee with foot flat, and extend other leg straight up.',
    'Hold behind the lifted thigh or calf, gently drawing leg toward chest.',
    'Keep hips grounded on floor, then switch legs when prompted.',
  ],
  "World's Greatest Stretch": [
    'Step forward into a long lunge with back leg extended and hands inside front foot.',
    'Lower inside elbow toward the floor to open hips and stretch groin.',
    'Rotate chest and reach arm up to ceiling, then switch sides when prompted.',
  ],
  'Standing Hip Circles': [
    'Stand tall on one leg with hand on a wall or support for balance.',
    'Lift unsupported knee to 90 degrees and rotate in large, slow circles.',
    'Mobilize the hip joint through full range, then switch to other leg.',
  ],
  'Front Leg Raises': [
    'Stand tall holding a support and swing one leg forward with control.',
    'Continue swinging leg smoothly forward and back within your flexibility.',
    'Keep torso upright throughout, then switch legs when prompted.',
  ],
  'Ankle Circles': [
    'Lift one foot slightly off the floor while maintaining a tall posture.',
    'Rotate the ankle slowly in large circular motions with your big toe.',
    'Mobilize the joint smoothly, then repeat on the opposite ankle.',
  ],
  'Hip Circles (prone)': [
    'Begin on all fours with wrists under shoulders and knees under hips.',
    'Lift one knee and rotate femur in wide, slow circular motions.',
    'Keep hips level and core engaged, then switch to other side on cue.',
  ],
};

function cleanSentence(s: string): string {
  return s
    .replace(/^([0-9]+\.|-|\*)\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getQuickSteps(exercise: Exercise): [string, string, string] {
  // Check curated table first
  if (CURATED_CUES[exercise.name]) {
    return CURATED_CUES[exercise.name];
  }

  // Filter out generic filler instructions
  const rawInstructions = exercise.instructions || [];
  const filtered = rawInstructions
    .flatMap((inst) => inst.split(/(?<=[.!?])\s+/))
    .map(cleanSentence)
    .filter((s) => {
      if (s.length < 8) return false;
      const lower = s.toLowerCase();
      if (lower.includes('repeat for the recommended') || lower.includes('prescribed in your program')) return false;
      if (lower.includes('this will be your starting position') && s.length < 35) return false;
      return true;
    });

  if (filtered.length >= 3) {
    return [filtered[0], filtered[Math.floor(filtered.length / 2)], filtered[filtered.length - 1]];
  }

  if (filtered.length === 2) {
    return [
      filtered[0],
      filtered[1],
      'Control the tempo, brace your core, and breathe steadily throughout.',
    ];
  }

  if (filtered.length === 1) {
    return [
      filtered[0],
      'Execute the movement through full range of motion with deliberate control.',
      'Breathe smoothly and maintain stable body alignment.',
    ];
  }

  return [
    'Set up in a solid, balanced starting posture.',
    'Execute the exercise with smooth, controlled form.',
    'Focus on target muscle contraction and steady breathing.',
  ];
}
