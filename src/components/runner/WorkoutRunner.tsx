import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  X,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import type { WorkoutPlan } from '../../types/workout';
import { soundEngine } from '../../utils/audio';
import { useWakeLock } from '../../hooks/useWakeLock';
import { ExerciseVisual } from './ExerciseVisual';
import { ProgressBar } from './ProgressBar';

interface WorkoutRunnerProps {
  workout: WorkoutPlan;
  onComplete: (summary: { totalTimeSeconds: number; workout: WorkoutPlan }) => void;
  onExit: () => void;
}

export function WorkoutRunner({ workout, onComplete, onExit }: WorkoutRunnerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [subState, setSubState] = useState<'work' | 'rest'>('work');
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(() => soundEngine.getMuted());
  const [showExitModal, setShowExitModal] = useState(false);

  const currentStep = workout.steps[currentStepIndex];
  const nextStep = currentStepIndex < workout.steps.length - 1 ? workout.steps[currentStepIndex + 1] : null;

  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => currentStep.workDurationSeconds);
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState(0);

  // Keep screen awake while workout is active and not paused
  const { isLocked, isSupported: isWakeLockSupported } = useWakeLock(!isPaused);

  // Sound unlock on mount
  useEffect(() => {
    soundEngine.init();
  }, []);

  // Sync mute state
  const handleToggleMute = useCallback(() => {
    const nextMute = soundEngine.toggleMute();
    setIsMuted(nextMute);
  }, []);

  // Advance to next step or next substate
  const advance = useCallback(() => {
    if (subState === 'work') {
      const restDuration = currentStep.restDurationSeconds;
      if (restDuration > 0 && currentStepIndex < workout.steps.length - 1) {
        // Transition to rest before next step
        setSubState('rest');
        setSecondsRemaining(Math.round(restDuration));
        soundEngine.playTransitionChime();
      } else if (currentStepIndex < workout.steps.length - 1) {
        // No rest, go straight to next step
        const nextIdx = currentStepIndex + 1;
        setCurrentStepIndex(nextIdx);
        setSubState('work');
        setSecondsRemaining(workout.steps[nextIdx].workDurationSeconds);
        soundEngine.playTransitionChime();
      } else {
        // Workout Complete!
        soundEngine.playCompletionFanfare();
        onComplete({
          totalTimeSeconds: workout.totalDurationSeconds,
          workout,
        });
      }
    } else {
      // Finished rest, advance to next exercise
      const nextIdx = currentStepIndex + 1;
      if (nextIdx < workout.steps.length) {
        setCurrentStepIndex(nextIdx);
        setSubState('work');
        setSecondsRemaining(workout.steps[nextIdx].workDurationSeconds);
        soundEngine.playTransitionChime();
      } else {
        soundEngine.playCompletionFanfare();
        onComplete({
          totalTimeSeconds: workout.totalDurationSeconds,
          workout,
        });
      }
    }
  }, [subState, currentStep, currentStepIndex, workout, onComplete]);

  // Skip forward button
  const handleSkipForward = useCallback(() => {
    if (currentStepIndex < workout.steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      setSubState('work');
      setSecondsRemaining(workout.steps[nextIdx].workDurationSeconds);
    } else {
      onComplete({
        totalTimeSeconds: totalElapsedSeconds,
        workout,
      });
    }
  }, [currentStepIndex, workout, onComplete, totalElapsedSeconds]);

  // Go to previous exercise
  const handleSkipBack = useCallback(() => {
    if (subState === 'rest') {
      setSubState('work');
      setSecondsRemaining(currentStep.workDurationSeconds);
    } else if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      setSubState('work');
      setSecondsRemaining(workout.steps[prevIdx].workDurationSeconds);
    } else {
      setSecondsRemaining(currentStep.workDurationSeconds);
    }
  }, [subState, currentStepIndex, currentStep, workout.steps]);

  // Main countdown timer interval
  const advanceRef = useRef(advance);
  useEffect(() => {
    advanceRef.current = advance;
  }, [advance]);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTotalElapsedSeconds((prev) => prev + 1);

      setSecondsRemaining((prev) => {
        const next = prev - 1;

        // Audio countdown pips at 5, 4, 3, 2, 1
        if (next <= 5 && next >= 1) {
          soundEngine.playPip(next === 1 ? 520 : 440, 0.1);
        }

        if (next <= 0) {
          setTimeout(() => advanceRef.current(), 0);
          return 0;
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showExitModal) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPaused((p) => !p);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSkipForward();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSkipBack();
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        handleToggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSkipForward, handleSkipBack, handleToggleMute, showExitModal]);

  const maxDuration = subState === 'work' ? currentStep.workDurationSeconds : currentStep.restDurationSeconds;
  const strokePercent = maxDuration > 0 ? (secondsRemaining / maxDuration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-neutral-950 text-white select-none">
      {/* Top Bar: Progress, WakeLock status, Controls */}
      <header className="border-b border-neutral-900 bg-neutral-950/80 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setShowExitModal(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-900 hover:text-white transition-colors"
            title="Exit Workout"
            aria-label="Exit Workout"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex-1">
            <ProgressBar
              workout={workout}
              currentStepIndex={currentStepIndex}
              totalElapsedSeconds={totalElapsedSeconds}
              currentStep={currentStep}
              subState={subState}
            />
          </div>

          <button
            type="button"
            onClick={handleToggleMute}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              isMuted ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-200 hover:text-white'
            }`}
            title={isMuted ? 'Unmute countdowns' : 'Mute countdowns'}
            aria-label={isMuted ? 'Unmute countdowns' : 'Mute countdowns'}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center p-4">
        {subState === 'work' ? (
          /* WORK STATE */
          <div className="flex h-full w-full flex-col items-center justify-between gap-4 py-2">
            {/* Title & target muscles */}
            <div className="text-center">
              <div className="text-xs uppercase tracking-wider text-neutral-400">
                Exercise {currentStepIndex + 1} of {workout.steps.length}
              </div>
              <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-white">
                {currentStep.exercise.name}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5">
                {currentStep.exercise.primaryMuscles.map((m) => (
                  <span
                    key={m}
                    className="rounded-md bg-neutral-800/80 px-2 py-0.5 text-[11px] font-medium text-neutral-300 capitalize"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Visual demo animation */}
            <div className="w-full max-w-sm aspect-4/3 relative">
              <ExerciseVisual
                key={currentStep.exercise.id}
                exercise={currentStep.exercise}
                isPaused={isPaused}
                className="h-full w-full shadow-2xl ring-1 ring-neutral-800"
              />
            </div>

            {/* Timer & Reps Display */}
            <div
              onClick={() => {
                if (currentStep.exercise.type === 'reps') {
                  advance();
                }
              }}
              className={`flex flex-col items-center justify-center cursor-pointer transition-transform ${
                currentStep.exercise.type === 'reps' ? 'active:scale-95' : ''
              }`}
            >
              {/* Circular Countdown Ring */}
              <div className="relative flex h-32 w-32 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    className="stroke-neutral-800"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    className={`transition-all duration-300 ${
                      secondsRemaining <= 5
                        ? 'stroke-rose-500'
                        : currentStep.phase === 'warmup'
                        ? 'stroke-emerald-400'
                        : currentStep.phase === 'main'
                        ? 'stroke-sky-400'
                        : 'stroke-purple-400'
                    }`}
                    strokeWidth="6"
                    strokeDasharray={276.46}
                    strokeDashoffset={276.46 * (1 - strokePercent / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                <div className="absolute flex flex-col items-center">
                  <span className="font-mono text-4xl font-black tabular-nums tracking-tighter">
                    {secondsRemaining}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-neutral-400">Seconds</span>
                </div>
              </div>

              {currentStep.exercise.type === 'reps' && (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Target: {currentStep.targetReps} reps (Tap when done)
                </div>
              )}
            </div>
          </div>
        ) : (
          /* REST & TRANSITION STATE */
          <div className="flex h-full w-full flex-col items-center justify-center gap-6 py-4 text-center">
            <div>
              <span className="inline-block rounded-full bg-amber-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-amber-400 border border-amber-500/30">
                Rest & Prepare
              </span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white">Catch Your Breath</h2>
            </div>

            {/* Big Rest Timer */}
            <div className="relative flex h-36 w-36 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="stroke-neutral-800"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="stroke-amber-400 transition-all duration-300"
                  strokeWidth="6"
                  strokeDasharray={276.46}
                  strokeDashoffset={276.46 * (1 - strokePercent / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-mono text-5xl font-black tabular-nums text-amber-400 tracking-tighter">
                  {secondsRemaining}
                </span>
                <span className="text-[10px] uppercase font-semibold text-neutral-400">Rest</span>
              </div>
            </div>

            {/* Next Exercise Preview */}
            {nextStep && (
              <div className="flex w-full max-w-sm items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/90 p-3 text-left shadow-lg">
                <div className="h-16 w-16 overflow-hidden rounded-xl bg-neutral-950 shrink-0">
                  <img
                    src={nextStep.exercise.images[0]}
                    alt={nextStep.exercise.name}
                    className="h-full w-full object-contain p-1"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-neutral-400">Up Next</div>
                  <div className="truncate text-base font-semibold text-white">{nextStep.exercise.name}</div>
                  <div className="text-xs text-neutral-400 truncate">
                    {nextStep.exercise.primaryMuscles.join(', ')}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Controls Bar */}
      <footer className="border-t border-neutral-900 bg-neutral-950 px-4 py-4">
        <div className="mx-auto flex max-w-md items-center justify-between gap-6">
          <button
            type="button"
            onClick={handleSkipBack}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
            title="Previous (Left Arrow)"
            aria-label="Previous step"
          >
            <SkipBack className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => setIsPaused((p) => !p)}
            className={`flex h-16 w-16 items-center justify-center rounded-full shadow-xl transition-transform active:scale-95 ${
              isPaused
                ? 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400'
                : 'bg-white text-neutral-950 hover:bg-neutral-100'
            }`}
            title={isPaused ? 'Resume (Space)' : 'Pause (Space)'}
            aria-label={isPaused ? 'Resume workout' : 'Pause workout'}
          >
            {isPaused ? <Play className="h-7 w-7 fill-current ml-0.5" /> : <Pause className="h-7 w-7 fill-current" />}
          </button>

          <button
            type="button"
            onClick={handleSkipForward}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
            title="Skip (Right Arrow)"
            aria-label="Skip to next step"
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        {/* Status Indicators: WakeLock */}
        <div className="mt-2 flex items-center justify-center gap-4 text-[11px] text-neutral-500">
          {isWakeLockSupported && (
            <span className={`inline-flex items-center gap-1 ${isLocked ? 'text-emerald-500' : 'text-neutral-500'}`}>
              <ShieldCheck className="h-3 w-3" />
              {isLocked ? 'Screen Kept Awake' : 'Screen Wake Lock Inactive'}
            </span>
          )}
          <span>Space: Pause/Play</span>
        </div>
      </footer>

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center shadow-2xl">
            <h3 className="text-xl font-bold text-white">Leave Workout?</h3>
            <p className="mt-2 text-sm text-neutral-400">
              Your progress for this 15-minute session will not be saved.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="flex-1 rounded-xl bg-neutral-800 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700 transition-colors"
              >
                Continue Workout
              </button>
              <button
                type="button"
                onClick={onExit}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-500 transition-colors"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
