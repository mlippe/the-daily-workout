interface StreakHeaderProps {
  currentStreak: number;
  totalCompleted: number;
}

export function StreakHeader({ currentStreak, totalCompleted }: StreakHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3 py-4 sm:py-5 border-b border-neutral-900">
      <div className="flex items-center gap-2 min-w-0">
        <span className="h-1.5 w-1.5 shrink-0 bg-neutral-300" />
        <span className="text-xs sm:text-sm font-mono uppercase tracking-widest text-neutral-300 font-medium truncate">
          The Daily Workout
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0 font-mono text-xs sm:text-sm text-neutral-500 whitespace-nowrap tabular-nums">
        {currentStreak > 0 && (
          <span className="text-neutral-300">
            {currentStreak}d streak
          </span>
        )}
        {currentStreak > 0 && totalCompleted > 0 && <span className="text-neutral-700">/</span>}
        {totalCompleted > 0 && (
          <span>{totalCompleted} done</span>
        )}
      </div>
    </header>
  );
}
