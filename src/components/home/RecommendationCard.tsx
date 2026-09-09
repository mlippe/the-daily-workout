import { Play, Sparkles, Clock, Eye, Layers } from 'lucide-react';
import type { WorkoutPlan } from '../../types/workout';

interface RecommendationCardProps {
  workout: WorkoutPlan;
  reason: string;
  onStart: (workout: WorkoutPlan) => void;
  onPreview: (workout: WorkoutPlan) => void;
}

export function RecommendationCard({
  workout,
  reason,
  onStart,
  onPreview,
}: RecommendationCardProps) {
  const getPillarColor = () => {
    switch (workout.primaryPillar) {
      case 'push':
        return 'from-amber-500/20 via-orange-500/10 to-transparent border-amber-500/30 text-amber-400';
      case 'pull_back':
        return 'from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-500/30 text-emerald-400';
      case 'legs':
        return 'from-sky-500/20 via-blue-500/10 to-transparent border-sky-500/30 text-sky-400';
      case 'core':
        return 'from-purple-500/20 via-pink-500/10 to-transparent border-purple-500/30 text-purple-400';
      case 'full_body':
        return 'from-indigo-500/20 via-purple-500/10 to-transparent border-indigo-500/30 text-indigo-400';
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br p-6 sm:p-8 shadow-2xl ${getPillarColor()}`}>
      {/* Background glow circle */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

      {/* Header tags */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          Today's Recommendation
        </span>

        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900/80 px-2.5 py-1 text-xs font-medium text-neutral-300">
          <Clock className="h-3.5 w-3.5 text-neutral-400" />
          Strictly 15 Minutes
        </span>

        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900/80 px-2.5 py-1 text-xs font-medium text-neutral-300">
          <Layers className="h-3.5 w-3.5 text-neutral-400" />
          13 Movements (2 Rounds)
        </span>
      </div>

      {/* Reason banner */}
      <div className="mt-4 inline-block rounded-lg bg-neutral-900/90 border border-neutral-800 px-3 py-1 text-xs text-neutral-300">
        💡 <span className="font-semibold text-neutral-200">Why this routine:</span> {reason}
      </div>

      {/* Workout title and description */}
      <div className="mt-3">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          {workout.title}
        </h2>
        <p className="mt-1 text-sm sm:text-base text-neutral-300">
          {workout.description}
        </p>
      </div>

      {/* Target muscles list */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {workout.targetMuscles.slice(0, 6).map((muscle) => (
          <span
            key={muscle}
            className="rounded-md bg-neutral-900/70 border border-neutral-800 px-2 py-0.5 text-xs text-neutral-300 capitalize"
          >
            {muscle}
          </span>
        ))}
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => onStart(workout)}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-neutral-950 shadow-xl hover:bg-neutral-100 active:scale-95 transition-all"
        >
          <Play className="h-4 w-4 fill-current" />
          Start 15-Minute Workout
        </button>

        <button
          type="button"
          onClick={() => onPreview(workout)}
          className="inline-flex items-center gap-2 rounded-2xl bg-neutral-900/80 border border-neutral-800 px-4 py-3.5 text-sm font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
        >
          <Eye className="h-4 w-4" />
          Preview Exercises
        </button>
      </div>
    </div>
  );
}
