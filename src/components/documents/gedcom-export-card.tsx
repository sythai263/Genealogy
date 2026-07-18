/**
 * @project AncestorTree
 * @file src/components/documents/gedcom-export-card.tsx
 * @description GEDCOM export card for the documents hub
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

import { useState } from 'react';
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
  const { data: treeData, isLoading: isTreeLoading } = useTreeData();
  const [isExporting, setIsExporting] = useState(false);

  const peopleCount =
    treeData?.people.filter(
      (person) => person.privacy_level !== DOCUMENTS_PRIVATE_PRIVACY_LEVEL
    ).length || 0;
  const familyCount = treeData?.families.length || 0;

  function handleExportGedcom() {
    if (!treeData) {
      toast.error('Chưa có dữ liệu gia phả để xuất');
      return;
    }

    setIsExporting(true);
    try {
      const content = generateGedcom(treeData);
      const validation = validateGedcom(content);

      if (!validation.valid) {
        toast.warning(
          `File GEDCOM có ${validation.errors.length} cảnh báo nhưng vẫn có thể sử dụng`
        );
      }

      downloadGedcom(content);
      toast.success('Xuất file GEDCOM thành công');
    } catch {
      toast.error('Lỗi khi xuất file GEDCOM');
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
            <CardTitle>Xuất GEDCOM</CardTitle>
            <CardDescription>
              Xuất dữ liệu theo chuẩn quốc tế GEDCOM 5.5.1
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          File GEDCOM (.ged) là chuẩn trao đổi dữ liệu phả hệ quốc tế, tương
          thích với hầu hết phần mềm gia phả như FamilySearch, Gramps,
          MyHeritage.
        </p>

        {treeData && (
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              {peopleCount} thành viên
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              {familyCount} gia đình
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 rounded bg-amber-50 p-2 text-xs text-amber-600">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            Thông tin cá nhân (privacy_level ={' '}
            {DOCUMENTS_PRIVATE_PRIVACY_LEVEL}) sẽ không được xuất
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
          {isTreeLoading ? 'Đang tải dữ liệu...' : 'Tải file GEDCOM'}
        </Button>
      </CardContent>
    </Card>
  );
}
