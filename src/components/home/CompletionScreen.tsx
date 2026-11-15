import { Check, ArrowLeft } from 'lucide-react';
import type { WorkoutPlan } from '../../types/workout';

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

interface CompletionScreenProps {
  workout: WorkoutPlan;
  streak: number;
  totalCompleted: number;
  nextTargetReps?: number;
  onReturnHome: () => void;
}

export function CompletionScreen({
  workout,
  streak,
  totalCompleted,
  nextTargetReps,
  onReturnHome,
}: CompletionScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black text-white">
      <div className="w-full max-w-sm text-center">
        {/* Simple Checkmark */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 text-white">
          <Check className="h-5 w-5" />
        </div>

        <div className="mt-5 font-mono text-[11px] uppercase tracking-widest text-neutral-400">
          {formatTime(workout.totalDurationSeconds)} Completed
        </div>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
          {workout.title}
        </h1>

        <p className="mt-1.5 text-xs text-neutral-400 leading-relaxed">
          {workout.subtitle}
        </p>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 divide-x divide-neutral-900 border-y border-neutral-900 py-3 font-mono text-center">
          <div>
            <div className="text-lg font-semibold text-white tabular-nums">{streak}</div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider mt-0.5">
              Streak
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-white tabular-nums">{totalCompleted}</div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider mt-0.5">
              Done
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-white tabular-nums">
              {nextTargetReps ?? 10}
            </div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider mt-0.5">
              Next Reps
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="mt-8">
          <button
            type="button"
            onClick={onReturnHome}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-neutral-950 hover:bg-neutral-200 active:scale-[0.98] transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
}
