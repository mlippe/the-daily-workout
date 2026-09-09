interface StreakHeaderProps {
  currentStreak: number;
  totalCompleted: number;
}

export function StreakHeader({ currentStreak, totalCompleted }: StreakHeaderProps) {
  return (
    <header className="flex items-center justify-between py-6 border-b border-neutral-900">
      <div className="flex items-center gap-2.5">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        <span className="text-sm font-medium tracking-tight text-white">
          The Daily Workout
        </span>
      </div>

      <div className="flex items-center gap-3 font-mono text-xs text-neutral-400">
        {currentStreak > 0 && (
          <span className="text-neutral-300">
            {currentStreak} {currentStreak === 1 ? 'day' : 'days'} streak
          </span>
        )}
        {totalCompleted > 0 && (
          <span className="text-neutral-500">
            ({totalCompleted} total)
          </span>
        )}
      </div>
    </header>
  );
}
