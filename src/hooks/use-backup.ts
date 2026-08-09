'use client';

import { useMutation } from '@tanstack/react-query';
import {
  downloadBackupBlob,
  exportBackup,
  restoreBackup,
} from '@services';

export function useBackupExport() {
  return useMutation({
    mutationFn: async () => {
      const blob = await exportBackup();
      downloadBackupBlob(blob);
    },
  });
}

export function useBackupRestore() {
  return useMutation({
    mutationFn: (file: File) => restoreBackup(file),
  });
}
