import { useState, useMemo, useEffect } from 'react';
import { X, Play, Dumbbell } from 'lucide-react';
import type { WorkoutDifficulty, WorkoutPillarFocus, WorkoutPlan } from '../../types/workout';
import { DEFAULT_TARGET_REPS } from '../../utils/storage';
import { BODY_AREA_LABELS } from '../../utils/workoutGenerator';

const DIFFICULTY_RANK: Record<WorkoutDifficulty, number> = {
  easy: 0,
  medium: 1,
  hard: 2,
};

interface BodyAreaModalProps {
  pillar: WorkoutPillarFocus;
  workouts: WorkoutPlan[];
  activeWorkoutId: string;
  recommendedWorkoutId: string;
  recommendedDifficulty: WorkoutDifficulty;
  repTargets?: Record<string, number>;
  onClose: () => void;
  onSelect: (workout: WorkoutPlan) => void;
  onStart: (workout: WorkoutPlan) => void;
}

export function BodyAreaModal({
  pillar,
  workouts,
  activeWorkoutId,
  recommendedWorkoutId,
  recommendedDifficulty,
  repTargets,
  onClose,
  onSelect,
  onStart,
}: BodyAreaModalProps) {
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | WorkoutDifficulty>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const filteredWorkouts = useMemo(() => {
    return workouts
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
  }, [workouts, pillar, difficultyFilter]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90dvh] w-full max-w-lg flex-col rounded-lg border border-neutral-800 bg-neutral-950 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 border-b border-neutral-800">
          <div className="min-w-0">
            <div className="font-mono text-base uppercase tracking-wider text-neutral-400">
              {filteredWorkouts.length} Workouts • Tier: {recommendedDifficulty}
            </div>
            <h3 className="mt-1 text-2xl sm:text-3xl font-bold text-white tracking-tight truncate">
              {BODY_AREA_LABELS[pillar]}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 -mt-1 -mr-1 items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-1.5 px-5 py-3 border-b border-neutral-800 font-mono text-lg overflow-x-auto">
          {(['all', 'easy', 'medium', 'hard'] as const).map((level) => {
            const isSelected = difficultyFilter === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => setDifficultyFilter(level)}
                className={`min-h-10 px-3.5 py-1.5 rounded-lg uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-white text-neutral-950 font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {level === 'all' ? 'All' : level}
              </button>
            );
          })}
        </div>

        {/* Workouts List */}
        <div className="flex-1 overflow-y-auto px-5 py-2 divide-y divide-neutral-800">
          {filteredWorkouts.map((w) => {
            const isSelected = w.id === activeWorkoutId;
            const isRecommended = w.id === recommendedWorkoutId;
            const durationMin = Math.round(w.totalDurationSeconds / 60);
            const reps = repTargets?.[w.primaryPillar] ?? repTargets?.[w.id] ?? DEFAULT_TARGET_REPS;

            return (
              <div
                key={w.id}
                onClick={() => {
                  onSelect(w);
                  onClose();
                }}
                className={`group flex items-center justify-between gap-3 py-4 px-3 -mx-3 rounded-lg transition-colors cursor-pointer ${
                  isSelected ? 'bg-neutral-900' : 'hover:bg-neutral-900/50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span
                      className={`text-xl font-bold tracking-tight transition-colors truncate ${
                        isSelected ? 'text-white' : 'text-neutral-200 group-hover:text-white'
                      }`}
                    >
                      {w.title}
                    </span>
                    {isRecommended && (
                      <span className="shrink-0 text-base font-mono font-bold uppercase tracking-wider text-amber-400">
                        Today
                      </span>
                    )}
                  </div>

                  <p className="text-lg text-neutral-400 mt-0.5 line-clamp-1">
                    {w.subtitle}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 font-mono text-lg uppercase tracking-wider text-neutral-400 tabular-nums">
                    <span className="text-neutral-200 font-semibold">{w.difficulty}</span>
                    <span className="text-neutral-600">/</span>
                    <span>{durationMin}m</span>
                    <span className="text-neutral-600">/</span>
                    <span>{reps}r</span>
                    {w.requiresDumbbells && (
                      <>
                        <span className="text-neutral-600">/</span>
                        <span className="inline-flex items-center gap-1.5 text-neutral-200">
                          <Dumbbell className="h-4 w-4" />
                          <span>Dumbbells</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                    onStart(w);
                  }}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-200 hover:text-white hover:border-white active:scale-95 transition-all cursor-pointer"
                  title={`Start ${w.title}`}
                  aria-label={`Start ${w.title}`}
                >
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
