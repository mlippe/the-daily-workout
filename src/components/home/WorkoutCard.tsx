import { Play, Eye, Clock, ShieldAlert } from 'lucide-react';
import type { WorkoutPlan } from '../../types/workout';

interface WorkoutCardProps {
  workout: WorkoutPlan;
  isRecommended?: boolean;
  onStart: (workout: WorkoutPlan) => void;
  onPreview: (workout: WorkoutPlan) => void;
}

export function WorkoutCard({
  workout,
  isRecommended = false,
  onStart,
  onPreview,
}: WorkoutCardProps) {
  const getPillarBadge = () => {
    switch (workout.primaryPillar) {
      case 'push':
        return { label: 'Upper Push', color: 'border-amber-500/30 text-amber-400 bg-amber-500/10' };
      case 'pull_back':
        return { label: 'Back & Posture', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' };
      case 'legs':
        return { label: 'Lower Body', color: 'border-sky-500/30 text-sky-400 bg-sky-500/10' };
      case 'core':
        return { label: 'Core & Stability', color: 'border-purple-500/30 text-purple-400 bg-purple-500/10' };
      case 'full_body':
        return { label: 'Full Body', color: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10' };
    }
  };

  const badge = getPillarBadge();

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 hover:border-neutral-700 hover:bg-neutral-900/90 transition-all">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badge.color}`}>
            {badge.label}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-neutral-400 font-mono">
            <Clock className="h-3 w-3" />
            15m
          </span>
        </div>

        <h3 className="mt-3 text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
          {workout.title}
        </h3>
        <p className="mt-1 text-xs text-neutral-400 line-clamp-2">
          {workout.subtitle}
        </p>

        {workout.primaryPillar === 'pull_back' && (
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md px-2 py-0.5">
            <ShieldAlert className="h-3.5 w-3.5" />
            Posture Shield: Reverses desk slouch
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-1">
          {workout.targetMuscles.slice(0, 4).map((muscle) => (
            <span
              key={muscle}
              className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-300 capitalize"
            >
              {muscle}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 pt-3 border-t border-neutral-800/60">
        <button
          type="button"
          onClick={() => onStart(workout)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-neutral-800 px-3 py-2 text-xs font-semibold text-white hover:bg-white hover:text-neutral-950 transition-colors"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          Start {isRecommended && '★'}
        </button>
        <button
          type="button"
          onClick={() => onPreview(workout)}
          className="inline-flex items-center justify-center rounded-xl border border-neutral-800 p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          title="Preview movements"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
