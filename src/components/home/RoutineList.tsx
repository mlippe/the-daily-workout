import { Play } from 'lucide-react';
import type { WorkoutPlan } from '../../types/workout';
import { DEFAULT_TARGET_REPS } from '../../utils/storage';

interface RoutineListProps {
  workouts: WorkoutPlan[];
  activeWorkoutId: string;
  recommendedWorkoutId: string;
  activePillar?: string;
  recommendedPillar?: string;
  repTargets?: Record<string, number>;
  onSelect: (workout: WorkoutPlan) => void;
  onStart: (workout: WorkoutPlan) => void;
}

export function RoutineList({
  workouts,
  activeWorkoutId,
  recommendedWorkoutId,
  activePillar,
  recommendedPillar,
  repTargets,
  onSelect,
  onStart,
}: RoutineListProps) {
  return (
    <section className="pt-8 pb-16 border-t border-neutral-900">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-400">
          Routines
        </h2>
        <span className="font-mono text-[11px] text-neutral-500">
          {workouts.length} total
        </span>
      </div>

      <div className="divide-y divide-neutral-900 border-y border-neutral-900">
        {workouts.map((w) => {
          const isSelected =
            w.id === activeWorkoutId || (Boolean(activePillar) && w.primaryPillar === activePillar);
          const isRecommended =
            w.id === recommendedWorkoutId ||
            (Boolean(recommendedPillar) && w.primaryPillar === recommendedPillar);

          const durationMin = Math.round(w.totalDurationSeconds / 60);
          const reps = repTargets?.[w.primaryPillar] ?? repTargets?.[w.id] ?? DEFAULT_TARGET_REPS;

          return (
            <div
              key={w.id}
              onClick={() => onSelect(w)}
              className={`group flex items-center justify-between py-3.5 px-3 -mx-3 rounded-lg transition-colors cursor-pointer ${
                isSelected ? 'bg-neutral-900/70' : 'hover:bg-neutral-900/30'
              }`}
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium transition-colors truncate ${
                      isSelected ? 'text-white' : 'text-neutral-300 group-hover:text-white'
                    }`}
                  >
                    {w.title}
                  </span>
                  {isRecommended && (
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                      (Recommended)
                    </span>
                  )}
                </div>

                <p className="text-xs text-neutral-500 mt-0.5 truncate">
                  {w.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-xs text-neutral-400 tabular-nums">
                  {durationMin}m • {reps}r
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStart(w);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                  title={`Start ${w.title}`}
                  aria-label={`Start ${w.title}`}
                >
                  <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
