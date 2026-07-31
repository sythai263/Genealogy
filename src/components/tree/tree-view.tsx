/**
 * @project AncestorTree
 * @file src/components/tree/tree-view.tsx
 * @description Family tree page — interactive or elderly list + GEDCOM export
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

import { useState } from 'react';
import { Download, GitBranchPlus, List, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@components/auth';
import { Button } from '@components/ui';
import { useElderly } from '@contexts';
import { useTreeData } from '@hooks';
import { downloadGedcom, generateGedcom } from '@lib';
import { ElderlyTreeView } from './elderly-tree-view';
import { InteractiveTreeSection } from './interactive-tree-section';

export function TreeView() {
  const { data: treeData } = useTreeData();
  const { elderlyMode } = useElderly();
  const { isAdmin, isEditor } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const canExport = isAdmin || isEditor;

  function handleExport() {
    if (!treeData) {
      toast.error('Chưa có dữ liệu để xuất');
      return;
    }
    setIsExporting(true);
    try {
      const content = generateGedcom(treeData);
      downloadGedcom(content);
      toast.success('Xuất file GEDCOM thành công');
    } catch {
      toast.error('Lỗi khi xuất file');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="container mx-auto space-y-6 p-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            {elderlyMode ? (
              <List className="h-6 w-6" />
            ) : (
              <GitBranchPlus className="h-6 w-6" />
            )}
            {elderlyMode
              ? 'Danh sách thành viên theo đời'
              : 'Cây Gia Phả'}
          </h1>
          <p className="text-muted-foreground">
            {elderlyMode
              ? 'Xem danh sách thành viên phân theo từng đời — nhấn vào tên để xem chi tiết'
              : 'Sơ đồ phả hệ trực quan - Click vào từng thành viên để xem chi tiết'}
          </p>
        </div>
        {canExport && !elderlyMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting || !treeData}
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Xuất GEDCOM
          </Button>
        )}
      </div>

      {elderlyMode ? <ElderlyTreeView /> : <InteractiveTreeSection />}
    </div>
  );
}
