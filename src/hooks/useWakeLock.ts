import { useEffect, useRef, useState, useCallback } from 'react';

export interface UseWakeLockResult {
  isSupported: boolean;
  isLocked: boolean;
  request: () => Promise<void>;
  release: () => Promise<void>;
}

export function useWakeLock(enabled = false): UseWakeLockResult {
  const [isLocked, setIsLocked] = useState(false);
  const [isSupported] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  });

  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  const release = useCallback(async () => {
    const sentinel = sentinelRef.current;
    if (sentinel) {
      try {
        await sentinel.release();
      } catch {
        // Ignored
      }
      sentinelRef.current = null;
      setIsLocked(false);
    }
  }, []);

  const request = useCallback(async () => {
    if (!isSupported) return;
    if (sentinelRef.current && !sentinelRef.current.released) {
      setIsLocked(true);
      return;
    }

    try {
      const sentinel = await navigator.wakeLock.request('screen');
      sentinelRef.current = sentinel;
      setIsLocked(true);

      sentinel.addEventListener('release', () => {
        if (sentinelRef.current === sentinel) {
          sentinelRef.current = null;
          setIsLocked(false);
        }
      });
    } catch {
      setIsLocked(false);
    }
  }, [isSupported]);

  // Synchronize wake lock with enabled prop
  useEffect(() => {
    let isMounted = true;

    async function syncWakeLock() {
      if (enabled) {
        await request();
      } else if (sentinelRef.current) {
        await release();
      }
    }

    syncWakeLock().catch(() => {});

    return () => {
      isMounted = false;
      if (sentinelRef.current && !isMounted) {
        sentinelRef.current.release().catch(() => {});
        sentinelRef.current = null;
      }
    };
  }, [enabled, request, release]);

  // Handle re-acquisition on tab visibility change
  useEffect(() => {
    if (!isSupported) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) {
        request().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, isSupported, request]);

  return {
    isSupported,
    isLocked,
    request,
    release,
  };
}
