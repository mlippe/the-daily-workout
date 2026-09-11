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
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-3xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-neutral-900 bg-neutral-950">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">
              Movement Guide
            </div>
            <h3 className="mt-1 text-2xl font-semibold text-white tracking-tight">
              {exercise.name}
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-neutral-400">
              <span className="capitalize">{exercise.primaryMuscles.join(', ')}</span>
              {exercise.secondaryMuscles.length > 0 && (
                <span>• Secondary: {exercise.secondaryMuscles.join(', ')}</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 hover:text-white transition-colors"
            aria-label="Close details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Dual Frame Preview */}
          <div className="grid grid-cols-2 gap-3">
            <div className="aspect-4/3 rounded-2xl bg-neutral-900 overflow-hidden flex items-center justify-center p-2 border border-neutral-800">
              <img
                src={exercise.images[0]}
                alt={`${exercise.name} start`}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="aspect-4/3 rounded-2xl bg-neutral-900 overflow-hidden flex items-center justify-center p-2 border border-neutral-800">
              <img
                src={exercise.images[1]}
                alt={`${exercise.name} finish`}
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          {/* Full Description */}
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-widest text-neutral-400 mb-3">
              Description
            </h4>
            <div className="space-y-3 text-sm text-neutral-300 leading-relaxed">
              {exercise.instructions.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Additional details */}
          <div className="border-t border-neutral-900 pt-4 flex flex-wrap gap-4 font-mono text-xs text-neutral-400">
            <div>
              <span className="text-neutral-400">Level: </span>
              <span className="capitalize text-neutral-300">{exercise.level}</span>
            </div>
            <div>
              <span className="text-neutral-400">Equipment: </span>
              <span className="capitalize text-neutral-300">{exercise.equipment}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-900 bg-neutral-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white px-6 py-2.5 text-xs font-semibold text-neutral-950 hover:bg-neutral-200 active:scale-95 transition-all"
          >
            Close & Resume
          </button>
        </div>
      </div>
    </div>
  );
}
