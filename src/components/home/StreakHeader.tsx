interface StreakHeaderProps {
  currentStreak: number;
  totalCompleted: number;
}

export function StreakHeader({ currentStreak, totalCompleted }: StreakHeaderProps) {
  return (
    <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5 py-4 sm:py-5 border-b border-neutral-800">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="h-2 w-2 shrink-0 bg-white" />
        <span className="text-lg font-mono uppercase tracking-wider text-white font-bold truncate">
          The Daily Workout
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0 font-mono text-lg text-neutral-400 whitespace-nowrap tabular-nums">
        {currentStreak > 0 && (
          <span className="text-neutral-200 font-semibold">
            {currentStreak}d streak
          </span>
        )}
        {currentStreak > 0 && totalCompleted > 0 && <span className="text-neutral-600">/</span>}
        {totalCompleted > 0 && (
          <span>{totalCompleted} done</span>
        )}
      </div>
    </header>
  );
}
