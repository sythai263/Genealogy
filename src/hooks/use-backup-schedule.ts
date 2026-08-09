/**
 * @project AncestorTree
 * @file src/hooks/use-backup-schedule.ts
 * @description Hook for managing backup schedule settings stored in localStorage.
 * @version 1.2.0
 * @updated 2026-08-09
 */

'use client';

import { useCallback, useState } from 'react';
import type { BackupInterval, BackupSchedule } from '@types';

const STORAGE_KEY = 'ancestortree_backup_schedule';

const DEFAULT_SCHEDULE: BackupSchedule = {
  interval: 'off',
  lastBackupAt: null,
  autoDownload: false,
};

const INTERVAL_MS: Record<BackupInterval, number> = {
  off: Infinity,
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000,
};

function loadFromStorage(): BackupSchedule {
  if (typeof window === 'undefined') return DEFAULT_SCHEDULE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SCHEDULE;
    return { ...DEFAULT_SCHEDULE, ...(JSON.parse(raw) as Partial<BackupSchedule>) };
  } catch {
    return DEFAULT_SCHEDULE;
  }
}

function saveToStorage(schedule: BackupSchedule): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
  } catch {
    // localStorage may be unavailable in some contexts
  }
}

function isBackupDue(schedule: BackupSchedule): boolean {
  if (schedule.interval === 'off') return false;
  if (!schedule.lastBackupAt) return true;
  const elapsed = Date.now() - new Date(schedule.lastBackupAt).getTime();
  return elapsed >= INTERVAL_MS[schedule.interval];
}

function nextDueDate(schedule: BackupSchedule): Date | null {
  if (schedule.interval === 'off') return null;
  const base = schedule.lastBackupAt
    ? new Date(schedule.lastBackupAt)
    : new Date(0);
  return new Date(base.getTime() + INTERVAL_MS[schedule.interval]);
}

export function useBackupSchedule() {
  const [schedule, setScheduleState] = useState<BackupSchedule>(() =>
    loadFromStorage()
  );

  const setSchedule = useCallback((updates: Partial<BackupSchedule>) => {
    setScheduleState((prev) => {
      const next = { ...prev, ...updates };
      saveToStorage(next);
      return next;
    });
  }, []);

  const recordBackup = useCallback(() => {
    setSchedule({ lastBackupAt: new Date().toISOString() });
  }, [setSchedule]);

  return {
    schedule,
    setSchedule,
    recordBackup,
    isDue: isBackupDue(schedule),
    nextDue: nextDueDate(schedule),
  };
}
