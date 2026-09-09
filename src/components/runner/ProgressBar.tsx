import type { WorkoutPlan, WorkoutStep } from '../../types/workout';

interface ProgressBarProps {
  workout: WorkoutPlan;
  currentStepIndex: number;
  totalElapsedSeconds: number;
  currentStep: WorkoutStep;
  subState: 'work' | 'rest';
}

export function ProgressBar({
  workout,
  currentStepIndex,
  totalElapsedSeconds,
  currentStep,
  subState,
}: ProgressBarProps) {
  const totalSeconds = workout.totalDurationSeconds || 900;
  const progressPercent = Math.min(100, Math.max(0, (totalElapsedSeconds / totalSeconds) * 100));

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getPhaseColor = () => {
    if (subState === 'rest') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    switch (currentStep.phase) {
      case 'warmup':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'main':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      case 'cooldown':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    }
  };

  const getPhaseTitle = () => {
    if (subState === 'rest') return 'Rest & Transition';
    switch (currentStep.phase) {
      case 'warmup':
        return 'Phase 1: Warm-Up';
      case 'main':
        return `Phase 2: Main Circuit (Round ${currentStep.round ?? 1} of 2)`;
      case 'cooldown':
        return 'Phase 3: Cool-Down';
    }
  };

  return (
    <div className="w-full space-y-2.5">
      {/* Top row: Phase Badge & Total Time remaining */}
      <div className="flex items-center justify-between text-sm">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-semibold tracking-wide uppercase ${getPhaseColor()}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
          {getPhaseTitle()}
        </span>

        <div className="font-mono text-xs text-neutral-400">
          <span className="font-bold text-white">{formatTime(totalElapsedSeconds)}</span>
          <span className="text-neutral-500"> / {formatTime(totalSeconds)}</span>
        </div>
      </div>

      {/* Segmented Timeline */}
      <div className="flex h-2 w-full gap-1 overflow-hidden rounded-full bg-neutral-900 p-0.5">
        {workout.steps.map((step, idx) => {
          const isPast = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          let colorClass = 'bg-neutral-800';
          if (isPast) {
            colorClass =
              step.phase === 'warmup'
                ? 'bg-emerald-500'
                : step.phase === 'main'
                ? 'bg-sky-500'
                : 'bg-purple-500';
          } else if (isCurrent) {
            colorClass =
              subState === 'rest'
                ? 'bg-amber-400 animate-pulse'
                : step.phase === 'warmup'
                ? 'bg-emerald-400 animate-pulse'
                : step.phase === 'main'
                ? 'bg-sky-400 animate-pulse'
                : 'bg-purple-400 animate-pulse';
          }

          return (
            <div
              key={step.id}
              className={`h-full flex-1 rounded-sm transition-all duration-300 ${colorClass}`}
            />
          );
        })}
      </div>

      {/* Overall Progress Percentage Bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-900">
        <div
          className="h-full bg-neutral-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
