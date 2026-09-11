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

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-black ${className}`}
    >
      {/* Base Frame (Step 1) */}
      <img
        src={exercise.images[0]}
        alt={`${exercise.name} starting position`}
        className='absolute inset-0 h-full w-full object-contain select-none'
        loading='eager'
      />

      {/* Crossfade Frame (Step 2) - Smooth 300ms fade */}
      <img
        src={exercise.images[1]}
        alt={`${exercise.name} active position`}
        className={`absolute inset-0 h-full w-full object-contain select-none transition-opacity duration-300 ease-in-out motion-reduce:transition-none ${
          frameIndex === 1 ? 'opacity-100' : 'opacity-0'
        }`}
        loading='eager'
      />

      {/* Subtle bottom gradient fade so the photo remains prominently visible */}
      {overlayGradient && (
        <div
          className='pointer-events-none absolute inset-0'
          style={{
            background:
              'linear-gradient(to top, #000000 0%, rgba(0, 0, 0, 0.85) 16%, rgba(0, 0, 0, 0.25) 28%, transparent 40%)',
          }}
        />
      )}

      {children}
    </div>
  );
}
