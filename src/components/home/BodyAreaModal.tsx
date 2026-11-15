import { useState, useMemo, useEffect } from 'react';
import { X, Play } from 'lucide-react';
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-neutral-900">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">
              {filteredWorkouts.length} Workouts • Your tier: {recommendedDifficulty}
            </div>
            <h3 className="mt-1 text-xl font-semibold text-white tracking-tight">
              {BODY_AREA_LABELS[pillar]}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-1 px-5 py-3 border-b border-neutral-900 font-mono text-[11px]">
          {(['all', 'easy', 'medium', 'hard'] as const).map((level) => {
            const isSelected = difficultyFilter === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => setDifficultyFilter(level)}
                className={`px-2.5 py-1 rounded-md uppercase tracking-wider transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-800 text-white font-semibold'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {level === 'all' ? 'All' : level}
              </button>
            );
          })}
        </div>

        {/* Workouts List */}
        <div className="flex-1 overflow-y-auto px-5 py-2 divide-y divide-neutral-900">
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
                className={`group flex items-center justify-between py-3.5 px-2.5 -mx-2.5 rounded-lg transition-colors cursor-pointer ${
                  isSelected ? 'bg-neutral-900/70' : 'hover:bg-neutral-900/40'
                }`}
              >
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`text-sm font-medium transition-colors truncate ${
                        isSelected ? 'text-white' : 'text-neutral-200 group-hover:text-white'
                      }`}
                    >
                      {w.title}
                    </span>
                    {isRecommended && (
                      <span className="shrink-0 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                        (Today)
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
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
                    onClose();
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
    </div>
  );
}
