import { ChevronRight } from 'lucide-react';
import type { WorkoutPillarFocus, WorkoutPlan } from '../../types/workout';
import { BODY_AREA_LABELS } from '../../utils/workoutGenerator';

const BODY_AREAS: WorkoutPillarFocus[] = ['push', 'pull_back', 'legs', 'core', 'full_body'];

interface RoutineListProps {
  workouts: WorkoutPlan[];
  activePillar?: WorkoutPillarFocus;
  recommendedPillar?: WorkoutPillarFocus;
  onSelectArea: (pillar: WorkoutPillarFocus) => void;
}

export function RoutineList({
  workouts,
  activePillar,
  recommendedPillar,
  onSelectArea,
}: RoutineListProps) {
  return (
    <section className="pt-8 pb-16 border-t border-neutral-800">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-mono text-lg font-bold uppercase tracking-wider text-neutral-200">
          Body Areas
        </h2>
        <span className="font-mono text-base text-neutral-400 tabular-nums">
          {workouts.length} workouts
        </span>
      </div>

      <div className="divide-y divide-neutral-800 border-y border-neutral-800">
        {BODY_AREAS.map((pillar) => {
          const count = workouts.filter((w) => w.primaryPillar === pillar).length;
          const isSelected = activePillar === pillar;
          const isRecommended = recommendedPillar === pillar;

          return (
            <button
              key={pillar}
              type="button"
              onClick={() => onSelectArea(pillar)}
              className={`w-full min-h-[60px] group flex items-center justify-between gap-3 py-4 px-3 -mx-3 rounded-lg text-left transition-colors cursor-pointer ${
                isSelected ? 'bg-neutral-900' : 'hover:bg-neutral-900/50 active:bg-neutral-900/80'
              }`}
            >
              <div className="flex items-baseline gap-2.5 min-w-0">
                <span
                  className={`text-xl sm:text-2xl font-bold tracking-tight transition-colors truncate ${
                    isSelected ? 'text-white' : 'text-neutral-200 group-hover:text-white'
                  }`}
                >
                  {BODY_AREA_LABELS[pillar]}
                </span>
                {isRecommended && (
                  <span className="shrink-0 text-base font-mono font-bold uppercase tracking-wider text-amber-400">
                    Today
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5 shrink-0 font-mono text-lg text-neutral-400">
                <span className="tabular-nums">{count}</span>
                <ChevronRight className="h-5 w-5 text-neutral-500 group-hover:text-white transition-colors" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
