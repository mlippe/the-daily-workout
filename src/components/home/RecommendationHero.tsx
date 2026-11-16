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
      {/* Quiet kicker bar */}
      <div className="flex items-center justify-between gap-2 text-xs font-mono uppercase tracking-widest text-neutral-400">
        <span className="text-neutral-300 font-semibold truncate">
          {isRecommended ? "Today's Focus" : 'Selected Routine'}
        </span>

        <div className="flex items-center gap-1 shrink-0">
          {onShuffleVariation && (
            <button
              type="button"
              onClick={onShuffleVariation}
              className="inline-flex items-center gap-1.5 min-h-9 px-2.5 rounded-lg text-xs text-neutral-400 hover:text-white hover:bg-neutral-900/60 transition-colors cursor-pointer"
              title="Shuffle variation"
            >
              <Shuffle className="h-3.5 w-3.5" />
              <span>Shuffle</span>
            </button>
          )}

          {!isRecommended && onResetToRecommended && recommendedWorkoutTitle && (
            <button
              type="button"
              onClick={onResetToRecommended}
              className="inline-flex items-center gap-1.5 min-h-9 px-2.5 -mr-2.5 rounded-lg text-xs text-neutral-400 hover:text-white hover:bg-neutral-900/60 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Routine Title — strong focal weight */}
      <h1 className="mt-3 text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-white leading-[1.03]">
        {workout.title}
      </h1>

      {/* Description */}
      <p className="mt-2.5 text-base sm:text-lg text-neutral-300 leading-relaxed max-w-xl">
        {workout.subtitle}
      </p>

      {/* Quiet Specs Line */}
      <div className="mt-3.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-xs sm:text-sm uppercase tracking-wider text-neutral-400">
        <span>{durationMinutes} Min</span>
        <span className="text-neutral-700">/</span>
        <span>{workout.difficulty}</span>
        {workout.requiresDumbbells && (
          <>
            <span className="text-neutral-700">/</span>
            <span className="inline-flex items-center gap-1 text-neutral-200">
              <Dumbbell className="h-3.5 w-3.5" />
              <span>Dumbbells</span>
            </span>
          </>
        )}
      </div>

      {reason && (
        <p className="mt-2.5 text-sm text-neutral-500 leading-relaxed max-w-lg">
          {reason}
        </p>
      )}

      {/* Target Reps Stepper */}
      <div className="mt-6 flex items-center gap-3 font-mono">
        <span className="text-xs uppercase tracking-widest text-neutral-400">
          Target
        </span>

        <div className="inline-flex items-center rounded-lg border border-neutral-800 bg-neutral-950 p-0.5">
          <button
            type="button"
            onClick={() => onUpdateTargetReps(Math.max(1, targetReps - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 active:bg-neutral-800 transition-colors cursor-pointer"
            title="Decrease reps"
            aria-label="Decrease reps"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="font-mono text-base font-bold text-white tabular-nums px-3 min-w-[5.5rem] text-center">
            {targetReps} reps
          </span>
          <button
            type="button"
            onClick={() => onUpdateTargetReps(Math.min(100, targetReps + 1))}
            className="flex h-10 w-10 items-center justify-center rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 active:bg-neutral-800 transition-colors cursor-pointer"
            title="Increase reps"
            aria-label="Increase reps"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          type="button"
          onClick={() => onStart(workout)}
          className="inline-flex items-center justify-center gap-2 min-h-13 rounded-lg bg-white px-6 py-3 text-base sm:text-lg font-bold text-neutral-950 hover:bg-neutral-200 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Play className="h-4 w-4 fill-current ml-0.5" />
          Start Workout
        </button>

        <button
          type="button"
          onClick={() => onPreview(workout)}
          className="inline-flex items-center justify-center gap-2 min-h-13 rounded-lg border border-neutral-800 bg-neutral-950 px-5 py-3 text-base font-medium text-neutral-300 hover:border-neutral-600 hover:text-white transition-colors cursor-pointer"
        >
          <List className="h-4 w-4" />
          View Routine
        </button>
      </div>
    </section>
  );
}
