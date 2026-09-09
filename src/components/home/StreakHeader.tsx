import { Flame, Dumbbell, CalendarCheck } from 'lucide-react';
import type { MusclePillar } from '../../types/exercise';

interface StreakHeaderProps {
  currentStreak: number;
  totalCompleted: number;
  pillarBreakdown?: Record<MusclePillar, number>;
}

const PILLAR_LABELS: { key: MusclePillar; label: string; color: string }[] = [
  { key: 'push', label: 'Push', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  { key: 'pull_back', label: 'Back & Pull', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  { key: 'legs', label: 'Legs', color: 'text-sky-400 border-sky-500/30 bg-sky-500/10' },
  { key: 'core', label: 'Core', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
];

export function StreakHeader({ currentStreak, totalCompleted, pillarBreakdown }: StreakHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
      {/* App branding */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
          <Dumbbell className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white">The Daily Workout</h1>
          <p className="text-xs text-neutral-400">15 minutes. Bodyweight. Zero friction.</p>
        </div>
      </div>

      {/* Streak and stats pills */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
          <Flame className="h-4 w-4 fill-orange-400" />
          <span>{currentStreak} Day{currentStreak === 1 ? '' : 's'} Streak</span>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs text-neutral-300">
          <CalendarCheck className="h-3.5 w-3.5 text-neutral-400" />
          <span>{totalCompleted} Completed</span>
        </div>

        {/* 14-day pillar balance pills */}
        {pillarBreakdown && (
          <div className="hidden lg:flex items-center gap-1 pl-2 border-l border-neutral-800">
            <span className="text-[11px] text-neutral-500 mr-1">14-Day:</span>
            {PILLAR_LABELS.map((p) => (
              <span
                key={p.key}
                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold border ${p.color}`}
                title={`${pillarBreakdown[p.key] || 0} completed in last 14 days`}
              >
                {p.label}: {pillarBreakdown[p.key] || 0}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
