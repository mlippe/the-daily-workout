import { useState, useMemo, useCallback } from 'react';
import type { WorkoutPlan } from './types/workout';
import { ALL_WORKOUT_PLANS, applyTargetRepsToWorkout } from './utils/workoutGenerator';
import { getDailyRecommendation } from './utils/recommendation';
import {
  getStreakStats,
  saveWorkoutCompletion,
  getWorkoutTargetReps,
  saveWorkoutTargetReps,
  incrementWorkoutTargetReps,
  getAllWorkoutTargetReps,
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
  const [nextTargetReps, setNextTargetReps] = useState<number | undefined>(undefined);

  // Selected routine to display in the hero (defaults to daily recommendation)
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutPlan | null>(null);

  // Stats & recommendation from local storage
  const [statsVersion, setStatsVersion] = useState(0);

  const stats = useMemo(() => {
    void statsVersion;
    return getStreakStats();
  }, [statsVersion]);

  const recommendation = useMemo(() => {
    void statsVersion;
    return getDailyRecommendation();
  }, [statsVersion]);

  const allRepTargets = useMemo(() => {
    void statsVersion;
    return getAllWorkoutTargetReps();
  }, [statsVersion]);

  // Current hero routine (either selected by user, or today's recommendation)
  const baseHeroWorkout = selectedWorkout || recommendation.workout;
  const isRecommended = baseHeroWorkout.id === recommendation.workout.id;

  const heroTargetReps = useMemo(() => {
    void statsVersion;
    return getWorkoutTargetReps(baseHeroWorkout.id);
  }, [baseHeroWorkout.id, statsVersion]);

  const heroWorkout = useMemo(() => {
    return applyTargetRepsToWorkout(baseHeroWorkout, heroTargetReps);
  }, [baseHeroWorkout, heroTargetReps]);

  const heroReason = isRecommended
    ? recommendation.reason
    : `Selected routine: ${heroWorkout.subtitle}`;

  // Manual override handler from the hero
  const handleUpdateTargetReps = useCallback(
    (newReps: number) => {
      saveWorkoutTargetReps(baseHeroWorkout.id, newReps);
      setStatsVersion((v) => v + 1);
    },
    [baseHeroWorkout.id]
  );

  // Start workout action
  const handleStartWorkout = useCallback((workout: WorkoutPlan) => {
    const targetReps = getWorkoutTargetReps(workout.id);
    const workoutWithReps = applyTargetRepsToWorkout(workout, targetReps);
    setActiveWorkout(workoutWithReps);
    setView('running');
  }, []);

  // Preview workout action
  const handlePreviewWorkout = useCallback((workout: WorkoutPlan) => {
    const targetReps = getWorkoutTargetReps(workout.id);
    const workoutWithReps = applyTargetRepsToWorkout(workout, targetReps);
    setPreviewWorkout(workoutWithReps);
  }, []);

  // Completion action
  const handleCompleteWorkout = useCallback((summary: { totalTimeSeconds: number; workout: WorkoutPlan }) => {
    saveWorkoutCompletion({
      workoutId: summary.workout.id,
      workoutTitle: summary.workout.title,
      primaryPillar: summary.workout.primaryPillar,
      completed: true,
      totalTimeSeconds: summary.totalTimeSeconds,
    });

    // Automatic progression: automatically increment target reps by +1 for the next session
    const nextReps = incrementWorkoutTargetReps(summary.workout.id, 1);
    setNextTargetReps(nextReps);

    setCompletedWorkout(summary.workout);
    setStatsVersion((v) => v + 1);
    setView('completed');
  }, []);

  // Return to home
  const handleReturnHome = useCallback(() => {
    setActiveWorkout(null);
    setCompletedWorkout(null);
    setView('home');
  }, []);

  if (view === 'running' && activeWorkout) {
    return (
      <WorkoutRunner
        workout={activeWorkout}
        onComplete={handleCompleteWorkout}
        onExit={handleReturnHome}
      />
    );
  }

  if (view === 'completed' && completedWorkout) {
    return (
      <CompletionScreen
        workout={completedWorkout}
        streak={stats.currentStreak}
        totalCompleted={stats.totalCompleted}
        nextTargetReps={nextTargetReps}
        onReturnHome={handleReturnHome}
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

        {/* Hero Section: Today's 15-Minute Session */}
        <RecommendationHero
          workout={heroWorkout}
          isRecommended={isRecommended}
          reason={heroReason}
          recommendedWorkoutTitle={recommendation.workout.title}
          targetReps={heroTargetReps}
          onUpdateTargetReps={handleUpdateTargetReps}
          onResetToRecommended={() => setSelectedWorkout(null)}
          onStart={handleStartWorkout}
          onPreview={handlePreviewWorkout}
        />

        {/* Routine Selector List */}
        <RoutineList
          workouts={ALL_WORKOUT_PLANS}
          activeWorkoutId={heroWorkout.id}
          recommendedWorkoutId={recommendation.workout.id}
          repTargets={allRepTargets}
          onSelect={(w) => setSelectedWorkout(w)}
          onStart={handleStartWorkout}
        />

        {/* Minimal footer */}
        <footer className="pt-8 pb-12 text-center text-xs font-mono text-neutral-400">
          15 minutes • Bodyweight only • 100% private
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
