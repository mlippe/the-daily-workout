import { useState, useEffect } from 'react';
import type { Exercise } from '../../types/exercise';

interface ExerciseVisualProps {
  exercise: Exercise;
  isPaused?: boolean;
  className?: string;
}

export function ExerciseVisual({ exercise, isPaused = false, className = '' }: ExerciseVisualProps) {
  const [frameIndex, setFrameIndex] = useState<0 | 1>(0);

  // Toggle frame between 0 and 1 every 1.1s for movement demonstration
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev === 0 ? 1 : 0));
    }, 1100);

    return () => clearInterval(interval);
  }, [isPaused, exercise.id]);

  const currentImageSrc = exercise.images[frameIndex];
  const nextImageSrc = exercise.images[frameIndex === 0 ? 1 : 0];

  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-2xl bg-neutral-900 ${className}`}>
      {/* Hidden image preloader to prevent flicker */}
      <img
        src={nextImageSrc}
        alt=""
        aria-hidden="true"
        className="hidden"
      />

      <img
        key={`${exercise.id}-${frameIndex}`}
        src={currentImageSrc}
        alt={`${exercise.name} step ${frameIndex + 1}`}
        className="h-full w-full object-contain p-2 select-none"
        loading="eager"
      />

      {/* Looping frame indicator */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-neutral-950/70 px-2 py-1 backdrop-blur-sm">
        <span
          className={`h-1.5 w-4 rounded-full transition-all duration-300 ${
            frameIndex === 0 ? 'bg-white' : 'bg-white/30'
          }`}
        />
        <span
          className={`h-1.5 w-4 rounded-full transition-all duration-300 ${
            frameIndex === 1 ? 'bg-white' : 'bg-white/30'
          }`}
        />
      </div>
    </div>
  );
}
