import { Play, List } from 'lucide-react';
import type { WorkoutPlan } from '../../types/workout';

interface RecommendationHeroProps {
  workout: WorkoutPlan;
  reason: string;
  onStart: (workout: WorkoutPlan) => void;
  onPreview: (workout: WorkoutPlan) => void;
}

export function RecommendationHero({
  workout,
  reason,
  onStart,
  onPreview,
}: RecommendationHeroProps) {
  return (
    <section className="py-10 sm:py-16">
      <div className="max-w-xl">
        {/* Subtle kicker */}
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-neutral-400">
          <span>Today's Focus</span>
          <span>•</span>
          <span>15 Minutes</span>
        </div>

        {/* Large, confident display title */}
        <h2 className="mt-3 text-3xl sm:text-5xl font-semibold tracking-tight text-white">
          {workout.title}
        </h2>

        {/* Quiet rationale */}
        <p className="mt-4 text-base sm:text-lg text-neutral-300 leading-relaxed">
          {workout.subtitle}
        </p>

        {reason && (
          <p className="mt-2 text-xs sm:text-sm text-neutral-400">
            {reason}
          </p>
        )}

        {/* Target muscle line */}
        <div className="mt-4 text-xs font-mono text-neutral-400">
          Target: {workout.targetMuscles.slice(0, 5).join(' • ')}
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => onStart(workout)}
            className="inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-neutral-950 hover:bg-neutral-200 active:scale-[0.98] transition-all"
          >
            <Play className="h-4 w-4 fill-current ml-0.5" />
            Start Workout
          </button>

          <button
            type="button"
            onClick={() => onPreview(workout)}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-800 px-5 py-3.5 text-sm font-medium text-neutral-400 hover:border-neutral-700 hover:text-white transition-colors"
          >
            <List className="h-4 w-4" />
            View 13 exercises
          </button>
        </div>
      </div>
    </section>
  );
}
