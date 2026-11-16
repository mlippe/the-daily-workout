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
        className="flex max-h-[90dvh] w-full max-w-lg flex-col rounded-lg border border-neutral-800 bg-neutral-950 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 border-b border-neutral-800 bg-neutral-950">
          <div className="min-w-0">
            <div className="font-mono text-base uppercase tracking-widest text-neutral-400">
              Movement Guide
            </div>
            <h3 className="mt-1 text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
              {exercise.name}
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-lg text-neutral-300">
              <span className="capitalize">{exercise.primaryMuscles.join(', ')}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 -mt-1 -mr-1 items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
            aria-label="Close details"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Dual Frame Preview */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="aspect-4/3 rounded-lg bg-neutral-900 overflow-hidden flex items-center justify-center p-1.5 border border-neutral-800">
              <img
                src={exercise.images[0]}
                alt={`${exercise.name} start`}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="aspect-4/3 rounded-lg bg-neutral-900 overflow-hidden flex items-center justify-center p-1.5 border border-neutral-800">
              <img
                src={exercise.images[1]}
                alt={`${exercise.name} finish`}
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-mono text-lg font-bold uppercase tracking-widest text-neutral-300 mb-3">
              Instructions
            </h4>
            <div className="space-y-3 text-lg text-neutral-200 leading-relaxed">
              {exercise.instructions.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 rounded-lg bg-white px-6 py-3 text-lg font-bold text-neutral-950 hover:bg-neutral-200 active:scale-95 transition-all cursor-pointer"
          >
            Back to Workout
          </button>
        </div>
      </div>
    </div>
  );
}
