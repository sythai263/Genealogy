import { describe, expect, it } from 'vitest';
import {
  parseBackupManifest,
  sanitizeBackupRow,
  toBackupRows,
} from '../backup-manifest';

describe('parseBackupManifest', () => {
  it('accepts a valid manifest', () => {
    const manifest = parseBackupManifest(
      JSON.stringify({
        version: '2.0',
        app_version: '3.0.0',
        exported_at: '2026-08-09T00:00:00.000Z',
        row_counts: { people: 10, families: 3 },
      })
    );
    expect(manifest).not.toBeNull();
    expect(manifest?.row_counts.people).toBe(10);
  });

  it('rejects wrong version', () => {
    const manifest = parseBackupManifest(
      JSON.stringify({
        version: '1.0',
        exported_at: '2026-08-09T00:00:00.000Z',
        row_counts: { people: 1 },
      })
    );
    expect(manifest).toBeNull();
  });

  it('rejects unknown table names', () => {
    const manifest = parseBackupManifest(
      JSON.stringify({
        version: '2.0',
        exported_at: '2026-08-09T00:00:00.000Z',
        row_counts: { 'people; DROP TABLE people;--': 1 },
      })
    );
    expect(manifest).toBeNull();
  });

  it('rejects non-JSON input', () => {
    expect(parseBackupManifest('not json')).toBeNull();
    expect(parseBackupManifest('')).toBeNull();
  });

  it('rejects missing row_counts', () => {
    expect(
      parseBackupManifest(
        JSON.stringify({ version: '2.0', exported_at: '2026-01-01' })
      )
    ).toBeNull();
  });
});

describe('sanitizeBackupRow', () => {
  it('keeps plain column keys and drops malformed ones', () => {
    const row = sanitizeBackupRow({
      id: 'abc',
      display_name: 'Nguyễn Văn A',
      'evil key': 'x',
      'a;b': 'y',
      '1starts-with-digit': 'z',
    });
    expect(row).toEqual({ id: 'abc', display_name: 'Nguyễn Văn A' });
  });
});

describe('toBackupRows', () => {
  it('returns sanitized rows for arrays', () => {
    const rows = toBackupRows([{ id: '1', 'bad key': 'x' }]);
    expect(rows).toEqual([{ id: '1' }]);
  });

  it('returns null for non-arrays', () => {
    expect(toBackupRows({ id: '1' })).toBeNull();
    expect(toBackupRows(null)).toBeNull();
  });
});
