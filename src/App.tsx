import { useState, useMemo, useCallback } from 'react';
import type { WorkoutDifficulty, WorkoutFeedback, WorkoutPlan } from './types/workout';
import {
  applyTargetRepsToWorkout,
  getRandomVariation,
  getWorkoutsForDifficulty,
} from './utils/workoutGenerator';
import { getDailyRecommendation } from './utils/recommendation';
import {
  getStreakStats,
  getUserPreferences,
  setDifficultyLevel,
  recordWorkoutFeedback,
  saveWorkoutCompletion,
  saveWorkoutTargetReps,
  getAllWorkoutTargetReps,
  getWorkoutTargetReps,
  DEFAULT_TARGET_REPS,
} from './utils/storage';
import { StreakHeader } from './components/home/StreakHeader';
import { RecommendationHero } from './components/home/RecommendationHero';
import { RoutineList } from './components/home/RoutineList';
import { WorkoutDetailModal } from './components/home/WorkoutDetailModal';
import { WorkoutRunner } from './components/runner/WorkoutRunner';
import { CompletionScreen } from './components/home/CompletionScreen';

type AppView = 'home' | 'running' | 'completed';

export default function App() {
  const [view, setView] = useState<AppView>('home');
  const [activeWorkout, setActiveWorkout] = useState<WorkoutPlan | null>(null);
  const [previewWorkout, setPreviewWorkout] = useState<WorkoutPlan | null>(null);
  const [completedWorkout, setCompletedWorkout] = useState<WorkoutPlan | null>(null);
  const [completedEntryId, setCompletedEntryId] = useState<string | null>(null);

  // Selected routine to display in the hero (defaults to daily recommendation)
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutPlan | null>(null);

  // Stats & recommendation from local storage
  const [statsVersion, setStatsVersion] = useState(0);
  const [repTargetsVersion, setRepTargetsVersion] = useState(0);

  const preferences = useMemo(() => {
    void statsVersion;
    return getUserPreferences();
  }, [statsVersion]);

  const stats = useMemo(() => {
    void statsVersion;
    return getStreakStats();
  }, [statsVersion]);

  const recommendation = useMemo(() => {
    void statsVersion;
    return getDailyRecommendation(preferences.difficultyLevel);
  }, [statsVersion, preferences.difficultyLevel]);

  const allRepTargets = useMemo(() => {
    void repTargetsVersion;
    void statsVersion;
    return getAllWorkoutTargetReps();
  }, [repTargetsVersion, statsVersion]);

  const routineListWorkouts = useMemo(() => {
    return getWorkoutsForDifficulty(preferences.difficultyLevel);
  }, [preferences.difficultyLevel]);

  // Current hero routine (either selected by user, or today's recommendation)
  const baseHeroWorkout = selectedWorkout || recommendation.workout;
  const isRecommended = baseHeroWorkout.id === recommendation.workout.id;

  const heroTargetReps = useMemo(() => {
    if (typeof allRepTargets[baseHeroWorkout.primaryPillar] === 'number') {
      return allRepTargets[baseHeroWorkout.primaryPillar];
    }
    if (typeof allRepTargets[baseHeroWorkout.id] === 'number') {
      return allRepTargets[baseHeroWorkout.id];
    }
    return DEFAULT_TARGET_REPS;
  }, [allRepTargets, baseHeroWorkout.primaryPillar, baseHeroWorkout.id]);

  const heroWorkout = useMemo(() => {
    return applyTargetRepsToWorkout(baseHeroWorkout, heroTargetReps);
  }, [baseHeroWorkout, heroTargetReps]);

  const heroReason = isRecommended
    ? recommendation.reason
    : `Selected routine: ${heroWorkout.subtitle}`;

  // Manual override handler from the hero
  const handleUpdateTargetReps = useCallback(
    (newReps: number) => {
      saveWorkoutTargetReps(baseHeroWorkout.primaryPillar, newReps);
      saveWorkoutTargetReps(baseHeroWorkout.id, newReps);
      setRepTargetsVersion((v) => v + 1);
    },
    [baseHeroWorkout.primaryPillar, baseHeroWorkout.id]
  );

  // Manual difficulty bracket switch
  const handleChangeDifficulty = useCallback((level: WorkoutDifficulty) => {
    setDifficultyLevel(level);
    setSelectedWorkout(null);
    setStatsVersion((v) => v + 1);
  }, []);

  // Shuffle another variation for the current hero workout category
  const handleShuffleVariation = useCallback(() => {
    const nextVariation = getRandomVariation(
      baseHeroWorkout.primaryPillar,
      baseHeroWorkout.id,
      preferences.difficultyLevel
    );
    setSelectedWorkout(nextVariation);
  }, [baseHeroWorkout.primaryPillar, baseHeroWorkout.id, preferences.difficultyLevel]);

  // When a category in the list is selected, switch to that routine
  const handleSelectCategory = useCallback((categoryWorkout: WorkoutPlan) => {
    setSelectedWorkout(categoryWorkout);
  }, []);

  // Start workout action
  const handleStartWorkout = useCallback((workout: WorkoutPlan) => {
    const all = getAllWorkoutTargetReps();
    const targetReps =
      all[workout.primaryPillar] ?? all[workout.id] ?? DEFAULT_TARGET_REPS;
    const workoutWithReps = applyTargetRepsToWorkout(workout, targetReps);
    setActiveWorkout(workoutWithReps);
    setView('running');
  }, []);

  // Preview workout action
  const handlePreviewWorkout = useCallback((workout: WorkoutPlan) => {
    const all = getAllWorkoutTargetReps();
    const targetReps =
      all[workout.primaryPillar] ?? all[workout.id] ?? DEFAULT_TARGET_REPS;
    const workoutWithReps = applyTargetRepsToWorkout(workout, targetReps);
    setPreviewWorkout(workoutWithReps);
  }, []);

  // Completion action (saves completion immediately so streak/history are preserved)
  const handleCompleteWorkout = useCallback((summary: { totalTimeSeconds: number; workout: WorkoutPlan }) => {
    const saved = saveWorkoutCompletion({
      workoutId: summary.workout.id,
      workoutTitle: summary.workout.title,
      primaryPillar: summary.workout.primaryPillar,
      completed: true,
      totalTimeSeconds: summary.totalTimeSeconds,
      difficulty: summary.workout.difficulty,
    });

    setCompletedEntryId(saved.id);
    setCompletedWorkout(summary.workout);
    setStatsVersion((v) => v + 1);
    setView('completed');
  }, []);

  // Apply user's post-workout feedback and return to home
  const handleFinishFeedback = useCallback(
    (feedback: WorkoutFeedback) => {
      if (completedWorkout && completedEntryId) {
        recordWorkoutFeedback(
          completedEntryId,
          completedWorkout.primaryPillar,
          completedWorkout.id,
          feedback
        );
      }
      setActiveWorkout(null);
      setCompletedWorkout(null);
      setCompletedEntryId(null);
      setSelectedWorkout(null);
      setStatsVersion((v) => v + 1);
      setView('home');
    },
    [completedWorkout, completedEntryId]
  );

  // Return to home on manual early exit
  const handleExitRunner = useCallback(() => {
    setActiveWorkout(null);
    setView('home');
  }, []);

  if (view === 'running' && activeWorkout) {
    return (
      <WorkoutRunner
        workout={activeWorkout}
        onComplete={handleCompleteWorkout}
        onExit={handleExitRunner}
      />
    );
  }

  if (view === 'completed' && completedWorkout) {
    const currentReps =
      allRepTargets[completedWorkout.primaryPillar] ??
      allRepTargets[completedWorkout.id] ??
      getWorkoutTargetReps(completedWorkout.primaryPillar);

    return (
      <CompletionScreen
        workout={completedWorkout}
        streak={stats.currentStreak}
        totalCompleted={stats.totalCompleted}
        currentTargetReps={currentReps}
        currentDifficulty={preferences.difficultyLevel}
        feedbackStreak={preferences.feedbackStreak}
        onFinish={handleFinishFeedback}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-neutral-100 antialiased selection:bg-neutral-800 selection:text-white">
      <div className="mx-auto max-w-2xl px-6 py-6 sm:px-8 sm:py-10">
        {/* Minimal header */}
        <StreakHeader
          currentStreak={stats.currentStreak}
          totalCompleted={stats.totalCompleted}
        />

        {/* Hero Section */}
        <RecommendationHero
          workout={heroWorkout}
          isRecommended={isRecommended}
          reason={heroReason}
          recommendedWorkoutTitle={recommendation.workout.title}
          targetReps={heroTargetReps}
          onUpdateTargetReps={handleUpdateTargetReps}
          onShuffleVariation={handleShuffleVariation}
          onResetToRecommended={() => setSelectedWorkout(null)}
          onStart={handleStartWorkout}
          onPreview={handlePreviewWorkout}
        />

        {/* Routine Selector List */}
        <RoutineList
          workouts={routineListWorkouts}
          activeWorkoutId={heroWorkout.id}
          recommendedWorkoutId={recommendation.workout.id}
          activePillar={heroWorkout.primaryPillar}
          recommendedPillar={recommendation.workout.primaryPillar}
          activeDifficulty={preferences.difficultyLevel}
          onChangeDifficulty={handleChangeDifficulty}
          repTargets={allRepTargets}
          onSelect={handleSelectCategory}
          onStart={(w) => {
            if (w.id === heroWorkout.id) {
              handleStartWorkout(heroWorkout);
            } else {
              handleStartWorkout(w);
            }
          }}
        />

        {/* Minimal footer */}
        <footer className="pt-6 pb-12 text-center text-xs font-mono text-neutral-600">
          12 minutes • Mat, couch &amp; 7kg dumbbells • Local &amp; private
        </footer>
      </div>

      {/* Routine Detail Preview Modal */}
      {previewWorkout && (
        <WorkoutDetailModal
          workout={previewWorkout}
          isOpen={!!previewWorkout}
          onClose={() => setPreviewWorkout(null)}
          onStart={handleStartWorkout}
        />
      )}
    </div>
  );
}
