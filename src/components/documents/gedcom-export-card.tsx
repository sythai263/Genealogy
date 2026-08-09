/**
 * @project AncestorTree
 * @file src/components/documents/gedcom-export-card.tsx
 * @description GEDCOM export card for the documents hub
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui';
import { DOCUMENTS_PRIVATE_PRIVACY_LEVEL } from '@constants';
import { useTreeData } from '@hooks';
import {
  downloadGedcom,
  generateGedcom,
  validateGedcom,
} from '@lib';

export function GedcomExportCard() {
  const t = useTranslations('Documents');
  const { data: treeData, isLoading: isTreeLoading } = useTreeData();
  const [isExporting, setIsExporting] = useState(false);

  const peopleCount =
    treeData?.people.filter(
      (person) => person.privacy_level !== DOCUMENTS_PRIVATE_PRIVACY_LEVEL
    ).length || 0;
  const familyCount = treeData?.families.length || 0;

  function handleExportGedcom() {
    if (!treeData) {
      toast.error(t('toasts.gedcomEmpty'));
      return;
    }

    setIsExporting(true);
    try {
      const content = generateGedcom(treeData);
      const validation = validateGedcom(content);

      if (!validation.valid) {
        toast.warning(
          t('gedcom.warning', { count: validation.errors.length })
        );
      }

      downloadGedcom(content);
      toast.success(t('toasts.gedcomSuccess'));
    } catch {
      toast.error(t('toasts.gedcomError'));
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
            <Download className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <CardTitle>{t('gedcom.title')}</CardTitle>
            <CardDescription>{t('gedcom.description')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{t('gedcom.body')}</p>

        {treeData && (
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              {t('gedcom.peopleCount', { count: peopleCount })}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              {t('gedcom.familyCount', { count: familyCount })}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 rounded bg-amber-50 p-2 text-xs text-amber-600">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            {t('gedcom.privacyNote', {
              level: DOCUMENTS_PRIVATE_PRIVACY_LEVEL,
            })}
          </span>
        </div>

        <Button
          onClick={handleExportGedcom}
          disabled={isTreeLoading || isExporting || !treeData}
          className="w-full"
        >
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isTreeLoading ? t('gedcom.loading') : t('gedcom.download')}
        </Button>
      </CardContent>
    </Card>
  );
}
