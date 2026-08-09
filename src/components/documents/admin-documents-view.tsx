/**
 * @project AncestorTree
 * @file src/components/documents/admin-documents-view.tsx
 * @description Admin document management — CRUD for Kho tài liệu
 * @version 1.0.0
 * @updated 2026-08-09
 */

'use client';

import { useMemo, useState } from 'react';
import { Archive, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@components/auth';
import {
  AccessDenied,
  ListPagination,
  PageHeader,
  QueryBoundary,
} from '@components/shared';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
} from '@components/ui';
import {
  LIST_DEFAULT_PAGE_SIZE,
  type ListPageSize,
} from '@constants';
import {
  useCreateDocument,
  useDeleteDocument,
  useDocuments,
  usePeopleByIds,
  useResettablePage,
  useUpdateDocument,
  useUploadDocumentFile,
} from '@hooks';
import { formatFileSize } from '@lib';
import type { ClanDocument, CreateClanDocumentInput, Person } from '@types';
import { useTranslations } from 'next-intl';
import { DocumentForm } from './document-form';

export function AdminDocumentsView() {
  const t = useTranslations('Admin');
  const tDocuments = useTranslations('Documents');
  const tCommon = useTranslations('Common');
  const { isEditor } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClanDocument | undefined>();
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState<ListPageSize>(LIST_DEFAULT_PAGE_SIZE);
  const [page, setPage] = useResettablePage(`${search}|${pageSize}`);

  const { data, isLoading } = useDocuments({
    search: search || undefined,
    page,
    pageSize,
  });
  const createMutation = useCreateDocument();
  const updateMutation = useUpdateDocument();
  const deleteMutation = useDeleteDocument();
  const uploadMutation = useUploadDocumentFile();

  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;

  const personIds = useMemo(
    () => [...new Set(items.map((doc) => doc.person_id).filter((id): id is string => Boolean(id)))],
    [items]
  );
  const { data: people } = usePeopleByIds(personIds);
  const peopleMap = useMemo(() => {
    const map = new Map<string, Person>();
    for (const p of people || []) map.set(p.id, p);
    return map;
  }, [people]);

  if (!isEditor) {
    return <AccessDenied />;
  }

  const handleCreate = async (data: CreateClanDocumentInput, file?: File) => {
    if (!file) return;
    try {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const fileUrl = await uploadMutation.mutateAsync({ file, path: fileName });
      await createMutation.mutateAsync({
        ...data,
        file_url: fileUrl,
        file_type: file.type,
        file_size: file.size,
      });
      toast.success(t('features.documents.uploadSuccess'));
      setDialogOpen(false);
    } catch (err) {
      console.error('Document upload error:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast.error(t('features.documents.uploadError', { message }));
    }
  };

  const handleUpdate = async (data: CreateClanDocumentInput) => {
    if (!editingItem) return;
    try {
      await updateMutation.mutateAsync({
        id: editingItem.id,
        input: {
          title: data.title,
          category: data.category,
          description: data.description,
          tags: data.tags,
          person_id: data.person_id,
          privacy_level: data.privacy_level,
        },
      });
      toast.success(t('features.documents.updateSuccess'));
      setDialogOpen(false);
      setEditingItem(undefined);
    } catch {
      toast.error(t('features.documents.updateError'));
    }
  };

  const handleDelete = async (doc: ClanDocument) => {
    try {
      await deleteMutation.mutateAsync({ id: doc.id, fileUrl: doc.file_url });
      toast.success(t('features.documents.deleteSuccess'));
    } catch {
      toast.error(t('features.documents.deleteError'));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <PageHeader
        title={t('features.documents.title')}
        description={t('features.documents.subtitle')}
        actions={
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingItem(undefined); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                <Upload className="h-4 w-4 mr-2" />
                {tCommon('upload')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingItem
                    ? t('features.documents.edit')
                    : t('features.documents.add')}
                </DialogTitle>
              </DialogHeader>
              <DocumentForm
                key={editingItem?.id || 'new'}
                document={editingItem}
                onSubmit={editingItem ? handleUpdate : handleCreate}
                isPending={createMutation.isPending || updateMutation.isPending || uploadMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        }
      />

      <Input
        placeholder={t('features.documents.searchPlaceholder')}
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="max-w-md"
      />

      <QueryBoundary
        isLoading={isLoading}
        isEmpty={items.length === 0}
        emptyIcon={Archive}
        emptyTitle={t('features.documents.empty')}
        skeletonRows={3}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            {items.map(doc => {
              const person = doc.person_id ? peopleMap.get(doc.person_id) : undefined;
              return (
                <Card key={doc.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">
                          <Badge variant="outline" className="mr-1 text-xs">
                            {tDocuments(`categories.${doc.category}`)}
                          </Badge>
                          {doc.privacy_level === 0 && (
                            <Badge className="mr-1 text-xs bg-green-100 text-green-800">
                              {tDocuments('privacy.public')}
                            </Badge>
                          )}
                          {doc.privacy_level === 1 && (
                            <Badge className="mr-1 text-xs bg-blue-100 text-blue-800">
                              {tDocuments('privacy.members')}
                            </Badge>
                          )}
                          {doc.privacy_level === 2 && (
                            <Badge className="mr-1 text-xs bg-red-100 text-red-800">
                              {tDocuments('privacy.internal')}
                            </Badge>
                          )}
                          {person && <span>{person.display_name} · </span>}
                          {formatFileSize(doc.file_size)}
                          {doc.tags && <span className="ml-1">· {doc.tags}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => { setEditingItem(doc); setDialogOpen(true); }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t('features.documents.deleteConfirm.title')}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('features.documents.deleteConfirm.description', {
                                title: doc.title,
                              })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(doc)}>
                              {tCommon('delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <ListPagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            itemLabel={t('features.documents.countLabel')}
          />
        </div>
      </QueryBoundary>
    </div>
  );
}
