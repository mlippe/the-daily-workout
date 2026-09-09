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
  const mainSteps = workout.steps.filter((s) => s.phase === 'main' && s.round === 1);
  const cooldownSteps = workout.steps.filter((s) => s.phase === 'cooldown');

  const renderExerciseRow = (step: WorkoutStep, index: number) => (
    <div
      key={step.id}
      className="flex items-center gap-3 py-2.5 border-b border-neutral-900 last:border-0"
    >
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-neutral-900">
        <img
          src={step.exercise.images[0]}
          alt=""
          className="h-full w-full object-contain p-1"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white truncate">
            {index + 1}. {step.exercise.name}
          </span>
          <span className="font-mono text-xs text-neutral-400 shrink-0 pl-2">
            {step.exercise.type === 'reps' ? `${step.targetReps ?? 12} reps` : `${step.workDurationSeconds}s`}
          </span>
        </div>
        <div className="text-xs text-neutral-400 truncate">
          {step.exercise.primaryMuscles.join(', ')}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-md flex-col rounded-3xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-neutral-900">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">
              Routine Overview • 15 Min
            </div>
            <h3 className="mt-1 text-2xl font-semibold text-white tracking-tight">
              {workout.title}
            </h3>
            <p className="mt-1 text-xs text-neutral-400">
              {workout.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Exercises Scroll View */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Phase 1: Warm-up */}
          <div>
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-neutral-400 pb-2 border-b border-neutral-900">
              <span>Phase 1 • Warm-Up</span>
              <span>2.5 Min</span>
            </div>
            <div className="divide-y divide-neutral-900/60">
              {warmupSteps.map((step, idx) => renderExerciseRow(step, idx))}
            </div>
          </div>

          {/* Phase 2: Main Circuit */}
          <div>
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-neutral-400 pb-2 border-b border-neutral-900">
              <span>Phase 2 • Main Circuit (2 Rounds)</span>
              <span>10 Min</span>
            </div>
            <div className="divide-y divide-neutral-900/60">
              {mainSteps.map((step, idx) => renderExerciseRow(step, idx))}
            </div>
          </div>

          {/* Phase 3: Cool-down */}
          <div>
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-neutral-400 pb-2 border-b border-neutral-900">
              <span>Phase 3 • Cool-Down</span>
              <span>2.5 Min</span>
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
            className="px-4 py-2.5 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onStart(workout);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-xs font-semibold text-neutral-950 hover:bg-neutral-200 active:scale-95 transition-all"
          >
            <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
            Start Workout
          </button>
        </div>
      </div>
    </div>
  );
}
