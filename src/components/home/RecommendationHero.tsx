import { Play, List, Minus, Plus, Shuffle, RotateCcw } from 'lucide-react';
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
    <section className="py-8 sm:py-10">
      {/* Category / kicker line */}
      <div className="flex items-center justify-between gap-3 text-xs font-mono uppercase tracking-widest text-neutral-400">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-neutral-300 font-semibold">
            {isRecommended ? "Today's Focus" : 'Selected Routine'}
          </span>
          <span>•</span>
          <span>{durationMinutes} Min</span>
          <span>•</span>
          <span>{workout.difficulty}</span>
          {workout.requiresDumbbells && (
            <>
              <span>•</span>
              <span className="text-neutral-200">Dumbbells</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {onShuffleVariation && (
            <button
              type="button"
              onClick={onShuffleVariation}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
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
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Routine Title */}
      <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white leading-tight">
        {workout.title}
      </h1>

      {/* Description */}
      <p className="mt-2 text-base text-neutral-300 leading-relaxed max-w-xl">
        {workout.subtitle}
      </p>

      {reason && (
        <p className="mt-1 text-xs text-neutral-500 max-w-lg">
          {reason}
        </p>
      )}

      {/* Target Reps Stepper */}
      <div className="mt-6 flex items-center gap-3 font-mono text-xs">
        <span className="text-neutral-400 uppercase tracking-wider text-[11px]">
          Target
        </span>

        <div className="inline-flex items-center rounded-lg border border-neutral-800 bg-neutral-900 px-1 py-0.5">
          <button
            type="button"
            onClick={() => onUpdateTargetReps(Math.max(1, targetReps - 1))}
            className="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Decrease reps"
            aria-label="Decrease reps"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="font-mono text-xs font-semibold text-white tabular-nums px-2 min-w-[2.5rem] text-center">
            {targetReps} reps
          </span>
          <button
            type="button"
            onClick={() => onUpdateTargetReps(Math.min(100, targetReps + 1))}
            className="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Increase reps"
            aria-label="Increase reps"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => onStart(workout)}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-neutral-950 hover:bg-neutral-200 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Play className="h-4 w-4 fill-current ml-0.5" />
          Start Workout
        </button>

        <button
          type="button"
          onClick={() => onPreview(workout)}
          className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-3 text-sm font-medium text-neutral-300 hover:border-neutral-700 hover:text-white transition-colors cursor-pointer"
        >
          <List className="h-4 w-4" />
          View Routine
        </button>
      </div>
    </section>
  );
}
