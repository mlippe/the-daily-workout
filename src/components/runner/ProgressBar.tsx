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
  totalElapsedSeconds,
  currentStep,
  subState,
}: ProgressBarProps) {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getPhaseTotal = (phase: 'warmup' | 'main' | 'cooldown') => {
    return workout.steps
      .filter((s) => s.phase === phase)
      .reduce((sum, s) => sum + (s.workDurationSeconds || 0) + (s.restDurationSeconds || 0), 0);
  };

  const warmupTotal = getPhaseTotal('warmup') || 150;
  const mainTotal = getPhaseTotal('main') || 600;
  const cooldownTotal = getPhaseTotal('cooldown') || 150;
  const totalSeconds = workout.totalDurationSeconds || warmupTotal + mainTotal + cooldownTotal;

  // Real-time elapsed progress per phase
  const warmupElapsed = Math.min(warmupTotal, Math.max(0, totalElapsedSeconds));
  const warmupProgress = (warmupElapsed / warmupTotal) * 100;

  const mainElapsed = Math.min(mainTotal, Math.max(0, totalElapsedSeconds - warmupTotal));
  const mainProgress = (mainElapsed / mainTotal) * 100;

  const cooldownElapsed = Math.min(
    cooldownTotal,
    Math.max(0, totalElapsedSeconds - (warmupTotal + mainTotal))
  );
  const cooldownProgress = (cooldownElapsed / cooldownTotal) * 100;

  // Exercises in the current active phase
  const currentPhase = currentStep.phase;
  const currentPhaseSteps = workout.steps.filter((s) => s.phase === currentPhase);
  const currentStepInPhaseIndex = Math.max(
    0,
    currentPhaseSteps.findIndex((s) => s.id === currentStep.id)
  );

  return (
    <div className="w-full space-y-2">
      {/* Top Status Line: Phase Title + Exercise In Phase + Total Time */}
      <div className="flex items-center justify-between font-mono text-[11px] sm:text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`inline-flex items-center gap-1 font-semibold uppercase tracking-wider ${
              currentPhase === 'warmup'
                ? 'text-emerald-400'
                : currentPhase === 'main'
                ? 'text-sky-400'
                : 'text-purple-400'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                subState === 'rest'
                  ? 'bg-amber-400 animate-pulse'
                  : currentPhase === 'warmup'
                  ? 'bg-emerald-400'
                  : currentPhase === 'main'
                  ? 'bg-sky-400'
                  : 'bg-purple-400'
              }`}
            />
            {currentPhase === 'warmup'
              ? 'Warm-Up'
              : currentPhase === 'main'
              ? `Main Circuit${currentStep.round ? ` (R${currentStep.round})` : ''}`
              : 'Cool-Down'}
          </span>
          <span className="text-neutral-600">•</span>
          <span className="text-neutral-400 truncate">
            Ex {currentStepInPhaseIndex + 1} of {currentPhaseSteps.length}
          </span>
        </div>

        <div className="tabular-nums text-neutral-400 shrink-0">
          <span className="font-bold text-white">{formatTime(totalElapsedSeconds)}</span>
          <span className="text-neutral-600"> / {formatTime(totalSeconds)}</span>
        </div>
      </div>

      {/* Bar 1: Macro Phase Progress (Warmup • Main • Cooldown) */}
      <div className="flex h-1.5 w-full gap-1.5">
        {/* Warm-Up Segment */}
        <div
          style={{ flex: warmupTotal }}
          className="relative overflow-hidden rounded-full bg-neutral-900"
          title={`Warm-Up (${formatTime(warmupTotal)})`}
        >
          <div
            className="h-full bg-emerald-400 transition-all duration-300 rounded-full"
            style={{ width: `${warmupProgress}%` }}
          />
        </div>

        {/* Main Circuit Segment */}
        <div
          style={{ flex: mainTotal }}
          className="relative overflow-hidden rounded-full bg-neutral-900"
          title={`Main Circuit (${formatTime(mainTotal)})`}
        >
          <div
            className="h-full bg-sky-400 transition-all duration-300 rounded-full"
            style={{ width: `${mainProgress}%` }}
          />
        </div>

        {/* Cool-Down Segment */}
        <div
          style={{ flex: cooldownTotal }}
          className="relative overflow-hidden rounded-full bg-neutral-900"
          title={`Cool-Down (${formatTime(cooldownTotal)})`}
        >
          <div
            className="h-full bg-purple-400 transition-all duration-300 rounded-full"
            style={{ width: `${cooldownProgress}%` }}
          />
        </div>
      </div>

      {/* Bar 2: Micro Phase Exercises (Ticks for active phase exercises only) */}
      <div className="flex h-1 w-full gap-1">
        {currentPhaseSteps.map((step, idx) => {
          const isPast = idx < currentStepInPhaseIndex;
          const isCurrent = idx === currentStepInPhaseIndex;

          let segmentClass = 'bg-neutral-800/80';
          if (isPast) {
            segmentClass =
              currentPhase === 'warmup'
                ? 'bg-emerald-500'
                : currentPhase === 'main'
                ? 'bg-sky-500'
                : 'bg-purple-500';
          } else if (isCurrent) {
            segmentClass =
              subState === 'rest'
                ? 'bg-amber-400 animate-pulse'
                : currentPhase === 'warmup'
                ? 'bg-emerald-300 animate-pulse'
                : currentPhase === 'main'
                ? 'bg-sky-300 animate-pulse'
                : 'bg-purple-300 animate-pulse';
          }

          return (
            <div
              key={step.id}
              className={`h-full flex-1 rounded-full transition-all duration-300 ${segmentClass}`}
            />
          );
        })}
      </div>
    </div>
  );
}
