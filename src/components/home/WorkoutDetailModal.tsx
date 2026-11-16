import { X, Play, Dumbbell } from 'lucide-react';
import type { WorkoutPlan, WorkoutStep } from '../../types/workout';

interface WorkoutDetailModalProps {
  workout: WorkoutPlan;
  isOpen: boolean;
  onClose: () => void;
  onStart: (workout: WorkoutPlan) => void;
}

export function WorkoutDetailModal({ workout, isOpen, onClose, onStart }: WorkoutDetailModalProps) {
  if (!isOpen) return null;

  const warmupSteps = workout.steps.filter((s) => s.phase === 'warmup');
  const mainSteps = workout.steps.filter(
    (s) => s.phase === 'main' && s.round === 1 && !s.isRest,
  );
  const cooldownSteps = workout.steps.filter((s) => s.phase === 'cooldown');
  const hasRest = workout.steps.some((s) => s.isRest);

  const durationMin = Math.round(workout.totalDurationSeconds / 60);

  const renderExerciseRow = (step: WorkoutStep, index: number) => (
    <div
      key={step.id}
      className="flex items-center gap-3 py-2.5 border-b border-neutral-900 last:border-0"
    >
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-neutral-900 border border-neutral-800">
        <img
          src={step.exercise.images[0]}
          alt=""
          className="h-full w-full object-contain p-0.5"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-base font-semibold text-white truncate">
              {index + 1}. {step.exercise.name}
            </span>
            {step.side && (
              <span className="text-xs font-mono text-amber-400 shrink-0">
                ({step.side === 'right' ? 'R' : 'L'})
              </span>
            )}
          </div>
          <span className="font-mono text-sm sm:text-base font-semibold text-neutral-300 shrink-0 pl-2 tabular-nums">
            {step.exercise.type === 'reps'
              ? `${step.targetReps ?? 10}r`
              : `${step.workDurationSeconds}s`}
          </span>
        </div>
        <div className="text-xs sm:text-sm text-neutral-500 truncate capitalize">
          {step.exercise.primaryMuscles.join(', ')}
          {step.exercise.equipment === 'dumbbell' ? ' • Dumbbell' : ''}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90dvh] w-full max-w-md flex-col rounded-lg border border-neutral-800 bg-neutral-950 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-4 sm:p-5 border-b border-neutral-900">
          <div className="min-w-0">
            <div className="font-mono text-xs uppercase tracking-widest text-neutral-400">
              Overview • {durationMin} Min • {workout.difficulty}
            </div>
            <h3 className="mt-1 text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
              {workout.title}
            </h3>
            <p className="mt-1 text-sm text-neutral-400 leading-relaxed">
              {workout.subtitle}
            </p>
            {workout.requiresDumbbells && (
              <div className="mt-2 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-neutral-200">
                <Dumbbell className="h-3.5 w-3.5" />
                <span>Requires dumbbells</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 -mt-1 -mr-1 items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Exercises Scroll View */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3 space-y-5">
          {/* Phase 1: Warm-up */}
          <div>
            <div className="flex items-center justify-between font-mono text-xs font-semibold uppercase tracking-widest text-neutral-400 pb-1.5 border-b border-neutral-900">
              <span>Warm-Up</span>
              <span>2 Min</span>
            </div>
            <div className="divide-y divide-neutral-900/60">
              {warmupSteps.map((step, idx) => renderExerciseRow(step, idx))}
            </div>
          </div>

          {/* Phase 2: Main Circuit */}
          <div>
            <div className="flex items-center justify-between font-mono text-xs font-semibold uppercase tracking-widest text-neutral-400 pb-1.5 border-b border-neutral-900">
              <span>Main Circuit (2×)</span>
              <span>8 Min</span>
            </div>
            <div className="divide-y divide-neutral-900/60">
              {mainSteps.map((step, idx) => renderExerciseRow(step, idx))}
            </div>
            {hasRest && (
              <div className="mt-2 flex items-center justify-between text-xs sm:text-sm font-mono text-neutral-400 py-1.5 border-t border-dashed border-neutral-800">
                <span>Inter-Round Recovery</span>
                <span className="tabular-nums">20s</span>
              </div>
            )}
          </div>

          {/* Phase 3: Cool-down */}
          <div>
            <div className="flex items-center justify-between font-mono text-xs font-semibold uppercase tracking-widest text-neutral-400 pb-1.5 border-b border-neutral-900">
              <span>Cool-Down</span>
              <span>2 Min</span>
            </div>
            <div className="divide-y divide-neutral-900/60">
              {cooldownSteps.map((step, idx) => renderExerciseRow(step, idx))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-900 bg-neutral-950 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 px-4 py-2 rounded-lg text-sm sm:text-base font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onStart(workout);
            }}
            className="inline-flex items-center justify-center gap-2 min-h-11 rounded-lg bg-white px-5 py-2.5 text-sm sm:text-base font-bold text-neutral-950 hover:bg-neutral-200 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="h-4 w-4 fill-current ml-0.5" />
            Start Workout
          </button>
        </div>
      </div>
    </div>
  );
}
