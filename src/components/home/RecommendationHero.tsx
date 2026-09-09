import { Play, List, Sparkles, RotateCcw, Minus, Plus } from 'lucide-react';
import type { WorkoutPlan } from '../../types/workout';

interface RecommendationHeroProps {
  workout: WorkoutPlan;
  isRecommended: boolean;
  reason: string;
  recommendedWorkoutTitle?: string;
  targetReps: number;
  onUpdateTargetReps: (reps: number) => void;
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
  onResetToRecommended,
  onStart,
  onPreview,
}: RecommendationHeroProps) {
  // Extract 3 signature movements from the main circuit
  const signatureSteps = workout.steps
    .filter((s) => s.phase === 'main' && s.round === 1)
    .slice(0, 3);

  return (
    <section className="py-8 sm:py-12">
      {/* Subtle kicker & recommended status */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-neutral-400">
          {isRecommended ? (
            <>
              <span className="inline-flex items-center gap-1 text-white font-semibold">
                <Sparkles className="h-3 w-3 text-amber-300" />
                Today's Recommendation
              </span>
              <span>•</span>
              <span>15 Minutes</span>
            </>
          ) : (
            <>
              <span className="text-neutral-300">Selected Routine</span>
              <span>•</span>
              <span>15 Minutes</span>
            </>
          )}
        </div>

        {/* Quick button to return to recommendation if viewing custom workout */}
        {!isRecommended && onResetToRecommended && recommendedWorkoutTitle && (
          <button
            type="button"
            onClick={onResetToRecommended}
            className="inline-flex items-center gap-1.5 font-mono text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Back to recommendation ({recommendedWorkoutTitle})</span>
          </button>
        )}
      </div>

      {/* Large, confident display title */}
      <h2 className="mt-2 text-3xl sm:text-5xl font-semibold tracking-tight text-white">
        {workout.title}
      </h2>

      {/* Rationale / subtitle */}
      <p className="mt-3 text-base sm:text-lg text-neutral-300 leading-relaxed max-w-xl">
        {workout.subtitle}
      </p>

      {reason && (
        <p className="mt-1.5 text-xs sm:text-sm text-neutral-400 max-w-lg">
          {reason}
        </p>
      )}

      {/* Minimal Target Reps Control */}
      <div className="mt-5 flex flex-wrap items-center gap-2.5 font-mono text-xs">
        <span className="text-neutral-400 uppercase tracking-wider text-[11px]">
          Target Reps
        </span>

        <div className="inline-flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900/90 px-2 py-0.5 shadow-sm">
          <button
            type="button"
            onClick={() => onUpdateTargetReps(Math.max(1, targetReps - 1))}
            className="flex h-5 w-5 items-center justify-center rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all active:scale-90 cursor-pointer"
            title="Decrease target reps"
            aria-label="Decrease target reps"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="font-mono text-xs font-bold text-white tabular-nums px-1.5 min-w-[1.5rem] text-center">
            {targetReps}
          </span>
          <button
            type="button"
            onClick={() => onUpdateTargetReps(Math.min(100, targetReps + 1))}
            className="flex h-5 w-5 items-center justify-center rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all active:scale-90 cursor-pointer"
            title="Increase target reps"
            aria-label="Increase target reps"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        <span className="text-neutral-500 text-[11px]">
          (automatically +1 on each completion)
        </span>
      </div>

      {/* 3 Signature Exercise Previews: Image-Heavy & Designy */}
      <div className="mt-8">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {signatureSteps.map((step, idx) => (
            <div
              key={step.id}
              onClick={() => onPreview(workout)}
              className="group relative aspect-3/2 w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-neutral-900 cursor-pointer shadow-xl transition-all duration-300 hover:shadow-2xl hover:ring-1 hover:ring-white/20 active:scale-[0.98]"
              title={`View ${step.exercise.name} details`}
            >
              <img
                src={step.exercise.images[0]}
                alt={step.exercise.name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-50 group-hover:opacity-20 transition-opacity" />
              <span className="absolute bottom-2 left-2.5 sm:bottom-3 sm:left-3 font-mono text-[10px] sm:text-xs font-semibold text-neutral-300/80 tracking-wider">
                0{idx + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Primary Actions */}
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => onStart(workout)}
          className="inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-neutral-950 hover:bg-neutral-200 active:scale-[0.98] transition-all shadow-lg"
        >
          <Play className="h-4 w-4 fill-current ml-0.5" />
          Start 15-Min Workout
        </button>

        <button
          type="button"
          onClick={() => onPreview(workout)}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-800 px-5 py-3.5 text-sm font-medium text-neutral-400 hover:border-neutral-700 hover:text-white transition-colors"
        >
          <List className="h-4 w-4" />
          View all 13 movements
        </button>
      </div>
    </section>
  );
}
