/**
 * @project AncestorTree
 * @file src/components/setup/setup-importing-step.tsx
 * @description Loading step while desktop import runs
 * @version 1.0.0
 * @updated 2026-07-18
 */

export function SetupImportingStep() {
  return (
    <div className="space-y-4 text-center">
      <div className="flex justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Đang nhập dữ liệu...</h2>
        <p className="text-sm text-muted-foreground">
          Vui lòng chờ trong giây lát.
        </p>
      </div>
    </div>
  );
}
