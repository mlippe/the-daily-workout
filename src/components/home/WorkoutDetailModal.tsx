import { X, Play } from 'lucide-react';
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
      className="flex items-center gap-3 py-2 border-b border-neutral-900 last:border-0"
    >
      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-neutral-900 border border-neutral-800">
        <img
          src={step.exercise.images[0]}
          alt=""
          className="h-full w-full object-contain p-0.5"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-medium text-white truncate">
              {index + 1}. {step.exercise.name}
            </span>
            {step.side && (
              <span className="text-[10px] font-mono text-neutral-400">
                ({step.side === 'right' ? 'R' : 'L'})
              </span>
            )}
          </div>
          <span className="font-mono text-xs text-neutral-400 shrink-0 pl-2 tabular-nums">
            {step.exercise.type === 'reps'
              ? `${step.targetReps ?? 10} reps`
              : `${step.workDurationSeconds}s`}
          </span>
        </div>
        <div className="text-[11px] text-neutral-500 truncate">
          {step.exercise.primaryMuscles.join(', ')}
          {step.exercise.equipment === 'dumbbell' ? ' • Dumbbell' : ''}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-md flex-col rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-neutral-900">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">
              Overview • {durationMin} Min • {workout.difficulty}
              {workout.requiresDumbbells ? ' • Dumbbells' : ''}
            </div>
            <h3 className="mt-1 text-xl font-semibold text-white tracking-tight">
              {workout.title}
            </h3>
            <p className="mt-0.5 text-xs text-neutral-400">
              {workout.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Exercises Scroll View */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-5">
          {/* Phase 1: Warm-up */}
          <div>
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-neutral-400 pb-1.5 border-b border-neutral-900">
              <span>Warm-Up</span>
              <span>2 Min</span>
            </div>
            <div className="divide-y divide-neutral-900/60">
              {warmupSteps.map((step, idx) => renderExerciseRow(step, idx))}
            </div>
          </div>

          {/* Phase 2: Main Circuit */}
          <div>
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-neutral-400 pb-1.5 border-b border-neutral-900">
              <span>Main Circuit (2 Rounds)</span>
              <span>8 Min</span>
            </div>
            <div className="divide-y divide-neutral-900/60">
              {mainSteps.map((step, idx) => renderExerciseRow(step, idx))}
            </div>
            {hasRest && (
              <div className="mt-2 flex items-center justify-between text-xs font-mono text-neutral-400 py-1.5 border-t border-dashed border-neutral-800">
                <span>Inter-Round Recovery</span>
                <span>20s</span>
              </div>
            )}
          </div>

          {/* Phase 3: Cool-down */}
          <div>
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-neutral-400 pb-1.5 border-b border-neutral-900">
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
            className="px-3 py-2 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onStart(workout);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-neutral-950 hover:bg-neutral-200 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
            Start Workout
          </button>
        </div>
      </div>
    </div>
  );
}
