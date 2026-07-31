/**
 * @project AncestorTree
 * @file src/app/(main)/admin/import/error.tsx
 * @description Error boundary for GEDCOM import page
 */

import { Button, Card, CardContent } from '@components/ui';

interface ImportErrorProps {
  reset: () => void;
}

export default function ImportError({ reset }: ImportErrorProps) {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <p className="text-muted-foreground">
            Đã xảy ra lỗi khi tải trang nhập dữ liệu.
          </p>
          <Button onClick={reset} variant="outline">
            Thử lại
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
