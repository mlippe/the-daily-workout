import { useState, useEffect } from 'react';
import type { Exercise } from '../../types/exercise';

interface ExerciseVisualProps {
  exercise: Exercise;
  isPaused?: boolean;
  className?: string;
  children?: React.ReactNode;
  overlayGradient?: boolean;
}

export function ExerciseVisual({
  exercise,
  isPaused = false,
  className = '',
  children,
  overlayGradient = false,
}: ExerciseVisualProps) {
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
    <div className={`relative flex items-center justify-center overflow-hidden bg-black ${className}`}>
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
        className="h-full w-full object-contain select-none"
        loading="eager"
      />

      {/* Subtle bottom gradient fade so the photo remains prominently visible */}
      {overlayGradient && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, #000000 0%, rgba(0, 0, 0, 0.75) 12%, rgba(0, 0, 0, 0.2) 22%, transparent 32%)',
          }}
        />
      )}

      {/* Looping frame indicator moved to top right */}
      <div className="absolute top-3 right-3 flex gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm z-10">
        <span
          className={`h-1.5 w-3.5 rounded-full transition-all duration-300 ${
            frameIndex === 0 ? 'bg-white' : 'bg-white/30'
          }`}
        />
        <span
          className={`h-1.5 w-3.5 rounded-full transition-all duration-300 ${
            frameIndex === 1 ? 'bg-white' : 'bg-white/30'
          }`}
        />
      </div>

      {children}
    </div>
  );
}
