import { ArrowRight, Play } from 'lucide-react';
import type { WorkoutPlan } from '../../types/workout';

interface RoutineListProps {
  workouts: WorkoutPlan[];
  activeWorkoutId: string;
  onSelect: (workout: WorkoutPlan) => void;
  onStart: (workout: WorkoutPlan) => void;
}

export function RoutineList({
  workouts,
  activeWorkoutId,
  onSelect,
  onStart,
}: RoutineListProps) {
  return (
    <section className="pt-8 pb-16 border-t border-neutral-900">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-mono text-xs uppercase tracking-widest text-neutral-400">
          All 15-Minute Routines
        </h3>
        <span className="font-mono text-[11px] text-neutral-400">
          5 routines
        </span>
      </div>

      <div className="divide-y divide-neutral-900 border-y border-neutral-900">
        {workouts.map((w) => {
          const isCurrentFocus = w.id === activeWorkoutId;

          return (
            <div
              key={w.id}
              className={`group flex items-center justify-between py-4 px-2 -mx-2 rounded-xl transition-colors ${
                isCurrentFocus ? 'bg-neutral-900/40' : 'hover:bg-neutral-900/20'
              }`}
            >
              <div
                onClick={() => onSelect(w)}
                className="flex-1 min-w-0 cursor-pointer pr-4"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white group-hover:text-neutral-200 transition-colors">
                    {w.title}
                  </span>
                  {isCurrentFocus && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  )}
                </div>
                <p className="text-xs text-neutral-400 mt-0.5 truncate">
                  {w.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-xs text-neutral-400">15m</span>
                <button
                  type="button"
                  onClick={() => onStart(w)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 hover:border-white hover:bg-white hover:text-neutral-950 transition-all active:scale-95"
                  title={`Start ${w.title}`}
                  aria-label={`Start ${w.title}`}
                >
                  <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onSelect(w)}
                  className="text-neutral-400 hover:text-white transition-colors p-1"
                  title="View details"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
