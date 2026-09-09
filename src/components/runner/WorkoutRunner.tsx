import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  Info,
} from 'lucide-react';
import type { WorkoutPlan } from '../../types/workout';
import { soundEngine } from '../../utils/audio';
import { useWakeLock } from '../../hooks/useWakeLock';
import { getQuickSteps } from '../../utils/exerciseSteps';
import { ExerciseVisual } from './ExerciseVisual';
import { ProgressBar } from './ProgressBar';
import { ExerciseDetailsModal } from './ExerciseDetailsModal';

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
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const currentStep = workout.steps[currentStepIndex];
  const nextStep = currentStepIndex < workout.steps.length - 1 ? workout.steps[currentStepIndex + 1] : null;

  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => currentStep.workDurationSeconds);
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState(0);

  // Derive large 3-step actionable instructions for the current exercise
  const quickSteps = useMemo(() => getQuickSteps(currentStep.exercise), [currentStep.exercise]);

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
        setSubState('rest');
        setSecondsRemaining(Math.round(restDuration));
        soundEngine.playTransitionChime();
      } else if (currentStepIndex < workout.steps.length - 1) {
        const nextIdx = currentStepIndex + 1;
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
    } else {
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
      if (showExitModal || showDetailsModal) return;
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
  }, [handleSkipForward, handleSkipBack, handleToggleMute, showExitModal, showDetailsModal]);

  const maxDuration = subState === 'work' ? currentStep.workDurationSeconds : currentStep.restDurationSeconds;
  const strokePercent = maxDuration > 0 ? (secondsRemaining / maxDuration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-black text-white select-none">
      {/* Top Bar: Progress, WakeLock status, Controls */}
      <header className="border-b border-neutral-900 bg-black/80 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl lg:max-w-4xl items-center justify-between gap-4">
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
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto flex min-h-full w-full max-w-3xl lg:max-w-4xl flex-col items-center justify-center">
          {subState === 'work' ? (
            /* WORK STATE */
            <div className="my-auto flex w-full flex-col items-center justify-center gap-5 sm:gap-6 py-2">
              {/* Title & target muscles */}
              <div className="text-center">
                <div className="font-mono text-xs uppercase tracking-wider text-neutral-400">
                  Exercise {currentStepIndex + 1} of {workout.steps.length} • {currentStep.phase}
                </div>
                <h1 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
                  {currentStep.exercise.name}
                </h1>
                <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5 font-mono text-xs sm:text-sm text-neutral-400">
                  <span className="capitalize">{currentStep.exercise.primaryMuscles.join(', ')}</span>
                </div>
              </div>

              {/* Central Hero: Big Visual Animation & Big Timer */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 md:gap-14 w-full my-2 sm:my-3">
                {/* Visual demo animation */}
                <div className="w-72 sm:w-80 md:w-96 lg:w-[26rem] max-w-[calc(100vw-2.5rem)] aspect-4/3 relative shrink-0">
                  <ExerciseVisual
                    key={currentStep.exercise.id}
                    exercise={currentStep.exercise}
                    isPaused={isPaused}
                    className="h-full w-full shadow-2xl ring-1 ring-neutral-800 bg-neutral-900"
                  />
                </div>

                {/* Big Countdown Ring & Reps */}
                <div
                  onClick={() => {
                    if (currentStep.exercise.type === 'reps') {
                      advance();
                    }
                  }}
                  className={`flex flex-col items-center justify-center cursor-pointer transition-transform shrink-0 ${
                    currentStep.exercise.type === 'reps' ? 'active:scale-95' : ''
                  }`}
                >
                  <div className="relative flex h-36 w-36 sm:h-44 sm:w-44 md:h-52 md:w-52 items-center justify-center">
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
                      <span className="font-mono text-5xl sm:text-6xl md:text-7xl font-black tabular-nums tracking-tighter">
                        {secondsRemaining}
                      </span>
                      <span className="text-[11px] sm:text-xs uppercase font-semibold tracking-wider text-neutral-400 mt-0.5">
                        {currentStep.exercise.type === 'reps' ? 'Sec' : 'Seconds'}
                      </span>
                    </div>
                  </div>

                  {currentStep.exercise.type === 'reps' && (
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-neutral-800 px-3.5 py-1.5 text-xs font-semibold text-neutral-200 border border-neutral-700 shadow-md">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Target: {currentStep.targetReps} reps • <span className="text-neutral-400">Tap when done</span></span>
                    </div>
                  )}
                </div>
              </div>

              {/* 3-Step Process Card */}
              <div className="w-full max-w-xl md:max-w-2xl rounded-2xl bg-neutral-900/60 border border-neutral-800/80 p-5 sm:p-6 text-left shadow-xl backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4 border-b border-neutral-800/70 pb-3">
                  <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 font-semibold">
                    How To Do It • 3 Key Steps
                  </span>
                  <span className="font-mono text-[11px] text-neutral-500 uppercase tracking-wider">Form Focus</span>
                </div>

                <ol className="space-y-4">
                  {quickSteps.map((stepText, idx) => (
                    <li key={idx} className="flex items-start gap-3.5">
                      <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-neutral-800 border border-neutral-700/80 font-mono text-xs sm:text-sm font-bold text-neutral-200 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-base sm:text-lg md:text-xl font-medium text-neutral-100 leading-relaxed">
                        {stepText}
                      </p>
                    </li>
                  ))}
                </ol>

                {/* Details Button below the steps */}
                <div className="mt-5 pt-3.5 border-t border-neutral-800/80 flex items-center justify-between">
                  <span className="font-mono text-xs text-neutral-400">
                    Need complete technique instructions?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPaused(true);
                      setShowDetailsModal(true);
                    }}
                    className="inline-flex items-center gap-2 font-mono text-xs sm:text-sm font-medium text-neutral-200 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-full px-4 py-2 transition-all active:scale-95 shadow-sm cursor-pointer"
                  >
                    <Info className="h-4 w-4 text-neutral-400" />
                    <span>Details</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* REST & TRANSITION STATE */
            <div className="my-auto flex h-full w-full flex-col items-center justify-center gap-6 py-4 text-center">
              <div>
                <span className="inline-block rounded-full bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 text-xs font-mono uppercase tracking-widest text-amber-400">
                  Rest & Prepare
                </span>
                <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-white">Catch Your Breath</h2>
              </div>

              {/* Big Rest Timer */}
              <div className="relative flex h-40 w-40 sm:h-48 sm:w-48 md:h-56 md:w-56 items-center justify-center">
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
                  <span className="font-mono text-5xl sm:text-6xl md:text-7xl font-black tabular-nums text-amber-400 tracking-tighter">
                    {secondsRemaining}
                  </span>
                  <span className="text-xs uppercase font-semibold text-neutral-400 tracking-wider mt-0.5">Rest</span>
                </div>
              </div>

              {/* Next Exercise Preview */}
              {nextStep && (
                <div className="flex w-full max-w-md items-center gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/90 p-4 text-left shadow-lg">
                  <div className="h-20 w-20 overflow-hidden rounded-xl bg-neutral-950 shrink-0">
                    <img
                      src={nextStep.exercise.images[0]}
                      alt={nextStep.exercise.name}
                      className="h-full w-full object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-xs uppercase tracking-wider text-neutral-400">Up Next</div>
                    <div className="truncate text-lg font-semibold text-white">{nextStep.exercise.name}</div>
                    <div className="text-xs text-neutral-400 truncate">
                      {nextStep.exercise.primaryMuscles.join(', ')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Controls Bar */}
      <footer className="border-t border-neutral-900 bg-black px-4 py-4">
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
        <div className="mt-2 flex items-center justify-center gap-4 text-[11px] text-neutral-500 font-mono">
          {isWakeLockSupported && (
            <span className={`inline-flex items-center gap-1 ${isLocked ? 'text-emerald-500' : 'text-neutral-500'}`}>
              <ShieldCheck className="h-3 w-3" />
              {isLocked ? 'Screen Kept Awake' : 'Wake Lock Inactive'}
            </span>
          )}
          <span>Space: Pause/Play</span>
        </div>
      </footer>

      {/* Full Exercise Details Modal */}
      {showDetailsModal && (
        <ExerciseDetailsModal
          exercise={currentStep.exercise}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
          }}
        />
      )}

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
                Continue
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
