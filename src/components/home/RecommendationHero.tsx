import { Play, List, Minus, Plus, Shuffle, RotateCcw, Dumbbell } from 'lucide-react';
import type { WorkoutPlan } from '../../types/workout';

interface RecommendationHeroProps {
  workout: WorkoutPlan;
  isRecommended: boolean;
  reason: string;
  recommendedWorkoutTitle?: string;
  targetReps: number;
  onUpdateTargetReps: (reps: number) => void;
  onShuffleVariation?: () => void;
  onResetToRecommended?: () => void;
  onStart: (workout: WorkoutPlan) => void;
  onPreview: (workout: WorkoutPlan) => void;
}

export function RecommendationHero({
  workout,
  isRecommended,
  reason,
  recommendedWorkoutTitle,
  targetReps,
  onUpdateTargetReps,
  onShuffleVariation,
  onResetToRecommended,
  onStart,
  onPreview,
}: RecommendationHeroProps) {
  const durationMinutes = Math.round(workout.totalDurationSeconds / 60);

  return (
    <section className="py-7 sm:py-10">
      {/* Top kicker bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-lg font-mono uppercase tracking-wider text-neutral-400">
        <span className="text-neutral-200 font-bold truncate">
          {isRecommended ? "Today's Focus" : 'Selected Routine'}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {onShuffleVariation && (
            <button
              type="button"
              onClick={onShuffleVariation}
              className="inline-flex items-center gap-1.5 min-h-11 px-3 rounded-lg text-lg text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
              title="Shuffle variation"
            >
              <Shuffle className="h-4 w-4" />
              <span>Shuffle</span>
            </button>
          )}

          {!isRecommended && onResetToRecommended && recommendedWorkoutTitle && (
            <button
              type="button"
              onClick={onResetToRecommended}
              className="inline-flex items-center gap-1.5 min-h-11 px-3 -mr-3 rounded-lg text-lg text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Routine Title */}
      <h1 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.03em] text-white leading-[0.98]">
        {workout.title}
      </h1>

      {/* Description */}
      <p className="mt-3 text-xl sm:text-2xl text-neutral-300 leading-snug max-w-xl">
        {workout.subtitle}
      </p>

      {/* Structured Specs Line */}
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-lg uppercase tracking-wider text-neutral-300">
        <span>{durationMinutes} Min</span>
        <span className="text-neutral-600">/</span>
        <span>{workout.difficulty}</span>
        {workout.requiresDumbbells && (
          <>
            <span className="text-neutral-600">/</span>
            <span className="inline-flex items-center gap-1.5 text-white font-semibold">
              <Dumbbell className="h-4 w-4" />
              <span>Dumbbells</span>
            </span>
          </>
        )}
      </div>

      {reason && (
        <p className="mt-3 text-lg text-neutral-400 leading-snug max-w-lg">
          {reason}
        </p>
      )}

      {/* Target Reps Stepper */}
      <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-lg">
        <span className="text-neutral-400 uppercase tracking-wider">
          Target
        </span>

        <div className="inline-flex items-center rounded-lg border border-neutral-700 bg-neutral-950 p-0.5">
          <button
            type="button"
            onClick={() => onUpdateTargetReps(Math.max(1, targetReps - 1))}
            className="flex h-11 w-11 items-center justify-center rounded-md text-neutral-300 hover:text-white hover:bg-neutral-800 active:bg-neutral-800 transition-colors cursor-pointer"
            title="Decrease reps"
            aria-label="Decrease reps"
          >
            <Minus className="h-5 w-5" />
          </button>
          <span className="font-mono text-xl font-bold text-white tabular-nums px-4 min-w-[6.5rem] text-center">
            {targetReps} reps
          </span>
          <button
            type="button"
            onClick={() => onUpdateTargetReps(Math.min(100, targetReps + 1))}
            className="flex h-11 w-11 items-center justify-center rounded-md text-neutral-300 hover:text-white hover:bg-neutral-800 active:bg-neutral-800 transition-colors cursor-pointer"
            title="Increase reps"
            aria-label="Increase reps"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          type="button"
          onClick={() => onStart(workout)}
          className="inline-flex items-center justify-center gap-2.5 min-h-14 rounded-lg bg-white px-7 py-3.5 text-xl font-bold text-neutral-950 hover:bg-neutral-200 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Play className="h-5 w-5 fill-current ml-0.5" />
          Start Workout
        </button>

        <button
          type="button"
          onClick={() => onPreview(workout)}
          className="inline-flex items-center justify-center gap-2.5 min-h-14 rounded-lg border border-neutral-700 bg-neutral-950 px-5 py-3.5 text-lg font-semibold text-neutral-200 hover:border-white hover:text-white transition-colors cursor-pointer"
        >
          <List className="h-5 w-5" />
          View Routine
        </button>
      </div>
    </section>
  );
}
