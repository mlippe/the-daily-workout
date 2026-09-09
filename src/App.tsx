import { useState, useMemo, useCallback } from 'react';
import type { WorkoutPlan } from './types/workout';
import { ALL_WORKOUT_PLANS } from './utils/workoutGenerator';
import { getDailyRecommendation } from './utils/recommendation';
import { getStreakStats, saveWorkoutCompletion } from './utils/storage';
import { StreakHeader } from './components/home/StreakHeader';
import { RecommendationCard } from './components/home/RecommendationCard';
import { WorkoutCard } from './components/home/WorkoutCard';
import { WorkoutDetailModal } from './components/home/WorkoutDetailModal';
import { WorkoutRunner } from './components/runner/WorkoutRunner';
import { CompletionScreen } from './components/home/CompletionScreen';

type AppView = 'home' | 'running' | 'completed';

export default function App() {
  const [view, setView] = useState<AppView>('home');
  const [activeWorkout, setActiveWorkout] = useState<WorkoutPlan | null>(null);
  const [previewWorkout, setPreviewWorkout] = useState<WorkoutPlan | null>(null);
  const [completedWorkout, setCompletedWorkout] = useState<WorkoutPlan | null>(null);
  const [selectedPillarFilter, setSelectedPillarFilter] = useState<string>('all');

  // Stats & recommendation from storage
  const [statsVersion, setStatsVersion] = useState(0);

  const stats = useMemo(() => {
    // Re-evaluate when statsVersion changes
    void statsVersion;
    return getStreakStats();
  }, [statsVersion]);

  const recommendation = useMemo(() => {
    void statsVersion;
    return getDailyRecommendation();
  }, [statsVersion]);

  // Start workout action
  const handleStartWorkout = useCallback((workout: WorkoutPlan) => {
    setActiveWorkout(workout);
    setView('running');
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

  // Filtered workout plans for grid
  const filteredWorkouts = useMemo(() => {
    if (selectedPillarFilter === 'all') return ALL_WORKOUT_PLANS;
    return ALL_WORKOUT_PLANS.filter((w) => w.primaryPillar === selectedPillarFilter);
  }, [selectedPillarFilter]);

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
        onReturnHome={handleReturnHome}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 antialiased selection:bg-indigo-500 selection:text-white">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Header with Streak and 14-day balance */}
        <StreakHeader
          currentStreak={stats.currentStreak}
          totalCompleted={stats.totalCompleted}
          pillarBreakdown={recommendation.pillarBreakdown}
        />

        {/* Daily Recommendation Hero Card */}
        <section className="mt-6 sm:mt-8">
          <RecommendationCard
            workout={recommendation.workout}
            reason={recommendation.reason}
            onStart={handleStartWorkout}
            onPreview={(w) => setPreviewWorkout(w)}
          />
        </section>

        {/* Workout Library Grid */}
        <section className="mt-10 sm:mt-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">All 15-Minute Routines</h2>
              <p className="text-xs text-neutral-400">Strictly 15 minutes. Pick any focus for today.</p>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              {[
                { id: 'all', label: 'All Routines' },
                { id: 'pull_back', label: 'Back & Posture' },
                { id: 'push', label: 'Push' },
                { id: 'legs', label: 'Legs' },
                { id: 'core', label: 'Core' },
                { id: 'full_body', label: 'Full Body' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setSelectedPillarFilter(filter.id)}
                  className={`rounded-full px-3 py-1 transition-colors ${
                    selectedPillarFilter === filter.id
                      ? 'bg-white font-semibold text-neutral-950'
                      : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredWorkouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                isRecommended={workout.id === recommendation.workout.id}
                onStart={handleStartWorkout}
                onPreview={(w) => setPreviewWorkout(w)}
              />
            ))}
          </div>
        </section>

        {/* Bottom Philosophy Info Bar */}
        <footer className="mt-14 border-t border-neutral-900 pt-8 pb-12 text-center text-xs text-neutral-500">
          <p className="max-w-md mx-auto leading-relaxed">
            The Daily Workout is 100% private and runs entirely in your browser. No accounts, no subscriptions, and no analytics.
          </p>
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
