/**
 * @project AncestorTree
 * @file src/components/duplicates/score-bar.tsx
 * @description Score breakdown bar for duplicate pair comparison
 * @version 1.0.0
 * @updated 2026-08-09
 */

interface ScoreBarProps {
  label: string;
  value: number;
}

export function ScoreBar({ label, value }: ScoreBarProps) {
  const pct = Math.round(value * 100);

  return (
    <div className='flex items-center gap-2 text-xs'>
      <span className='w-16 text-muted-foreground'>{label}</span>
      <div className='flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden'>
        <div
          className='h-full rounded-full bg-emerald-500'
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className='w-8 text-right'>{pct}%</span>
    </div>
  );
}
