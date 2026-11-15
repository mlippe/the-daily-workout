interface StreakHeaderProps {
  currentStreak: number;
  totalCompleted: number;
}

export function StreakHeader({ currentStreak, totalCompleted }: StreakHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3 py-4 sm:py-5 border-b border-neutral-900">
      <div className="flex items-center gap-2 min-w-0">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
        <span className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-neutral-300 font-medium truncate">
          The Daily Workout
        </span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 font-mono text-[11px] sm:text-xs text-neutral-500 whitespace-nowrap tabular-nums">
        {currentStreak > 0 && (
          <span className="text-neutral-300">
            {currentStreak}d streak
          </span>
        )}
        {currentStreak > 0 && totalCompleted > 0 && <span>•</span>}
        {totalCompleted > 0 && (
          <span>{totalCompleted} done</span>
        )}
      </div>
    </header>
  );
}
