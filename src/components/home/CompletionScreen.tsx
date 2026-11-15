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
      <div className="w-full max-w-sm text-center">
        {/* Simple Checkmark */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 text-white">
          <Check className="h-5 w-5" />
        </div>

        <div className="mt-5 font-mono text-[11px] uppercase tracking-widest text-neutral-400">
          {formatTime(workout.totalDurationSeconds)} Completed • {LABEL[workout.difficulty]}
        </div>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
          {workout.title}
        </h1>

        <p className="mt-1.5 text-xs text-neutral-400 leading-relaxed">
          {workout.subtitle}
        </p>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 divide-x divide-neutral-900 border-y border-neutral-900 py-3 font-mono text-center">
          <div>
            <div className="text-lg font-semibold text-white tabular-nums">{streak}</div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider mt-0.5">
              Streak
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-white tabular-nums">{totalCompleted}</div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider mt-0.5">
              Done
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-white tabular-nums">
              {previewNextReps()}
            </div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider mt-0.5">
              Next Reps
            </div>
          </div>
        </div>

        {/* Effort Feedback */}
        <div className="mt-7 text-left">
          <div className="font-mono text-[11px] uppercase tracking-widest text-neutral-400 text-center">
            How did that feel?
          </div>
          <div className="mt-2.5 grid grid-cols-3 gap-2">
            {(['easy', 'okay', 'hard'] as WorkoutFeedback[]).map((rating) => {
              const active = selected === rating;
              return (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setSelected(rating)}
                  className={`min-h-11 rounded-xl py-3 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
                    active
                      ? 'border-white bg-white text-neutral-950 font-semibold'
                      : 'border-neutral-800 bg-neutral-900/50 text-neutral-300 hover:border-neutral-700 hover:text-white'
                  }`}
                >
                  {rating}
                </button>
              );
            })}
          </div>
          <p className="mt-2.5 text-center font-mono text-[11px] text-neutral-500">
            {getAdaptationPreview()}
          </p>
        </div>

        {/* Action */}
        <div className="mt-7">
          <button
            type="button"
            onClick={() => onFinish(selected)}
            className="w-full min-h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-semibold text-neutral-950 hover:bg-neutral-200 active:scale-[0.98] transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Save &amp; Done</span>
          </button>
        </div>
      </div>
    </div>
  );
}
