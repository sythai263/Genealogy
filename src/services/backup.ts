import type { IncludeMedia, RestoreResult } from '@types';

interface BackupApiErrorBody {
  error?: string;
}

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as BackupApiErrorBody;
    return body.error || fallback;
  } catch {
    return fallback;
  }
}

export async function exportBackup(includeMedia: IncludeMedia): Promise<Blob> {
  const response = await fetch('/api/backup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ include_media: includeMedia }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Sao lưu thất bại'));
  }

  return response.blob();
}

export function downloadBackupBlob(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const filename = `giapha-${new Date().toISOString().slice(0, 10)}.zip`;
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function restoreBackup(file: File): Promise<RestoreResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/backup/restore', {
    method: 'POST',
    body: formData,
  });

  const data = (await response.json()) as RestoreResult & BackupApiErrorBody;

  if (!response.ok) {
    throw new Error(data.error || 'Khôi phục thất bại');
  }

  return data;
}
