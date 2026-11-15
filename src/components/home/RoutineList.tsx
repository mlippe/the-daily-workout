import { useState, useMemo } from 'react';
import { Play } from 'lucide-react';
import type { WorkoutDifficulty, WorkoutPillarFocus, WorkoutPlan } from '../../types/workout';
import { DEFAULT_TARGET_REPS } from '../../utils/storage';

const PILLAR_ORDER: WorkoutPillarFocus[] = ['push', 'pull_back', 'legs', 'core', 'full_body'];

const PILLAR_LABELS: Record<WorkoutPillarFocus, string> = {
  push: 'Upper Body (Push)',
  pull_back: 'Back & Posture (Pull)',
  legs: 'Lower Body',
  core: 'Core & Stability',
  full_body: 'Full Body',
};

const PILLAR_SHORT_LABELS: Record<WorkoutPillarFocus, string> = {
  push: 'Push',
  pull_back: 'Pull',
  legs: 'Legs',
  core: 'Core',
  full_body: 'Full',
};

const DIFFICULTY_RANK: Record<WorkoutDifficulty, number> = {
  easy: 0,
  medium: 1,
  hard: 2,
};

interface RoutineListProps {
  workouts: WorkoutPlan[];
  activeWorkoutId: string;
  recommendedWorkoutId: string;
  recommendedDifficulty: WorkoutDifficulty;
  repTargets?: Record<string, number>;
  onSelect: (workout: WorkoutPlan) => void;
  onStart: (workout: WorkoutPlan) => void;
}

export function RoutineList({
  workouts,
  activeWorkoutId,
  recommendedWorkoutId,
  recommendedDifficulty,
  repTargets,
  onSelect,
  onStart,
}: RoutineListProps) {
  const [pillarFilter, setPillarFilter] = useState<'all' | WorkoutPillarFocus>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | WorkoutDifficulty>('all');

  const groupedWorkouts = useMemo(() => {
    const pillarsToShow = pillarFilter === 'all' ? PILLAR_ORDER : [pillarFilter];
    return pillarsToShow
      .map((pillar) => {
        const items = workouts
          .filter(
            (w) =>
              w.primaryPillar === pillar &&
              (difficultyFilter === 'all' || w.difficulty === difficultyFilter)
          )
          .sort((a, b) => {
            const diffDelta = DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty];
            if (diffDelta !== 0) return diffDelta;
            return Number(a.requiresDumbbells) - Number(b.requiresDumbbells);
          });
        return { pillar, label: PILLAR_LABELS[pillar], items };
      })
      .filter((group) => group.items.length > 0);
  }, [workouts, pillarFilter, difficultyFilter]);

  const totalShown = useMemo(
    () => groupedWorkouts.reduce((acc, g) => acc + g.items.length, 0),
    [groupedWorkouts]
  );

  return (
    <section className="pt-8 pb-16 border-t border-neutral-900">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-400">
          All Workouts
        </h2>
        <span className="font-mono text-[11px] text-neutral-500">
          {totalShown} shown • Your tier: <span className="uppercase text-neutral-300">{recommendedDifficulty}</span>
        </span>
      </div>

      {/* Filters: Body Area Focus & Difficulty */}
      <div className="mt-4 space-y-2 font-mono text-[11px]">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setPillarFilter('all')}
            className={`px-2 py-0.5 rounded uppercase tracking-wider transition-colors cursor-pointer ${
              pillarFilter === 'all'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            All Areas
          </button>
          {PILLAR_ORDER.map((pillar) => {
            const isSelected = pillarFilter === pillar;
            return (
              <button
                key={pillar}
                type="button"
                onClick={() => setPillarFilter(pillar)}
                className={`px-2 py-0.5 rounded uppercase tracking-wider transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-800 text-white font-semibold'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {PILLAR_SHORT_LABELS[pillar]}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {(['all', 'easy', 'medium', 'hard'] as const).map((level) => {
            const isSelected = difficultyFilter === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => setDifficultyFilter(level)}
                className={`px-2 py-0.5 rounded uppercase tracking-wider transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-800 text-white font-semibold'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {level === 'all' ? 'All Levels' : level}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grouped Routine Sections */}
      <div className="mt-6 space-y-6">
        {groupedWorkouts.map((group) => (
          <div key={group.pillar}>
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-neutral-500 mb-2">
              {group.label}
            </h3>

            <div className="divide-y divide-neutral-900 border-y border-neutral-900">
              {group.items.map((w) => {
                const isSelected = w.id === activeWorkoutId;
                const isRecommended = w.id === recommendedWorkoutId;

                const durationMin = Math.round(w.totalDurationSeconds / 60);
                const reps = repTargets?.[w.primaryPillar] ?? repTargets?.[w.id] ?? DEFAULT_TARGET_REPS;

                return (
                  <div
                    key={w.id}
                    onClick={() => onSelect(w)}
                    className={`group flex items-center justify-between py-3 px-3 -mx-3 rounded-lg transition-colors cursor-pointer ${
                      isSelected ? 'bg-neutral-900/70' : 'hover:bg-neutral-900/30'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`text-sm font-medium transition-colors truncate ${
                            isSelected ? 'text-white' : 'text-neutral-300 group-hover:text-white'
                          }`}
                        >
                          {w.title}
                        </span>
                        {isRecommended && (
                          <span className="shrink-0 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                            (Recommended)
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-neutral-500 mt-0.5 truncate">
                        {w.subtitle}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-neutral-500 tabular-nums">
                        <span className="text-neutral-300">{w.difficulty}</span>
                        <span>•</span>
                        <span>{durationMin}m</span>
                        <span>•</span>
                        <span>{reps}r</span>
                        {w.requiresDumbbells && (
                          <>
                            <span>•</span>
                            <span className="text-neutral-200">Dumbbells</span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStart(w);
                      }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                      title={`Start ${w.title}`}
                      aria-label={`Start ${w.title}`}
                    >
                      <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
