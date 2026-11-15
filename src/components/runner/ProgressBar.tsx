import type { WorkoutPlan, WorkoutStep } from '../../types/workout';

interface ProgressBarProps {
  workout: WorkoutPlan;
  currentStep: WorkoutStep;
  nextStep?: WorkoutStep;
}

export function ProgressBar({ workout, currentStep, nextStep }: ProgressBarProps) {
  const currentPhase = currentStep.phase;
  const currentStepIndex = workout.steps.findIndex((s) => s.id === currentStep.id);
  const totalSteps = workout.steps.length;

  const phaseSteps = workout.steps.filter((s) => s.phase === currentPhase);
  const stepInPhaseIndex = phaseSteps.findIndex((s) => s.id === currentStep.id);

  const phaseLabel =
    currentPhase === 'warmup'
      ? 'Warm-up'
      : currentPhase === 'cooldown'
        ? 'Cool-down'
        : currentStep.round
          ? `Round ${currentStep.round} of 2`
          : 'Main Circuit';

  // Overall workout progress fraction
  const overallFraction = (currentStepIndex + 1) / totalSteps;

  return (
    <div className="w-full select-none">
      {/* Sleek single progress track */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-900">
        <div
          className="h-full bg-white transition-all duration-300 ease-out"
          style={{ width: `${Math.round(overallFraction * 100)}%` }}
        />
      </div>

      {/* Status line */}
      <div className="mt-2 flex items-center justify-between gap-3 text-[11px] sm:text-xs font-mono">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 text-neutral-400">
          <span className="font-semibold text-neutral-200 uppercase tracking-wider">
            {phaseLabel}
          </span>
          <span>•</span>
          <span className="tabular-nums">
            {stepInPhaseIndex + 1}/{phaseSteps.length}
          </span>
        </div>

        {nextStep && (
          <div className="min-w-0 flex-1 text-neutral-500 truncate text-right">
            <span className="text-neutral-600">Next: </span>
            <span className="text-neutral-400">
              {nextStep.isRest
                ? 'Rest'
                : `${nextStep.exercise.name}${nextStep.side ? ` (${nextStep.side === 'right' ? 'R' : 'L'})` : ''}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
