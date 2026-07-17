'use client';

import { useMutation } from '@tanstack/react-query';
import {
  downloadBackupBlob,
  exportBackup,
  restoreBackup,
} from '@services';
import type { IncludeMedia } from '@types';

interface ExportBackupInput {
  includeMedia: IncludeMedia;
}

export function useBackupExport() {
  return useMutation({
    mutationFn: async ({ includeMedia }: ExportBackupInput) => {
      const blob = await exportBackup(includeMedia);
      downloadBackupBlob(blob);
    },
  });
}

export function useBackupRestore() {
  return useMutation({
    mutationFn: (file: File) => restoreBackup(file),
  });
}
