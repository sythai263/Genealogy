/**
 * @project AncestorTree
 * @file src/components/tree/tree-view.tsx
 * @description Family tree page — interactive or elderly list + GEDCOM export
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('Tree');
  const { data: treeData } = useTreeData();
  const { elderlyMode } = useElderly();
  const { isAdmin, isEditor } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const canExport = isAdmin || isEditor;

  function handleExport() {
    if (!treeData) {
      toast.error(t('toasts.exportEmpty'));
      return;
    }
    setIsExporting(true);
    try {
      const content = generateGedcom(treeData);
      downloadGedcom(content);
      toast.success(t('toasts.exportSuccess'));
    } catch {
      toast.error(t('toasts.exportError'));
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
            {elderlyMode ? t('listTitle') : t('title')}
          </h1>
          <p className="text-muted-foreground">
            {elderlyMode ? t('listSubtitle') : t('interactiveSubtitle')}
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
            {t('actions.exportGedcom')}
          </Button>
        )}
      </div>

      {elderlyMode ? <ElderlyTreeView /> : <InteractiveTreeSection />}
    </div>
  );
}
