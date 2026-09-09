import type { WorkoutHistoryEntry } from '../types/workout';

const STORAGE_KEY_HISTORY = 'the_daily_workout_history_v1';
const STORAGE_KEY_PREFERENCES = 'the_daily_workout_preferences_v1';

export interface UserPreferences {
  soundEnabled: boolean;
  screenWakeLockEnabled: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  soundEnabled: true,
  screenWakeLockEnabled: true,
};

function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const testKey = '__test_storage__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function getWorkoutHistory(): WorkoutHistoryEntry[] {
  if (!isStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveWorkoutCompletion(entry: Omit<WorkoutHistoryEntry, 'id' | 'date'> & { id?: string; date?: string }): WorkoutHistoryEntry {
  const fullEntry: WorkoutHistoryEntry = {
    id: entry.id || `workout-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: entry.date || new Date().toISOString(),
    workoutId: entry.workoutId,
    workoutTitle: entry.workoutTitle,
    primaryPillar: entry.primaryPillar,
    completed: entry.completed,
    totalTimeSeconds: entry.totalTimeSeconds,
  };

  if (!isStorageAvailable()) return fullEntry;

  try {
    const history = getWorkoutHistory();
    const updated = [fullEntry, ...history];
    window.localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save workout history:', err);
  }

  return fullEntry;
}

export function clearWorkoutHistory(): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY_HISTORY);
  } catch {
    // Ignored
  }
}

export function getUserPreferences(): UserPreferences {
  if (!isStorageAvailable()) return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_PREFERENCES);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(prefs: Partial<UserPreferences>): UserPreferences {
  const current = getUserPreferences();
  const updated = { ...current, ...prefs };
  if (!isStorageAvailable()) return updated;
  try {
    window.localStorage.setItem(STORAGE_KEY_PREFERENCES, JSON.stringify(updated));
  } catch {
    // Ignored
  }
  return updated;
}

// Calculate active streak based on consecutive days completed
export function getStreakStats(): { currentStreak: number; lastWorkoutDate: string | null; totalCompleted: number } {
  const history = getWorkoutHistory().filter((h) => h.completed);
  if (history.length === 0) {
    return { currentStreak: 0, lastWorkoutDate: null, totalCompleted: 0 };
  }

  // Group by unique YYYY-MM-DD
  const days = Array.from(
    new Set(
      history.map((h) => {
        const d = new Date(h.date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      })
    )
  ).sort().reverse();

  if (days.length === 0) {
    return { currentStreak: 0, lastWorkoutDate: null, totalCompleted: 0 };
  }

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  const latestDay = days[0];
  let currentStreak = 0;

  // Streak continues if worked out today or yesterday
  if (latestDay === todayStr || latestDay === yesterdayStr) {
    let checkDate = new Date(latestDay === todayStr ? today : yesterday);

    for (let i = (latestDay === todayStr ? 0 : 0); i < days.length; i++) {
      const expectedStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (days.includes(expectedStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return {
    currentStreak,
    lastWorkoutDate: history[0].date,
    totalCompleted: history.length,
  };
}

// Workout Rep Targets & Progression
const STORAGE_KEY_REP_TARGETS = 'the_daily_workout_rep_targets_v1';
export const DEFAULT_TARGET_REPS = 12;

export function getAllWorkoutTargetReps(): Record<string, number> {
  if (!isStorageAvailable()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_REP_TARGETS);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function getWorkoutTargetReps(workoutId: string): number {
  const all = getAllWorkoutTargetReps();
  if (typeof all[workoutId] === 'number' && all[workoutId] > 0) {
    return all[workoutId];
  }
  return DEFAULT_TARGET_REPS;
}

export function saveWorkoutTargetReps(workoutId: string, reps: number): number {
  const clamped = Math.max(1, Math.min(100, Math.round(reps)));
  if (!isStorageAvailable()) return clamped;
  try {
    const all = getAllWorkoutTargetReps();
    all[workoutId] = clamped;
    window.localStorage.setItem(STORAGE_KEY_REP_TARGETS, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to save workout target reps:', err);
  }
  return clamped;
}

export function incrementWorkoutTargetReps(workoutId: string, amount: number = 1): number {
  const current = getWorkoutTargetReps(workoutId);
  return saveWorkoutTargetReps(workoutId, current + amount);
}

