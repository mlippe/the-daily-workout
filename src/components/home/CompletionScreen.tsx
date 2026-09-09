import { Check, ArrowLeft } from 'lucide-react';
import type { WorkoutPlan } from '../../types/workout';

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
        {/* Subtle Checkmark */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900/50 text-white">
          <Check className="h-6 w-6" />
        </div>

        <div className="mt-6 font-mono text-[11px] uppercase tracking-widest text-neutral-400">
          15:00 Completed
        </div>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          {workout.title}
        </h1>

        <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
          {workout.subtitle}
        </p>

        {/* Minimal stats block */}
        <div
          className={`mt-8 grid ${
            nextTargetReps ? 'grid-cols-3' : 'grid-cols-2'
          } divide-x divide-neutral-900 border-y border-neutral-900 py-4 font-mono text-center`}
        >
          <div>
            <div className="text-xl font-semibold text-white">{streak}</div>
            <div className="text-[11px] text-neutral-400 uppercase tracking-wider mt-0.5">
              Day Streak
            </div>
          </div>
          <div>
            <div className="text-xl font-semibold text-white">{totalCompleted}</div>
            <div className="text-[11px] text-neutral-400 uppercase tracking-wider mt-0.5">
              Total Done
            </div>
          </div>
          {nextTargetReps && (
            <div>
              <div className="text-xl font-semibold text-emerald-400 flex items-center justify-center gap-1">
                <span>{nextTargetReps}</span>
                <span className="text-[11px] text-emerald-500/80 font-normal">(+1)</span>
              </div>
              <div className="text-[11px] text-neutral-400 uppercase tracking-wider mt-0.5">
                Next Reps
              </div>
            </div>
          )}
        </div>

        {nextTargetReps && (
          <div className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3.5 py-1">
            <span>Progression auto-advanced to {nextTargetReps} reps for next session!</span>
          </div>
        )}

        {/* Muscles line */}
        <div className="mt-6 text-xs text-neutral-400">
          Targeted: {workout.targetMuscles.slice(0, 4).join(', ')}
        </div>

        {/* Back home action */}
        <div className="mt-10">
          <button
            type="button"
            onClick={onReturnHome}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-medium text-neutral-950 hover:bg-neutral-200 active:scale-[0.98] transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
