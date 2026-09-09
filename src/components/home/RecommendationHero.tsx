import { Play, List, Sparkles, RotateCcw, Minus, Plus, TrendingUp } from 'lucide-react';
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

      {/* Target Reps Progression Bar with Manual Stepper Override */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-3 sm:px-4 sm:py-3 max-w-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-white">Target Reps</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-sky-400 bg-sky-500/10 border border-sky-500/20 rounded px-1.5 py-0.5 font-medium">
                +1 on completion
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-neutral-400">
              Standard set volume • Auto-advances each session
            </p>
          </div>
        </div>

        {/* Manual Stepper Controls */}
        <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800/90 rounded-xl p-1 shrink-0">
          <button
            type="button"
            onClick={() => onUpdateTargetReps(Math.max(1, targetReps - 1))}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all active:scale-90 cursor-pointer"
            title="Decrease target reps"
            aria-label="Decrease target reps"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="font-mono text-sm sm:text-base font-bold text-white tabular-nums px-2 min-w-[2.5rem] text-center">
            {targetReps}
          </span>
          <button
            type="button"
            onClick={() => onUpdateTargetReps(Math.min(100, targetReps + 1))}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all active:scale-90 cursor-pointer"
            title="Increase target reps"
            aria-label="Increase target reps"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Curated Collection of 3 Signature Exercises */}
      <div className="mt-8">
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-neutral-400 mb-3">
          <span>Featured Movements</span>
          <span>Phase 2 Preview</span>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {signatureSteps.map((step, idx) => (
            <div
              key={step.id}
              onClick={() => onPreview(workout)}
              className="group cursor-pointer flex flex-col rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-2 sm:p-3 hover:border-neutral-700 hover:bg-neutral-900/80 transition-all duration-300"
            >
              {/* Image container */}
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-neutral-950 flex items-center justify-center">
                <img
                  src={step.exercise.images[0]}
                  alt={step.exercise.name}
                  className="h-full w-full object-contain p-1.5 group-hover:scale-105 transition-transform duration-500 ease-out"
                  loading="eager"
                />
                <span className="absolute top-2 left-2 font-mono text-[10px] text-neutral-400 bg-neutral-950/70 rounded px-1.5 py-0.5">
                  0{idx + 1}
                </span>
              </div>

              {/* Caption */}
              <div className="mt-2.5 px-0.5 min-w-0">
                <h4 className="text-xs sm:text-sm font-medium text-white truncate group-hover:text-neutral-200 transition-colors">
                  {step.exercise.name}
                </h4>
                <p className="text-[11px] font-mono text-neutral-400 truncate mt-0.5">
                  {step.exercise.primaryMuscles[0] || 'Core'} • {step.exercise.type === 'reps' ? `${step.targetReps ?? targetReps} reps` : `${step.workDurationSeconds}s`}
                </p>
              </div>
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
