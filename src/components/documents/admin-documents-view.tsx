/**
 * @project AncestorTree
 * @file src/components/documents/admin-documents-view.tsx
 * @description Admin document management — CRUD for Kho tài liệu
 * @version 1.0.0
 * @updated 2026-08-09
 */

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Archive, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@components/auth';
import { ListPagination } from '@components/shared';
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
  DOCUMENT_CATEGORY_LABELS,
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
import { DocumentForm } from './document-form';

export function AdminDocumentsView() {
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

  const items = data?.items ?? [];
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
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Bạn cần quyền biên tập viên để truy cập trang này</p>
            <Button asChild className="mt-4"><Link href="/admin">Về trang chủ</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
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
      toast.success('Đã tải lên tài liệu');
      setDialogOpen(false);
    } catch (err) {
      console.error('Document upload error:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Lỗi khi tải lên: ${message}`);
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
      toast.success('Đã cập nhật tài liệu');
      setDialogOpen(false);
      setEditingItem(undefined);
    } catch {
      toast.error('Lỗi khi cập nhật');
    }
  };

  const handleDelete = async (doc: ClanDocument) => {
    try {
      await deleteMutation.mutateAsync({ id: doc.id, fileUrl: doc.file_url });
      toast.success('Đã xóa tài liệu');
    } catch {
      toast.error('Lỗi khi xóa');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Kho tài liệu</h1>
          <p className="text-muted-foreground">Tải lên, sửa, xóa tài liệu dòng họ</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingItem(undefined); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /><Upload className="h-4 w-4 mr-2" />Tải lên</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Sửa tài liệu' : 'Tải lên tài liệu mới'}</DialogTitle>
            </DialogHeader>
            <DocumentForm
              key={editingItem?.id || 'new'}
              document={editingItem}
              onSubmit={editingItem ? handleUpdate : handleCreate}
              isPending={createMutation.isPending || updateMutation.isPending || uploadMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Input
        placeholder="Tìm kiếm theo tiêu đề, tags, hoặc thành viên..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="max-w-md"
      />

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <Card key={i}><CardContent className="p-4 h-16" /></Card>)}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Archive className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>Chưa có tài liệu nào</p>
          </CardContent>
        </Card>
      ) : (
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
                            {DOCUMENT_CATEGORY_LABELS[doc.category]}
                          </Badge>
                          {doc.privacy_level === 0 && (
                            <Badge className="mr-1 text-xs bg-green-100 text-green-800">Công khai</Badge>
                          )}
                          {doc.privacy_level === 1 && (
                            <Badge className="mr-1 text-xs bg-blue-100 text-blue-800">Thành viên</Badge>
                          )}
                          {doc.privacy_level === 2 && (
                            <Badge className="mr-1 text-xs bg-red-100 text-red-800">Nội bộ</Badge>
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
                            <AlertDialogTitle>Xóa tài liệu?</AlertDialogTitle>
                            <AlertDialogDescription>
                              File &quot;{doc.title}&quot; sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(doc)}>Xóa</AlertDialogAction>
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
            itemLabel="tài liệu"
          />
        </div>
      )}
    </div>
  );
}
