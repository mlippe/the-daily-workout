import { Check } from 'lucide-react';
import type { WorkoutPlan, WorkoutStep } from '../../types/workout';

interface ProgressBarProps {
  workout: WorkoutPlan;
  currentStep: WorkoutStep;
}

const PHASES = [
  { key: 'warmup', label: 'warmup' },
  { key: 'main', label: 'main' },
  { key: 'cooldown', label: 'cooldown' },
] as const;

export function ProgressBar({ workout, currentStep }: ProgressBarProps) {
  const currentPhase = currentStep.phase;
  const phaseOrder = ['warmup', 'main', 'cooldown'] as const;
  const activePhaseIndex = phaseOrder.indexOf(currentPhase);

  // Exercises in the current active phase
  const currentPhaseSteps = workout.steps.filter(
    (s) => s.phase === currentPhase,
  );
  const currentStepInPhaseIndex = Math.max(
    0,
    currentPhaseSteps.findIndex((s) => s.id === currentStep.id),
  );

  // All non-active phases adapt the same accent color as the current active phase:
  // - Main phase pills: active and done are whole pill filled; not done is outline
  // - Exercise bubbles: active has outline + inset + pulsing fill; done is solid filled; not done is outline
  const phaseThemes = {
    warmup: {
      pillActive:
        'bg-emerald-400 border-emerald-400 text-neutral-950 font-bold shadow-[0_0_12px_rgba(52,211,153,0.35)]',
      pillPast:
        'bg-emerald-400 border-emerald-400 text-neutral-950 font-bold',
      pillUpcoming:
        'bg-transparent border-emerald-400/50 text-emerald-400/80 font-medium',
      bubbleCurrentBorder:
        'border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]',
      bubbleCurrentFill: 'bg-emerald-400',
      bubblePast: 'bg-emerald-400 border-emerald-400',
      bubbleUpcoming: 'bg-transparent border-emerald-500/40',
    },
    main: {
      pillActive:
        'bg-sky-400 border-sky-400 text-neutral-950 font-bold shadow-[0_0_12px_rgba(56,189,248,0.35)]',
      pillPast:
        'bg-sky-400 border-sky-400 text-neutral-950 font-bold',
      pillUpcoming:
        'bg-transparent border-sky-400/50 text-sky-400/80 font-medium',
      bubbleCurrentBorder:
        'border-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]',
      bubbleCurrentFill: 'bg-sky-400',
      bubblePast: 'bg-sky-400 border-sky-400',
      bubbleUpcoming: 'bg-transparent border-sky-500/40',
    },
    cooldown: {
      pillActive:
        'bg-purple-400 border-purple-400 text-neutral-950 font-bold shadow-[0_0_12px_rgba(192,132,252,0.35)]',
      pillPast:
        'bg-purple-400 border-purple-400 text-neutral-950 font-bold',
      pillUpcoming:
        'bg-transparent border-purple-400/50 text-purple-400/80 font-medium',
      bubbleCurrentBorder:
        'border-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.5)]',
      bubbleCurrentFill: 'bg-purple-400',
      bubblePast: 'bg-purple-400 border-purple-400',
      bubbleUpcoming: 'bg-transparent border-purple-500/40',
    },
  };

  const theme = phaseThemes[currentPhase] ?? phaseThemes.main;

  return (
    <div className='w-full space-y-2'>
      {/* Stage 1: 3 Phase Pills */}
      <div className='flex items-center gap-2 w-full'>
        {PHASES.map(({ key, label }, idx) => {
          const isCurrent = currentPhase === key;
          const isPast = idx < activePhaseIndex;

          if (isPast) {
            // Done: whole pill filled with checkmark
            return (
              <div
                key={key}
                className={`flex-1 h-6 sm:h-6.5 flex items-center justify-center gap-1.5 rounded-full border-2 text-[10px] sm:text-xs font-mono uppercase tracking-wider transition-all duration-300 select-none ${theme.pillPast}`}
              >
                <Check className='h-3 w-3 stroke-[2.5]' />
                <span>{label}</span>
              </div>
            );
          }

          if (isCurrent) {
            // Active: whole pill filled (no inset)
            return (
              <div
                key={key}
                className={`flex-1 h-6 sm:h-6.5 flex items-center justify-center gap-1.5 rounded-full border-2 text-[10px] sm:text-xs font-mono uppercase tracking-wider transition-all duration-300 select-none ${theme.pillActive}`}
              >
                <span>{label}</span>
              </div>
            );
          }

          // Not done: outline only
          return (
            <div
              key={key}
              className={`flex-1 h-6 sm:h-6.5 flex items-center justify-center gap-1.5 rounded-full border-2 text-[10px] sm:text-xs font-mono uppercase tracking-wider transition-all duration-300 select-none ${theme.pillUpcoming}`}
            >
              <span>{label}</span>
            </div>
          );
        })}
      </div>

      {/* Stage 2: Phase Exercises */}
      <div className='flex h-3 sm:h-3.5 w-full gap-1 sm:gap-1.5'>
        {currentPhaseSteps.map((step, idx) => {
          const isPast = idx < currentStepInPhaseIndex;
          const isCurrent = idx === currentStepInPhaseIndex;

          if (isPast) {
            // Done parts are outline + non pulsing fill
            return (
              <div
                key={step.id}
                className={`h-full flex-1 rounded-full border-2 transition-all duration-300 ${theme.bubblePast}`}
              />
            );
          }

          if (isCurrent) {
            // Current one has a fill, but an inset (little black padding) and pulses in lower bar
            return (
              <div
                key={step.id}
                className={`h-full flex-1 rounded-full border-2 ${theme.bubbleCurrentBorder} p-[2px] bg-black flex items-center justify-center transition-all duration-300`}
              >
                <div
                  className={`w-full h-full rounded-full ${theme.bubbleCurrentFill} animate-pulse`}
                />
              </div>
            );
          }

          // Inactive parts are just outlined
          return (
            <div
              key={step.id}
              className={`h-full flex-1 rounded-full border-2 transition-all duration-300 ${theme.bubbleUpcoming}`}
            />
          );
        })}
      </div>
    </div>
  );
}
