import type { WorkoutPlan, WorkoutStep } from '../../types/workout';

interface ProgressBarProps {
  workout: WorkoutPlan;
  currentStepIndex?: number;
  totalElapsedSeconds?: number;
  currentStep: WorkoutStep;
  subState: 'work' | 'rest';
}

const PHASES = [
  { key: 'warmup', label: 'warmup' },
  { key: 'main', label: 'main' },
  { key: 'cooldown', label: 'cooling' },
] as const;

export function ProgressBar({
  workout,
  currentStep,
  subState,
}: ProgressBarProps) {
  const currentPhase = currentStep.phase;
  const phaseOrder = ['warmup', 'main', 'cooldown'] as const;
  const activePhaseIndex = phaseOrder.indexOf(currentPhase);

  // Exercises in the current active phase
  const currentPhaseSteps = workout.steps.filter((s) => s.phase === currentPhase);
  const currentStepInPhaseIndex = Math.max(
    0,
    currentPhaseSteps.findIndex((s) => s.id === currentStep.id)
  );

  return (
    <div className="w-full space-y-2.5">
      {/* Stage 1: 3 Phase Pills (warmup, main, cooling) */}
      <div className="flex items-center gap-2 w-full">
        {PHASES.map(({ key, label }, idx) => {
          const isCurrent = currentPhase === key;
          const isPast = idx < activePhaseIndex;

          let pillStyle = 'bg-neutral-900/90 text-neutral-500 border-neutral-800';

          if (isCurrent) {
            if (key === 'warmup') {
              pillStyle =
                'bg-emerald-400 text-neutral-950 border-emerald-400 font-bold shadow-[0_0_12px_rgba(52,211,153,0.35)]';
            } else if (key === 'main') {
              pillStyle =
                'bg-sky-400 text-neutral-950 border-sky-400 font-bold shadow-[0_0_12px_rgba(56,189,248,0.35)]';
            } else {
              pillStyle =
                'bg-purple-400 text-neutral-950 border-purple-400 font-bold shadow-[0_0_12px_rgba(192,132,252,0.35)]';
            }
          } else if (isPast) {
            if (key === 'warmup') {
              pillStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-medium';
            } else if (key === 'main') {
              pillStyle = 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-medium';
            }
          }

          return (
            <div
              key={key}
              className={`flex-1 h-6 sm:h-6.5 flex items-center justify-center rounded-full border text-[10px] sm:text-xs font-mono tracking-wider transition-all duration-300 select-none ${pillStyle}`}
            >
              {label}
            </div>
          );
        })}
      </div>

      {/* Stage 2: Phase Exercises (Ticks for active phase exercises only) */}
      <div className="flex h-1.5 w-full gap-1.5">
        {currentPhaseSteps.map((step, idx) => {
          const isPast = idx < currentStepInPhaseIndex;
          const isCurrent = idx === currentStepInPhaseIndex;

          let segmentClass = 'bg-neutral-800/80';
          if (isPast) {
            segmentClass =
              currentPhase === 'warmup'
                ? 'bg-emerald-400'
                : currentPhase === 'main'
                ? 'bg-sky-400'
                : 'bg-purple-400';
          } else if (isCurrent) {
            segmentClass =
              subState === 'rest'
                ? 'bg-amber-400 animate-pulse'
                : 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]';
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
