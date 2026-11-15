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
    <section className="pt-8 pb-16 border-t border-neutral-900">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-400">
          Body Areas
        </h2>
        <span className="font-mono text-[11px] text-neutral-500">
          {workouts.length} workouts
        </span>
      </div>

      <div className="divide-y divide-neutral-900 border-y border-neutral-900">
        {BODY_AREAS.map((pillar) => {
          const count = workouts.filter((w) => w.primaryPillar === pillar).length;
          const isSelected = activePillar === pillar;
          const isRecommended = recommendedPillar === pillar;

          return (
            <button
              key={pillar}
              type="button"
              onClick={() => onSelectArea(pillar)}
              className={`w-full group flex items-center justify-between py-3.5 px-3 -mx-3 rounded-lg text-left transition-colors cursor-pointer ${
                isSelected ? 'bg-neutral-900/70' : 'hover:bg-neutral-900/30'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`text-sm font-medium transition-colors truncate ${
                    isSelected ? 'text-white' : 'text-neutral-300 group-hover:text-white'
                  }`}
                >
                  {BODY_AREA_LABELS[pillar]}
                </span>
                {isRecommended && (
                  <span className="shrink-0 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                    (Today)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 font-mono text-xs text-neutral-500">
                <span className="tabular-nums">{count}</span>
                <ChevronRight className="h-4 w-4 text-neutral-600 group-hover:text-neutral-300 transition-colors" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
