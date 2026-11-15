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
    'Place hands shoulder-width apart on the sturdy edge of your couch or an elevated platform.',
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
    'Squeeze your glute at peak contraction, lower smoothly, then switch legs when prompted.',
  ],
  'Dead Bug': [
    'Lie on your back with arms pointed at ceiling and knees bent at 90 degrees.',
    'Press your lower back firmly into the floor so there is zero gap.',
    'Slowly extend opposite arm and leg outward without letting lower back lift.',
  ],
  'Mountain Climbers': [
    'Hold a strong high plank with wrists stacked under shoulders and core braced.',
    'Draw one knee smoothly toward chest without letting hips bounce or sag.',
    'Alternate legs at a deliberate, quiet tempo rather than stomping the floor.',
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
  'Step-up with Knee Raise': [
    'Place your lead foot firmly onto a sturdy step or platform.',
    'Drive through your heel to stand tall while driving opposite knee toward chest.',
    'Step back down with control and maintain rhythm on this side before switching.',
  ],
  'Cross-Body Crunch': [
    'Lie on back with knees bent and hands lightly supporting head.',
    'Curl one shoulder across your torso toward the opposite knee while engaging your abs.',
    'Lower with control and alternate smoothly between sides each repetition.',
  ],
  'Spider Crawl': [
    'Start in a push-up position with body in a straight, rigid line.',
    'Bring one knee out to the side toward your elbow while maintaining low hips.',
    'Pause briefly, step back, and alternate sides smoothly with core braced.',
  ],
  'Isometric Chest Squeezes': [
    'Press palms together directly in front of your chest with elbows bent wide.',
    'Squeeze palms firmly against each other, contracting chest and shoulders.',
    'Hold continuous maximum isometric tension while breathing steadily.',
  ],
  'Push-Ups With Feet Elevated': [
    'Place toes on a sturdy elevated bench or step and hands on the floor.',
    'Lower chest under control until elbows form a 90-degree angle.',
    'Press through palms back to lockout, engaging upper chest and deltoids.',
  ],
  'Push-Up to Side Plank': [
    'Perform a standard push-up with chest lowering close to the floor.',
    'As you press up, rotate torso to one side and reach top arm toward ceiling.',
    'Return to high plank and repeat with smooth rotational control.',
  ],
  'Freehand Jump Squat': [
    'Lower into a parallel squat with chest tall and arms back.',
    'Explode upward off the floor into a vertical jump, swinging arms up.',
    'Land softly on the balls of your feet, immediately absorbing into next squat.',
  ],
  'Lateral Bound': [
    'Stand balanced on one leg with knee soft and torso slightly hinged.',
    'Push explosively off the stance leg to leap sideways onto opposite foot.',
    'Stick the landing with a bent knee, stabilize briefly, and bound back.',
  ],
  'Frog Hops': [
    'Start in a deep wide squat with fingertips touching the floor between feet.',
    'Hop forward slightly while staying low in your squat stance.',
    'Absorb the landing softly on midfoot and stay low throughout the set.',
  ],
  'Side Jackknife': [
    'Lie on your side with legs straight and bottom arm extended on the floor.',
    'Place top hand behind head and simultaneously raise legs and upper torso.',
    'Squeeze your side waist at the top, lower slowly, and finish side before switching.',
  ],
  'Side Leg Raises': [
    'Stand tall next to a wall or chair for light balance support.',
    'Keep one leg straight as you smoothly swing it out to the side, then cross lightly in front.',
    'Keep your torso upright throughout the set, then switch legs when prompted.',
  ],
  'Rear Leg Raises': [
    'Begin on all fours with wrists under shoulders and spine neutral.',
    'Extend one leg straight back and lift heel toward ceiling without arching back.',
    'Squeeze glute at top, lower slowly, and switch legs when prompted.',
  ],
  'Jumping Split Squats': [
    'Lower into a long split lunge with front thigh parallel and torso tall.',
    'Explode upward lightly to switch your front and back legs in mid-air.',
    'Land softly on bent knees to absorb impact smoothly.',
  ],
  'Split Squat with Dumbbells': [
    'Rest the top of your back foot on your couch edge behind you, dumbbells held at sides.',
    'Lower your back knee straight down until front thigh is parallel and torso stays tall.',
    'Drive through your front heel to stand; finish all reps on this side before switching.',
  ],
  'Lower Back Curl': [
    'Lie face down on the mat with arms relaxed by your sides.',
    'Gently curl your upper chest and shoulders off the floor using spinal erectors.',
    'Hold briefly at top without craning neck, then lower down smoothly.',
  ],
  'Standing Pelvic Tilt': [
    'Stand tall with knees slightly soft and hands on your hips.',
    'Gently tuck your pelvis under to flatten lumbar arch, engaging lower abs.',
    'Release back to neutral with smooth, rhythmic pelvic control.',
  ],
  'Hug Knees To Chest': [
    'Lie flat on back and draw both knees up toward your chest.',
    'Wrap arms around shins and gently hug knees in to decompress lower back.',
    'Breathe deeply into your abdomen, allowing spinal muscles to fully relax.',
  ],
  'Spinal Stretch': [
    'Sit tall near the front edge of your couch or a chair with feet planted flat.',
    'Interlace hands lightly behind head and rotate torso smoothly to one side.',
    'Breathe into the spinal rotation, return upright, then twist to the opposite side.',
  ],
  'Upper Back Stretch': [
    'Clasp hands together in front of chest and round your upper back forward.',
    'Drop chin to chest and push knuckles away to open between shoulder blades.',
    'Breathe into your mid-back, holding the gentle stretch with relaxed shoulders.',
  ],
  'One Arm Against Wall': [
    'Stand beside a wall or doorframe with one bent forearm pressed flat at shoulder height.',
    'Gently turn your torso away and lean slightly forward until feeling chest and lats open.',
    'Breathe steadily into the stretch, then switch to the opposite side when prompted.',
  ],
  'Dynamic Chest Stretch': [
    'Stand tall and open arms wide horizontally, expanding your chest.',
    'Cross arms smoothly in front of body, hugging shoulders briefly.',
    'Continue rhythmic opening and crossing motions at a controlled tempo.',
  ],
  'Dynamic Back Stretch': [
    'Stand tall with feet wide and swing straight arms overhead smoothly.',
    'Lower arms and pull elbows gently backward on the return swing.',
    'Gradually widen shoulder and upper-back range of motion with your breath.',
  ],
  'Wrist Circles': [
    'Extend arms straight out to the sides in a T-pose at shoulder height.',
    'Keeping arms steady, draw slow full circles in both directions with your wrists.',
    'Warm up wrist joints and forearm tendons before weight-bearing sets.',
  ],
  'Elbow Circles': [
    'Place fingertips lightly on the tops of your shoulders.',
    'Draw large circular motions with your elbows in both directions.',
    'Mobilize the shoulder joint and thoracic capsule with tall posture.',
  ],
  'Dumbbell Floor Press': [
    'Lie flat on your mat with knees bent and dumbbells pressed straight over chest.',
    'Tuck elbows roughly 45 degrees and lower until triceps gently tap the floor.',
    'Pause briefly on the mat, then press dumbbells smoothly back up with stacked wrists.',
  ],
  'Dumbbell Shoulder Press': [
    'Stand tall with core and glutes braced, holding dumbbells at shoulder height.',
    'Press weights overhead without flaring your ribs or arching your lower back.',
    'Lower under steady 2-second control back to shoulder level.',
  ],
  'Arnold Dumbbell Press': [
    'Hold dumbbells in front of shoulders with palms facing your chest and elbows tucked.',
    'Press upward while smoothly rotating palms forward as arms travel overhead.',
    'Reverse the rotation slowly as you lower weights back to starting position.',
  ],
  'Dumbbell Scaption': [
    'Hold dumbbells lightly at your sides with thumbs pointing upward.',
    'Raise straight arms forward and slightly out (30 degrees) to shoulder height.',
    'Lower smoothly without shrugging your neck to strengthen shoulder stabilizers.',
  ],
  'Standing Dumbbell Triceps Extension': [
    'Stand braced with glutes tight, holding one dumbbell overhead with both palms.',
    'Keep elbows tucked close beside your head and lower dumbbell smoothly behind neck.',
    'Extend forearms straight back up using triceps tension, keeping torso still.',
  ],
  'Tricep Dumbbell Kickback': [
    'Hinge torso forward about 45 degrees with flat back and upper arms pinned to sides.',
    'Extend forearms straight back until arms lock out fully beside your hips.',
    'Pause 1 second squeezing triceps, then fold elbows forward with control.',
  ],
  'Decline Push-Up': [
    'Rest toes securely on your couch edge and place hands shoulder-width on the mat.',
    'Brace core tightly so hips stay level, and lower upper chest toward floor.',
    'Press through palms back to top without letting your lower back sag.',
  ],
  'Bent Over Two-Dumbbell Row': [
    'Hinge hips back with a flat neutral spine and dumbbells hanging below shoulders.',
    'Pull elbows smoothly toward your hip crease while squeezing shoulder blades together.',
    'Lower dumbbells under control without rounding your upper or lower back.',
  ],
  'Bent Over Two-Dumbbell Row With Palms In': [
    'Hinge forward with knees soft, flat back, and palms facing each other.',
    'Row both dumbbells up close beside your ribcage, retracting shoulder blades.',
    'Pause briefly at top contraction before lowering arms straight down.',
  ],
  'One-Arm Dumbbell Row': [
    'Brace one hand and knee on your couch edge with spine flat and parallel to floor.',
    'Pull dumbbell vertically toward your hip without twisting your shoulders.',
    'Lower smoothly to full arm hang; finish side before switching arms.',
  ],
  'Seated Bent-Over Rear Delt Raise': [
    'Sit near the front edge of your couch and hinge chest toward thighs with flat back.',
    'Raise dumbbells out to the sides with softly bent elbows until parallel to floor.',
    'Squeeze upper mid-back between shoulder blades, then lower slowly.',
  ],
  'Alternate Hammer Curl': [
    'Stand tall holding dumbbells at sides with palms facing inward toward thighs.',
    'Curl one dumbbell up keeping elbow pinned at your side without swinging torso.',
    'Lower under control and alternate arms smoothly each repetition.',
  ],
  'Stiff-Legged Dumbbell Deadlift': [
    'Stand tall holding dumbbells against thighs with knees softly unlocked.',
    'Push hips straight back, sliding dumbbells close down shins with a flat spine.',
    'Feel a deep hamstring stretch below knees, then drive hips forward to stand tall.',
  ],
  'Dumbbell Squat': [
    'Hold dumbbells at your sides with chest lifted and feet shoulder-width apart.',
    'Sit hips back and bend knees cleanly until thighs reach parallel.',
    'Drive through midfoot and heels to stand tall while keeping knees tracking toes.',
  ],
  'Dumbbell Squat To A Bench': [
    'Stand just ahead of your couch edge holding dumbbells neatly at your sides.',
    'Sit back until glutes lightly tap the couch without relaxing onto the seat.',
    'Drive briskly back to standing, keeping chest upright throughout.',
  ],
  'Dumbbell Rear Lunge': [
    'Hold dumbbells at sides and take a controlled step backward into a split stance.',
    'Lower back knee toward floor while keeping front shin vertical and torso tall.',
    'Push firmly through front heel to return; finish reps on this leg before switching.',
  ],
  'Dumbbell Step Ups': [
    'Place lead foot squarely on top of your couch cushion or sturdy low step.',
    'Drive through that top heel to stand up tall without bouncing off the back toe.',
    'Step down slowly with control; complete all reps on one leg before switching.',
  ],
  'Standing Dumbbell Calf Raise': [
    'Stand tall holding dumbbells at sides with core braced and weight centered.',
    'Rise smoothly onto the balls of both feet as high as ankle mobility allows.',
    'Pause 1 second flexing calves, then lower heels slowly back to mat.',
  ],
  'Kneeling Forearm Stretch': [
    'Kneel on your mat and place palms flat with fingers pointing back toward knees.',
    'Gently shift hips slightly backward until feeling a mild forearm and wrist stretch.',
    'Keep shoulders relaxed and breathe slowly without forcing wrist pain.',
  ],
  'Elbows Back': [
    'Stand tall and rest both palms on your lower back with fingers pointing down.',
    'Gently draw shoulder blades and elbows backward toward each other.',
    'Hold the chest-opening stretch while breathing deeply into your ribs.',
  ],
  'One Knee To Chest': [
    'Lie flat on your back with one leg straight along the mat.',
    'Interlace hands under the other knee and hug it gently toward chest.',
    'Relax your shoulders into the floor, then switch sides when prompted.',
  ],
  'Tricep Side Stretch': [
    'Bring one straight arm across chest above opposite shoulder, cradling elbow.',
    'Gently draw elbow across until feeling stretch in triceps and outer shoulder.',
    'Keep shoulder dropped away from ear, then switch arms when prompted.',
  ],
  'Incline Push-Up Close-Grip': [
    'Place hands close together inside shoulder width on the sturdy edge of your couch.',
    'Keep elbows tucked beside your ribcage as you lower chest toward the edge.',
    'Drive through palms to straighten arms and squeeze triceps without hips sagging.',
  ],
  'Incline Push-Up Wide': [
    'Place hands wider than shoulder width along the sturdy edge of your couch.',
    'Keep body in a straight plank line and lower chest smoothly toward your hands.',
    'Press back up cleanly through chest and shoulders with braced core.',
  ],
  'Body-Up': [
    'Start in a strong forearm plank on your mat with feet hip-width apart and hips level.',
    'Press through palms to extend elbows smoothly into a high plank using triceps tension.',
    'Lower forearms back onto the mat under steady control without swaying your hips.',
  ],
  'Isometric Wipers': [
    'Start in a solid push-up plank with hands slightly wider than shoulder width.',
    'Shift torso smoothly toward one hand while bending that elbow to load the chest and arm.',
    'Press straight back to center and alternate smoothly to the opposite side.',
  ],
  'Leg Lift': [
    'Stand tall holding a wall or the back of your couch lightly for balance.',
    'Keeping stance leg straight and core tight, sweep working leg straight back squeezing glute.',
    'Lower slowly without touching floor; complete all reps on this side before switching.',
  ],
  'Stomach Vacuum': [
    'Stand tall with hands on hips and take a slow, full inhale.',
    'Exhale steadily while drawing your navel deep inward toward your spine without hunching.',
    'Hold strong deep abdominal tension while continuing shallow controlled breaths.',
  ],
  'Alternate Heel Touchers': [
    'Lie on your back with knees bent, feet flat on the floor, and shoulders lifted slightly.',
    'Crunch laterally to tap your right heel with your right hand while squeezing side waist.',
    'Return smoothly to center and tap your left heel; alternate steadily without pulling neck.',
  ],
  'Butt-Ups': [
    'Hold a forearm plank on your mat with abs braced tight and legs straight.',
    'Pull ribcage toward hips to pike glutes cleanly up toward the ceiling.',
    'Lower back to a flat plank with control without letting your lower back sag.',
  ],
  Cocoons: [
    'Lie flat on your back with arms extended overhead and legs stretched lightly off floor.',
    'Tuck knees smoothly toward chest while curling torso forward and reaching hands to shins.',
    'Extend back out under slow, controlled tension keeping lower back quiet.',
  ],
  'Crossover Reverse Lunge': [
    'Stand tall with feet hip-width apart and hands braced in front of chest.',
    'Step smoothly back into a reverse lunge while rotating torso gently over the front thigh.',
    'Drive through front heel to stand tall and alternate sides each repetition.',
  ],
};

function cleanSentence(s: string): string {
  return s
    .replace(/^([0-9]+\.|-|\*)\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getQuickSteps(exercise: Exercise): [string, string, string] {
  // Check curated table first (stripping any (Right) or (Left) suffix)
  const baseName = exercise.name.replace(/\s*\((Right|Left)\)$/i, '').trim();
  if (CURATED_CUES[baseName] || CURATED_CUES[exercise.name]) {
    return CURATED_CUES[baseName] || CURATED_CUES[exercise.name];
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
