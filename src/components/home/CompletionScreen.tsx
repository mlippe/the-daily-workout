import { Award, CheckCircle, Clock, Flame, Home, Dumbbell } from 'lucide-react';
import type { WorkoutPlan } from '../../types/workout';

interface CompletionScreenProps {
  workout: WorkoutPlan;
  streak: number;
  totalCompleted: number;
  onReturnHome: () => void;
}

export function CompletionScreen({
  workout,
  streak,
  totalCompleted,
  onReturnHome,
}: CompletionScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-950 text-white">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 sm:p-8 text-center shadow-2xl relative">
        {/* Glow backdrop */}
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />

        {/* Big Celebration Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
          <CheckCircle className="h-10 w-10 animate-bounce" />
        </div>

        <span className="mt-4 inline-block rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
          Workout Complete
        </span>

        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
          Great Work!
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          You completed today's 15-minute {workout.title}.
        </p>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4 text-left">
            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
              <Clock className="h-3.5 w-3.5 text-sky-400" />
              Duration
            </div>
            <div className="mt-1 text-2xl font-bold font-mono text-white">15:00</div>
            <div className="text-[11px] text-neutral-500">Goal achieved</div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4 text-left">
            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
              <Flame className="h-3.5 w-3.5 text-orange-400" />
              Streak
            </div>
            <div className="mt-1 text-2xl font-bold font-mono text-white">{streak} Days</div>
            <div className="text-[11px] text-neutral-500">{totalCompleted} total sessions</div>
          </div>
        </div>

        {/* Muscles Targeted */}
        <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4 text-left">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-2">
            <Dumbbell className="h-3.5 w-3.5 text-indigo-400" />
            Muscles Stimulated Today
          </div>
          <div className="flex flex-wrap gap-1.5">
            {workout.targetMuscles.map((muscle) => (
              <span
                key={muscle}
                className="rounded-md bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300 capitalize"
              >
                {muscle}
              </span>
            ))}
          </div>
        </div>

        {/* Posture badge if pull/back */}
        {workout.primaryPillar === 'pull_back' && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-left text-xs text-emerald-300">
            <Award className="h-5 w-5 shrink-0 text-emerald-400" />
            <span>Posture protected: You gave your posterior chain and back muscles the care they needed today.</span>
          </div>
        )}

        {/* Home Button */}
        <button
          type="button"
          onClick={onReturnHome}
          className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-bold text-neutral-950 hover:bg-neutral-200 active:scale-95 transition-all shadow-lg"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </button>
      </div>
    </div>
  );
}
