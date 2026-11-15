interface StreakHeaderProps {
  currentStreak: number;
  totalCompleted: number;
}

export function StreakHeader({ currentStreak, totalCompleted }: StreakHeaderProps) {
  return (
    <header className="flex items-center justify-between py-5 border-b border-neutral-900">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
        <span className="text-xs font-mono uppercase tracking-widest text-neutral-300 font-medium">
          The Daily Workout
        </span>
      </div>

      <div className="flex items-center gap-2 font-mono text-xs text-neutral-500">
        {currentStreak > 0 && (
          <span className="text-neutral-300">
            {currentStreak} {currentStreak === 1 ? 'day' : 'days'} streak
          </span>
        )}
        {currentStreak > 0 && totalCompleted > 0 && <span>•</span>}
        {totalCompleted > 0 && (
          <span>{totalCompleted} completed</span>
        )}
      </div>
    </header>
  );
}
