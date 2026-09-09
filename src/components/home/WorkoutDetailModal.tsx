import { X, Play, Clock, Dumbbell } from 'lucide-react';
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
      className="flex items-center gap-3 rounded-xl bg-neutral-900/80 border border-neutral-800 p-2.5"
    >
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-950">
        <img
          src={step.exercise.images[0]}
          alt={step.exercise.name}
          className="h-full w-full object-contain p-1"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white truncate">
            {index + 1}. {step.exercise.name}
          </span>
          <span className="font-mono text-[11px] text-neutral-400">
            {step.workDurationSeconds}s
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[10px] text-neutral-400">
          <span className="truncate">{step.exercise.primaryMuscles.join(', ')}</span>
          {step.targetReps && <span>• {step.targetReps} reps</span>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-neutral-800 p-5 bg-neutral-900/50">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              <Dumbbell className="h-3.5 w-3.5" />
              15-Minute Workout Blueprint
            </div>
            <h3 className="mt-1 text-xl font-extrabold text-white">{workout.title}</h3>
            <p className="text-xs text-neutral-400">{workout.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Exercises Scroll View */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Phase 1: Warm-up */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
              <span>Phase 1: Dynamic Warm-Up (2.5 Min)</span>
              <span>4 Moves</span>
            </div>
            <div className="space-y-2">
              {warmupSteps.map((step, idx) => renderExerciseRow(step, idx))}
            </div>
          </div>

          {/* Phase 2: Main Circuit */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">
              <span>Phase 2: Main Circuit (10 Min • 2 Rounds)</span>
              <span>5 Moves × 2</span>
            </div>
            <div className="space-y-2">
              {mainSteps.map((step, idx) => renderExerciseRow(step, idx))}
            </div>
          </div>

          {/* Phase 3: Cool-down */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">
              <span>Phase 3: Static Cool-Down (2.5 Min)</span>
              <span>4 Stretches</span>
            </div>
            <div className="space-y-2">
              {cooldownSteps.map((step, idx) => renderExerciseRow(step, idx))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-neutral-800 p-4 bg-neutral-900/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Clock className="h-4 w-4" />
            <span>Strictly 15:00 Total</span>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onStart(workout);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-neutral-950 shadow hover:bg-neutral-100 active:scale-95 transition-all"
          >
            <Play className="h-4 w-4 fill-current" />
            Start This Workout
          </button>
        </div>
      </div>
    </div>
  );
}
