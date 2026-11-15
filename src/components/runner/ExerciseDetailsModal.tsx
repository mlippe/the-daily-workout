import { X } from 'lucide-react';
import type { Exercise } from '../../types/exercise';

interface ExerciseDetailsModalProps {
  exercise: Exercise;
  isOpen: boolean;
  onClose: () => void;
}

export function ExerciseDetailsModal({ exercise, isOpen, onClose }: ExerciseDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90dvh] w-full max-w-md flex-col rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-4 sm:p-5 border-b border-neutral-900 bg-neutral-950">
          <div className="min-w-0">
            <div className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">
              Movement Guide
            </div>
            <h3 className="mt-1 text-lg sm:text-xl font-semibold text-white tracking-tight">
              {exercise.name}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-neutral-400">
              <span className="capitalize">{exercise.primaryMuscles.join(', ')}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 -mt-1 -mr-1 items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
            aria-label="Close details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Dual Frame Preview */}
          <div className="grid grid-cols-2 gap-2">
            <div className="aspect-4/3 rounded-xl bg-neutral-900 overflow-hidden flex items-center justify-center p-1.5 border border-neutral-800">
              <img
                src={exercise.images[0]}
                alt={`${exercise.name} start`}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="aspect-4/3 rounded-xl bg-neutral-900 overflow-hidden flex items-center justify-center p-1.5 border border-neutral-800">
              <img
                src={exercise.images[1]}
                alt={`${exercise.name} finish`}
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-widest text-neutral-400 mb-2">
              Instructions
            </h4>
            <div className="space-y-2 text-xs text-neutral-300 leading-relaxed">
              {exercise.instructions.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-900 bg-neutral-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-neutral-950 hover:bg-neutral-200 active:scale-95 transition-all cursor-pointer"
          >
            Back to Workout
          </button>
        </div>
      </div>
    </div>
  );
}
