import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
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

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

interface WorkoutRunnerProps {
  workout: WorkoutPlan;
  onComplete: (summary: { totalTimeSeconds: number; workout: WorkoutPlan }) => void;
  onExit: () => void;
}

export function WorkoutRunner({ workout, onComplete, onExit }: WorkoutRunnerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(() => soundEngine.getMuted());
  const [showExitModal, setShowExitModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const currentStep = workout.steps[currentStepIndex];
  const currentPhase = currentStep.phase;

  // Whole workout view adapts the colors of the active phase:
  // warmup: Emerald | main: Sky Blue | cooldown: Purple
  const phaseTheme = useMemo(() => {
    switch (currentPhase) {
      case 'warmup':
        return {
          playBtn: 'bg-emerald-400 text-neutral-950 hover:bg-emerald-300 shadow-[0_0_24px_rgba(52,211,153,0.45)]',
          playBtnPaused: 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400 shadow-[0_0_24px_rgba(52,211,153,0.6)] animate-pulse',
          badge: 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400',
          repsCardHover: 'hover:border-emerald-500/50 hover:shadow-[0_0_24px_rgba(52,211,153,0.15)]',
          repsNumberHover: 'group-hover:text-emerald-400',
          repActionText: 'text-emerald-400',
          stepBadge: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/20',
          headerBorder: 'border-emerald-500/20',
          footerBorder: 'border-emerald-500/20',
          controlHover: 'hover:border-emerald-500/50 hover:text-emerald-300 hover:bg-emerald-950/20',
          timerPill: 'border-emerald-500/40 text-emerald-300',
        };
      case 'cooldown':
        return {
          playBtn: 'bg-purple-400 text-neutral-950 hover:bg-purple-300 shadow-[0_0_24px_rgba(192,132,252,0.45)]',
          playBtnPaused: 'bg-purple-500 text-neutral-950 hover:bg-purple-400 shadow-[0_0_24px_rgba(192,132,252,0.6)] animate-pulse',
          badge: 'bg-purple-500/15 border border-purple-500/40 text-purple-400',
          repsCardHover: 'hover:border-purple-500/50 hover:shadow-[0_0_24px_rgba(192,132,252,0.15)]',
          repsNumberHover: 'group-hover:text-purple-400',
          repActionText: 'text-purple-400',
          stepBadge: 'border-purple-500/40 text-purple-300 bg-purple-950/20',
          headerBorder: 'border-purple-500/20',
          footerBorder: 'border-purple-500/20',
          controlHover: 'hover:border-purple-500/50 hover:text-purple-300 hover:bg-purple-950/20',
          timerPill: 'border-purple-500/40 text-purple-300',
        };
      case 'main':
      default:
        return {
          playBtn: 'bg-sky-400 text-neutral-950 hover:bg-sky-300 shadow-[0_0_24px_rgba(56,189,248,0.45)]',
          playBtnPaused: 'bg-sky-500 text-neutral-950 hover:bg-sky-400 shadow-[0_0_24px_rgba(56,189,248,0.6)] animate-pulse',
          badge: 'bg-sky-500/15 border border-sky-500/40 text-sky-400',
          repsCardHover: 'hover:border-sky-500/50 hover:shadow-[0_0_24px_rgba(56,189,248,0.15)]',
          repsNumberHover: 'group-hover:text-sky-400',
          repActionText: 'text-sky-400',
          stepBadge: 'border-sky-500/40 text-sky-300 bg-sky-950/20',
          headerBorder: 'border-sky-500/20',
          footerBorder: 'border-sky-500/20',
          controlHover: 'hover:border-sky-500/50 hover:text-sky-300 hover:bg-sky-950/20',
          timerPill: 'border-sky-500/40 text-sky-300',
        };
    }
  }, [currentPhase]);

  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => currentStep.workDurationSeconds);
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState(0);

  // Derive large 3-step actionable instructions for the current exercise
  const quickSteps = useMemo(() => getQuickSteps(currentStep.exercise), [currentStep.exercise]);

  // Keep screen awake while workout is active and not paused
  useWakeLock(!isPaused);

  // Sound unlock on mount
  useEffect(() => {
    soundEngine.init();
  }, []);

  // Sync mute state
  const handleToggleMute = useCallback(() => {
    const nextMute = soundEngine.toggleMute();
    setIsMuted(nextMute);
  }, []);

  // Advance immediately to next exercise without pause
  const advance = useCallback(() => {
    if (currentStepIndex < workout.steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      setSecondsRemaining(workout.steps[nextIdx].workDurationSeconds);
      soundEngine.playTransitionChime();
    } else {
      soundEngine.playCompletionFanfare();
      onComplete({
        totalTimeSeconds: workout.totalDurationSeconds,
        workout,
      });
    }
  }, [currentStepIndex, workout, onComplete]);

  // Skip forward button
  const handleSkipForward = useCallback(() => {
    if (currentStepIndex < workout.steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
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
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      setSecondsRemaining(workout.steps[prevIdx].workDurationSeconds);
    } else {
      setSecondsRemaining(currentStep.workDurationSeconds);
    }
  }, [currentStepIndex, currentStep, workout.steps]);

  // Main countdown timer interval
  const advanceRef = useRef(advance);
  useEffect(() => {
    advanceRef.current = advance;
  }, [advance]);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTotalElapsedSeconds((prev) => prev + 1);

      // Rep-based exercises do not auto-advance after a timer
      if (currentStep.exercise.type !== 'time') {
        return;
      }

      setSecondsRemaining((prev) => {
        const next = prev - 1;

        // Sound pips for countdown on timed exercises
        if (next <= 5 && next >= 1) {
          soundEngine.playPip();
        }

        if (next <= 0) {
          setTimeout(() => advanceRef.current(), 0);
          return 0;
        }

        return next;
      });
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
      } else if (e.code === 'Enter' && currentStep.exercise.type === 'reps') {
        e.preventDefault();
        advance();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSkipForward, handleSkipBack, handleToggleMute, advance, currentStep, showExitModal, showDetailsModal]);

  const maxDuration = currentStep.workDurationSeconds;
  const strokePercent = maxDuration > 0 ? (secondsRemaining / maxDuration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-black text-white select-none">
      {/* Standalone Status Bar: 2-stage progress has its own dedicated space */}
      <header className={`border-b ${phaseTheme.headerBorder} bg-black/90 px-4 sm:px-6 pt-3 pb-2.5 backdrop-blur-md transition-colors duration-300`}>
        <div className="mx-auto max-w-2xl md:max-w-3xl">
          <ProgressBar
            workout={workout}
            currentStep={currentStep}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-3xl lg:max-w-4xl flex-col items-center justify-between pb-6">
          <div className="flex w-full flex-col items-center">
            {/* Merged Hero: Full-width animation with top controls overlay and title */}
            <div className="w-full max-w-full sm:max-w-2xl md:max-w-3xl aspect-[3/2] max-h-[44vh] relative shrink-0 sm:rounded-3xl sm:mt-2 overflow-hidden bg-black">
              <ExerciseVisual
                key={currentStep.exercise.id}
                exercise={currentStep.exercise}
                isPaused={isPaused}
                overlayGradient={true}
                className="h-full w-full"
              >
                {/* Top Controls Overlay on image: give up (left), timer (center), mute (right) */}
                <div className="absolute top-3 inset-x-3 sm:top-4 sm:inset-x-4 z-20 flex items-center justify-between pointer-events-none">
                  <button
                    type="button"
                    onClick={() => setShowExitModal(true)}
                    className="pointer-events-auto rounded-full bg-black/60 hover:bg-black/90 px-3 py-1 font-mono text-[11px] sm:text-xs font-medium text-neutral-300 hover:text-rose-400 border border-neutral-800/80 backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    give up
                  </button>

                  <div className={`pointer-events-auto rounded-full bg-black/60 px-3 py-1 font-mono text-xs font-semibold border ${phaseTheme.timerPill} backdrop-blur-md tabular-nums tracking-wider shadow-sm transition-colors`}>
                    {formatTime(totalElapsedSeconds)}
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleMute}
                    className="pointer-events-auto flex h-7 w-7 sm:h-7.5 sm:w-7.5 items-center justify-center rounded-full bg-black/60 hover:bg-black/90 text-neutral-300 hover:text-white border border-neutral-800/80 backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-sm"
                    title={isMuted ? 'Unmute countdowns' : 'Mute countdowns'}
                    aria-label={isMuted ? 'Unmute countdowns' : 'Mute countdowns'}
                  >
                    {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* Title & metadata at bottom edge */}
                <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-2 pt-6 text-center flex flex-col items-center justify-end">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                    {currentStep.exercise.name}
                  </h1>
                  <div className="mt-0.5 flex items-center justify-center gap-2 font-mono text-[11px] sm:text-xs text-neutral-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)]">
                    <span className="capitalize">{currentStep.exercise.primaryMuscles.join(', ')}</span>
                    <span className="text-neutral-500">•</span>
                    <span className="text-neutral-400">Step {currentStepIndex + 1}/{workout.steps.length}</span>
                  </div>
                </div>
              </ExerciseVisual>
            </div>

            {/* Central Display: Standard Set with Reps vs Timed Progress Ring (Plank/Holds) */}
            {currentStep.exercise.type === 'reps' ? (
              <div className="flex flex-col items-center justify-center shrink-0 my-4 sm:my-5">
                {/* Standard Set Indicator Badge */}
                <div className="mb-2">
                  <span className={`rounded-full ${phaseTheme.badge} px-3.5 py-1 font-mono text-xs uppercase tracking-widest font-semibold shadow-sm transition-colors`}>
                    {currentStep.round ? `Set ${currentStep.round} of 2` : 'Standard Set'}
                  </span>
                </div>

                {/* Big Reps Count Display */}
                <div
                  onClick={advance}
                  className={`group flex flex-col items-center justify-center rounded-3xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-900 ${phaseTheme.repsCardHover} px-8 sm:px-10 py-4 transition-all duration-200 active:scale-95 cursor-pointer shadow-lg`}
                  title="Tap to complete set"
                >
                  <div className="flex items-baseline gap-2.5">
                    <span className={`font-mono text-5xl sm:text-6xl md:text-7xl font-black tabular-nums tracking-tighter text-white ${phaseTheme.repsNumberHover} transition-colors`}>
                      {currentStep.targetReps ?? 12}
                    </span>
                    <span className="font-mono text-lg sm:text-xl font-bold uppercase tracking-wider text-neutral-400 group-hover:text-neutral-300 transition-colors">
                      Reps
                    </span>
                  </div>

                  <div className={`mt-2 flex items-center gap-1.5 text-xs font-semibold ${phaseTheme.repActionText} transition-colors`}>
                    <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
                    <span>Tap to Complete Set</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Timed Progress Ring (Plank, Stretches, Isometric Holds) */
              <div className="flex flex-col items-center justify-center shrink-0 my-4 sm:my-5">
                <div className="relative flex h-32 w-32 sm:h-36 sm:w-36 md:h-40 md:w-40 items-center justify-center">
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
                    <span className="font-mono text-4xl sm:text-5xl md:text-6xl font-black tabular-nums tracking-tighter">
                      {secondsRemaining}
                    </span>
                    <span className="text-[10px] sm:text-xs uppercase font-semibold tracking-wider text-neutral-400 mt-0.5">
                      Seconds
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Floating 3-Step Process */}
            <div className="w-full max-w-xl md:max-w-2xl px-5 sm:px-0 text-left">
              <ol className="space-y-3.5">
                {quickSteps.map((stepText, idx) => (
                  <li key={idx} className="flex items-start gap-3.5">
                    <span className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full border ${phaseTheme.stepBadge} font-mono text-xs sm:text-sm font-bold mt-0.5 transition-colors`}>
                      {idx + 1}
                    </span>
                    <p className="text-base sm:text-lg md:text-xl font-medium text-neutral-100 leading-relaxed">
                      {stepText}
                    </p>
                  </li>
                ))}
              </ol>

              {/* Details Button */}
              <div className="mt-4 flex justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => {
                    setIsPaused(true);
                    setShowDetailsModal(true);
                  }}
                  className="inline-flex items-center gap-2 font-mono text-xs sm:text-sm font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-full px-4 py-2 transition-all active:scale-95 shadow-sm cursor-pointer"
                >
                  <Info className="h-4 w-4 text-neutral-400" />
                  <span>Details</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Controls Bar */}
      <footer className={`border-t ${phaseTheme.footerBorder} bg-black px-4 py-4 transition-colors duration-300`}>
        <div className="mx-auto flex max-w-md items-center justify-between gap-6">
          <button
            type="button"
            onClick={handleSkipBack}
            className={`flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-neutral-300 ${phaseTheme.controlHover} transition-all`}
            title="Previous (Left Arrow)"
            aria-label="Previous step"
          >
            <SkipBack className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => setIsPaused((p) => !p)}
            className={`flex h-16 w-16 items-center justify-center rounded-full shadow-xl transition-all active:scale-95 ${
              isPaused ? phaseTheme.playBtnPaused : phaseTheme.playBtn
            }`}
            title={isPaused ? 'Resume (Space)' : 'Pause (Space)'}
            aria-label={isPaused ? 'Resume workout' : 'Pause workout'}
          >
            {isPaused ? <Play className="h-7 w-7 fill-current ml-0.5" /> : <Pause className="h-7 w-7 fill-current" />}
          </button>

          <button
            type="button"
            onClick={handleSkipForward}
            className={`flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-neutral-300 ${phaseTheme.controlHover} transition-all`}
            title="Skip (Right Arrow)"
            aria-label="Skip to next step"
          >
            <SkipForward className="h-5 w-5" />
          </button>
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
