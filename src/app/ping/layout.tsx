/**
 * @project AncestorTree
 * @file src/app/ping/layout.tsx
 * @description Minimal standalone layout for the keep-alive ping page —
 *              intentionally detached from the main app shell.
 * @version 1.0.0
 * @updated 2026-10-13
 */

interface PingLayoutProps {
  children: React.ReactNode;
}

export default function PingLayout({ children }: PingLayoutProps) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      {children}
    </div>
  );
}
