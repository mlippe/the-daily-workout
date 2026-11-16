import { useState } from 'react';
import { Check, ArrowLeft } from 'lucide-react';
import type { WorkoutDifficulty, WorkoutFeedback, WorkoutPlan } from '../../types/workout';
import type { FeedbackStreak } from '../../utils/storage';

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const NEXT_LEVEL: Record<WorkoutDifficulty, WorkoutDifficulty | null> = {
  easy: 'medium',
  medium: 'hard',
  hard: null,
};

const PREV_LEVEL: Record<WorkoutDifficulty, WorkoutDifficulty | null> = {
  easy: null,
  medium: 'easy',
  hard: 'medium',
};

const LABEL: Record<WorkoutDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

interface CompletionScreenProps {
  workout: WorkoutPlan;
  streak: number;
  totalCompleted: number;
  currentTargetReps: number;
  currentDifficulty: WorkoutDifficulty;
  feedbackStreak: FeedbackStreak;
  onFinish: (feedback: WorkoutFeedback) => void;
}

export function CompletionScreen({
  workout,
  streak,
  totalCompleted,
  currentTargetReps,
  currentDifficulty,
  feedbackStreak,
  onFinish,
}: CompletionScreenProps) {
  const [selected, setSelected] = useState<WorkoutFeedback>('okay');

  const getAdaptationPreview = () => {
    if (selected === 'easy') {
      const nextCount = feedbackStreak.rating === 'easy' ? feedbackStreak.count + 1 : 1;
      const up = NEXT_LEVEL[currentDifficulty];
      if (up && nextCount >= 2) {
        return `Level up -> ${LABEL[up]} routines (10 reps)`;
      }
      if (up) {
        return `+1 rep (${Math.min(14, currentTargetReps + 1)}r) • 1 more Easy -> ${LABEL[up]}`;
      }
      return `Top tier • Next target ${Math.min(14, currentTargetReps + 1)} reps`;
    }

    if (selected === 'hard') {
      const nextCount = feedbackStreak.rating === 'hard' ? feedbackStreak.count + 1 : 1;
      const down = PREV_LEVEL[currentDifficulty];
      if (down && nextCount >= 2) {
        return `Stepping down -> ${LABEL[down]} routines (10 reps)`;
      }
      if (down) {
        return `-1 rep (${Math.max(8, currentTargetReps - 1)}r) • 1 more Hard -> ${LABEL[down]}`;
      }
      return `Keeping ${LABEL[currentDifficulty]} • Next target ${Math.max(8, currentTargetReps - 1)} reps`;
    }

    return `Steady at ${LABEL[currentDifficulty]} • ${currentTargetReps} reps`;
  };

  const previewNextReps = () => {
    if (selected === 'easy') {
      const nextCount = feedbackStreak.rating === 'easy' ? feedbackStreak.count + 1 : 1;
      if (NEXT_LEVEL[currentDifficulty] && nextCount >= 2) return 10;
      return Math.min(14, currentTargetReps + 1);
    }
    if (selected === 'hard') {
      const nextCount = feedbackStreak.rating === 'hard' ? feedbackStreak.count + 1 : 1;
      if (PREV_LEVEL[currentDifficulty] && nextCount >= 2) return 10;
      return Math.max(8, currentTargetReps - 1);
    }
    return currentTargetReps;
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 sm:p-6 bg-black text-white">
      <div className="w-full max-w-md text-center">
        {/* Simple Checkmark */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-950 text-white">
          <Check className="h-6 w-6" />
        </div>

        <div className="mt-5 font-mono text-lg uppercase tracking-wider text-neutral-300">
          {formatTime(workout.totalDurationSeconds)} Completed • {LABEL[workout.difficulty]}
        </div>

        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-[-0.025em] text-white leading-tight">
          {workout.title}
        </h1>

        <p className="mt-2 text-lg text-neutral-300 leading-snug">
          {workout.subtitle}
        </p>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 divide-x divide-neutral-800 border-y border-neutral-800 py-4 font-mono text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-white tabular-nums">{streak}</div>
            <div className="text-base text-neutral-400 uppercase tracking-wider mt-1">
              Streak
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-white tabular-nums">{totalCompleted}</div>
            <div className="text-base text-neutral-400 uppercase tracking-wider mt-1">
              Done
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-white tabular-nums">
              {previewNextReps()}
            </div>
            <div className="text-base text-neutral-400 uppercase tracking-wider mt-1">
              Next Reps
            </div>
          </div>
        </div>

        {/* Effort Feedback */}
        <div className="mt-8 text-left">
          <div className="font-mono text-lg font-bold uppercase tracking-wider text-neutral-200 text-center">
            How did that feel?
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            {(['easy', 'okay', 'hard'] as WorkoutFeedback[]).map((rating) => {
              const active = selected === rating;
              return (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setSelected(rating)}
                  className={`min-h-13 rounded-lg py-3 text-lg font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
                    active
                      ? 'border-white bg-white text-neutral-950 font-bold'
                      : 'border-neutral-700 bg-neutral-950 text-neutral-300 hover:border-white hover:text-white'
                  }`}
                >
                  {rating}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-center font-mono text-lg text-neutral-400">
            {getAdaptationPreview()}
          </p>
        </div>

        {/* Action */}
        <div className="mt-8">
          <button
            type="button"
            onClick={() => onFinish(selected)}
            className="w-full min-h-14 inline-flex items-center justify-center gap-2.5 rounded-lg bg-white py-3.5 text-xl font-bold text-neutral-950 hover:bg-neutral-200 active:scale-[0.98] transition-all cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Save &amp; Done</span>
          </button>
        </div>
      </div>
    </div>
  );
}
