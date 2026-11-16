import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  X,
  Info,
} from 'lucide-react';
import type { WorkoutPlan, WorkoutStep } from '../../types/workout';
import { soundEngine } from '../../utils/audio';
import { useWakeLock } from '../../hooks/useWakeLock';
import { getQuickSteps } from '../../utils/exerciseSteps';
import { ExerciseVisual } from './ExerciseVisual';
import { ProgressBar } from './ProgressBar';
import { ExerciseDetailsModal } from './ExerciseDetailsModal';

const INTRO_DURATION_SECONDS = 7;

const getInitialIntro = (step: WorkoutStep) =>
  !step.isRest && step.exercise.type === 'time' ? INTRO_DURATION_SECONDS : 0;

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

interface WorkoutRunnerProps {
  workout: WorkoutPlan;
  onComplete: (summary: {
    totalTimeSeconds: number;
    workout: WorkoutPlan;
  }) => void;
  onExit: () => void;
}

export function WorkoutRunner({
  workout,
  onComplete,
  onExit,
}: WorkoutRunnerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(() => soundEngine.getMuted());
  const [showExitModal, setShowExitModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const currentStep = workout.steps[currentStepIndex];

  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    () => currentStep.workDurationSeconds,
  );
  const [introSecondsRemaining, setIntroSecondsRemaining] = useState<number>(
    () => getInitialIntro(currentStep),
  );
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState(0);
  const secondsRemainingRef = useRef(currentStep.workDurationSeconds);
  const introRemainingRef = useRef(getInitialIntro(currentStep));

  const syncStepTimers = useCallback((step: WorkoutStep) => {
    const nextIntro = getInitialIntro(step);
    secondsRemainingRef.current = step.workDurationSeconds;
    introRemainingRef.current = nextIntro;
    setSecondsRemaining(step.workDurationSeconds);
    setIntroSecondsRemaining(nextIntro);
  }, []);

  const handleSkipIntro = useCallback(() => {
    introRemainingRef.current = 0;
    setIntroSecondsRemaining(0);
  }, []);

  // Derive quick action cues for the current exercise
  const quickSteps = useMemo(() => {
    if (currentStep.isRest) {
      return [
        'Take deep breaths through your nose to lower heart rate.',
        'Sip water and shake out tension in working muscles.',
        'Prepare for the next round.',
      ];
    }
    return getQuickSteps(currentStep.exercise);
  }, [currentStep.exercise, currentStep.isRest]);

  // Screen WakeLock while active
  useWakeLock(!isPaused);

  // Audio engine initialization
  useEffect(() => {
    soundEngine.init();
  }, []);

  const handleToggleMute = useCallback(() => {
    const nextMute = soundEngine.toggleMute();
    setIsMuted(nextMute);
  }, []);

  // Advance to next step
  const advance = useCallback(() => {
    if (currentStepIndex < workout.steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      const nextStep = workout.steps[nextIdx];

      setCurrentStepIndex(nextIdx);
      syncStepTimers(nextStep);
      soundEngine.playTransitionChime();
    } else {
      soundEngine.playCompletionFanfare();
      onComplete({
        totalTimeSeconds: workout.totalDurationSeconds,
        workout,
      });
    }
  }, [currentStepIndex, workout, onComplete, syncStepTimers]);

  // Skip forward
  const handleSkipForward = useCallback(() => {
    if (currentStepIndex < workout.steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      const nextStep = workout.steps[nextIdx];

      setCurrentStepIndex(nextIdx);
      syncStepTimers(nextStep);
    } else {
      onComplete({
        totalTimeSeconds: totalElapsedSeconds,
        workout,
      });
    }
  }, [currentStepIndex, workout, onComplete, totalElapsedSeconds, syncStepTimers]);

  // Skip back
  const handleSkipBack = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      const prevStep = workout.steps[prevIdx];

      setCurrentStepIndex(prevIdx);
      syncStepTimers(prevStep);
    } else {
      syncStepTimers(currentStep);
    }
  }, [currentStepIndex, currentStep, workout.steps, syncStepTimers]);

  // Timer interval
  const advanceRef = useRef(advance);
  useEffect(() => {
    advanceRef.current = advance;
  }, [advance]);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTotalElapsedSeconds((prev) => prev + 1);

      // Rep-based exercises advance manually
      if (currentStep.exercise.type !== 'time') {
        return;
      }

      if (introRemainingRef.current > 0) {
        introRemainingRef.current -= 1;
        const nextIntro = introRemainingRef.current;
        setIntroSecondsRemaining(nextIntro);
        if (nextIntro === 0) {
          soundEngine.playPip(880, 0.5);
        }
        return;
      }

      secondsRemainingRef.current -= 1;
      const nextSec = secondsRemainingRef.current;
      setSecondsRemaining(nextSec);

      if (nextSec <= 3 && nextSec >= 1) {
        soundEngine.playPip();
      }

      if (nextSec <= 0) {
        setTimeout(() => advanceRef.current(), 0);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, currentStepIndex, currentStep.exercise.type]);

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
      } else if (e.code === 'Enter') {
        if (introRemainingRef.current > 0) {
          e.preventDefault();
          handleSkipIntro();
        } else if (currentStep.exercise.type === 'reps') {
          e.preventDefault();
          advance();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleSkipForward,
    handleSkipBack,
    handleToggleMute,
    handleSkipIntro,
    advance,
    currentStep,
    showExitModal,
    showDetailsModal,
  ]);

  const isRepBased = currentStep.exercise.type === 'reps';

  return (
    <div className="fixed inset-0 h-dvh z-50 flex flex-col justify-between bg-black text-white select-none">
      {/* Top Header: Progress and status bar */}
      <header className="border-b border-neutral-800 bg-black/95 px-4 sm:px-6 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 backdrop-blur-md">
        <div className="mx-auto max-w-2xl">
          <ProgressBar
            workout={workout}
            currentStep={currentStep}
            nextStep={workout.steps[currentStepIndex + 1]}
          />

          <div className="mt-2.5 flex items-center justify-between font-mono text-lg text-neutral-300">
            <button
              type="button"
              onClick={() => setShowExitModal(true)}
              className="inline-flex items-center gap-1.5 min-h-11 px-2.5 -ml-2.5 rounded-lg text-lg text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
              <span>Exit</span>
            </button>

            <span className="tabular-nums text-white font-semibold tracking-wider">
              {formatTime(totalElapsedSeconds)}
            </span>

            <button
              type="button"
              onClick={handleToggleMute}
              className="flex h-11 w-11 -mr-2.5 items-center justify-center rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 py-3 sm:py-5 flex flex-col items-center justify-between gap-2 sm:gap-4 max-w-2xl mx-auto w-full">
        {/* Stage 1: Exercise Visual */}
        <div className="w-full aspect-3/2 max-h-[25dvh] sm:max-h-[34dvh] relative rounded-lg overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center shrink-0">
          {currentStep.isRest ? (
            <div className="text-center p-6">
              <span className="font-mono text-lg uppercase tracking-widest text-neutral-400">
                Active Recovery
              </span>
              <h2 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Rest &amp; Recover
              </h2>
            </div>
          ) : (
            <ExerciseVisual
              key={currentStep.exercise.id}
              exercise={currentStep.exercise}
              isPaused={isPaused}
              className="h-full w-full"
            />
          )}
        </div>

        {/* Stage 2: Exercise Name & Side */}
        <div className="text-center mt-1 shrink-0 px-1 w-full">
          <h1 className="text-[clamp(1.875rem,7.2vw,3.25rem)] font-bold tracking-[-0.025em] text-white leading-[1.03] text-balance">
            {currentStep.exercise.name}
          </h1>
          {currentStep.side && (
            <span className="mt-1.5 inline-block font-mono text-lg sm:text-xl font-bold uppercase tracking-widest text-amber-400">
              {currentStep.side === 'right' ? 'Right Side' : 'Left Side'}
            </span>
          )}
        </div>

        {/* Stage 3: Target Metric Display (High-legibility brutalist numerals) */}
        <div className="my-auto py-1 flex flex-col items-center justify-center w-full shrink-0">
          {isRepBased ? (
            <button
              type="button"
              onClick={advance}
              className="group w-full max-w-sm flex flex-col items-center justify-center rounded-lg border-2 border-neutral-700 bg-neutral-950 hover:bg-neutral-900 hover:border-white px-6 py-4 sm:py-5 transition-all cursor-pointer active:scale-[0.98]"
              title="Click or press Enter when done"
            >
              <div className="flex items-baseline justify-center gap-3">
                <span className="font-sans text-[clamp(5.75rem,25vw,9rem)] font-bold tabular-nums leading-[0.84] tracking-[-0.045em] text-white">
                  {currentStep.targetReps ?? 10}
                </span>
                <span className="font-mono text-xl sm:text-2xl uppercase tracking-widest text-neutral-400 font-bold">
                  Reps
                </span>
              </div>
              <span className="mt-3 text-lg font-mono font-semibold uppercase tracking-wider text-neutral-300 group-hover:text-white transition-colors">
                Tap when done
              </span>
            </button>
          ) : introSecondsRemaining > 0 ? (
            <button
              type="button"
              onClick={handleSkipIntro}
              aria-label={`Get into position: ${introSecondsRemaining} seconds remaining. Tap to start now.`}
              title="Tap or press Enter to start now"
              className="group w-full max-w-sm flex flex-col items-center justify-center rounded-lg border-2 border-amber-400/70 bg-neutral-950 hover:bg-neutral-900 px-6 py-3.5 sm:py-4 transition-all cursor-pointer active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
            >
              <span className="font-mono text-lg sm:text-xl uppercase tracking-widest font-bold text-amber-400">
                Get into position
              </span>

              <div className="mt-1.5 flex items-baseline justify-center gap-2.5">
                <span className="font-sans text-[clamp(5rem,22vw,7.5rem)] font-bold tabular-nums leading-[0.86] tracking-[-0.045em] text-white">
                  {introSecondsRemaining}
                </span>
                <span className="font-mono text-lg sm:text-xl uppercase tracking-widest text-amber-400 font-bold">
                  Sec
                </span>
              </div>

              <div className="mt-3 h-2 w-full overflow-hidden bg-neutral-800">
                <div
                  className="h-full bg-amber-400 transition-all duration-1000 ease-linear motion-reduce:transition-none"
                  style={{
                    width: `${(introSecondsRemaining / INTRO_DURATION_SECONDS) * 100}%`,
                  }}
                />
              </div>

              <span className="mt-2.5 text-lg font-mono font-semibold uppercase tracking-wider text-neutral-300 group-hover:text-white transition-colors">
                Tap to start now
              </span>
            </button>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-baseline justify-center gap-3">
                <span
                  className={`font-sans text-[clamp(6.5rem,28vw,10rem)] font-bold tabular-nums leading-[0.84] tracking-[-0.045em] ${
                    secondsRemaining <= 3 ? 'text-rose-400' : 'text-white'
                  }`}
                >
                  {secondsRemaining}
                </span>
                <span className="font-mono text-xl sm:text-2xl uppercase tracking-widest text-neutral-400 font-bold">
                  Sec
                </span>
              </div>

              {currentStep.isRest && (
                <button
                  type="button"
                  onClick={advance}
                  className="mt-4 min-h-12 inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 px-5 py-2.5 font-mono text-lg font-semibold uppercase tracking-wider text-neutral-200 hover:text-white hover:border-white active:scale-95 transition-all cursor-pointer"
                >
                  <SkipForward className="h-5 w-5" />
                  <span>Skip Rest</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Stage 4: Form Cues */}
        {!currentStep.isRest && (
          <div className="w-full max-w-xl mt-1 pt-2 border-t border-neutral-900 px-1 shrink-0">
            <ul className="space-y-1.5 text-lg text-neutral-300 leading-snug">
              {quickSteps.slice(0, 2).map((stepText, idx) => (
                <li key={idx} className="flex items-baseline gap-2.5">
                  <span className="text-neutral-500 font-mono text-lg font-bold tabular-nums">
                    0{idx + 1}
                  </span>
                  <span>{stepText}</span>
                </li>
              ))}
            </ul>

            <div className="mt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsPaused(true);
                  setShowDetailsModal(true);
                }}
                className="inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-lg font-mono text-lg uppercase tracking-wider text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                <Info className="h-5 w-5" />
                <span>Instructions</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Controls Bar */}
      <footer className="border-t border-neutral-800 bg-black px-6 pt-3 pb-[max(0.85rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-sm items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleSkipBack}
            className="flex h-13 w-13 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-300 hover:text-white hover:border-neutral-600 active:scale-95 transition-all cursor-pointer"
            title="Previous (Arrow Left)"
            aria-label="Previous step"
          >
            <SkipBack className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => setIsPaused((p) => !p)}
            className="flex h-15 w-20 items-center justify-center rounded-lg bg-white text-neutral-950 hover:bg-neutral-200 transition-all active:scale-95 cursor-pointer"
            title={isPaused ? 'Resume (Space)' : 'Pause (Space)'}
            aria-label={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? (
              <Play className="h-7 w-7 fill-current ml-0.5" />
            ) : (
              <Pause className="h-7 w-7 fill-current" />
            )}
          </button>

          <button
            type="button"
            onClick={handleSkipForward}
            className="flex h-13 w-13 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-300 hover:text-white hover:border-neutral-600 active:scale-95 transition-all cursor-pointer"
            title="Skip (Arrow Right)"
            aria-label="Skip step"
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>
      </footer>

      {/* Details Modal */}
      {showDetailsModal && (
        <ExerciseDetailsModal
          exercise={currentStep.exercise}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border border-neutral-800 bg-neutral-950 p-6 text-center">
            <h3 className="text-2xl font-bold tracking-tight text-white">Leave Workout?</h3>
            <p className="mt-2 text-lg text-neutral-300 leading-snug">
              Current progress will not be saved.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="flex-1 min-h-12 rounded-lg bg-neutral-800 py-3 text-lg font-bold text-white hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitModal(false);
                  onExit();
                }}
                className="flex-1 min-h-12 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 py-3 text-lg font-bold hover:bg-rose-500/30 transition-colors cursor-pointer"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
