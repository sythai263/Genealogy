/**
 * @project AncestorTree
 * @file src/components/people/photo-gallery.tsx
 * @description Photo gallery component for person detail page
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  ImageIcon,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
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
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@components/ui';
import {
  useDeleteMedia,
  usePersonMedia,
  useSetPrimaryMedia,
  useUploadMedia,
} from '@hooks';
import type { Media } from '@types';

interface PhotoGalleryProps {
  personId: string;
  canEdit: boolean;
}

export function PhotoGallery({ personId, canEdit }: PhotoGalleryProps) {
  const t = useTranslations('People');
  const tCommon = useTranslations('Common');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Media | null>(null);

  const { data: photos, isLoading } = usePersonMedia(personId);
  const uploadMutation = useUploadMedia();
  const deleteMutation = useDeleteMedia();
  const setPrimaryMutation = useSetPrimaryMedia();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadMutation.mutateAsync({ file, personId });
      toast.success(t('photos.uploadSuccess'));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('photos.uploadError')
      );
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleDelete(photo: Media) {
    try {
      await deleteMutation.mutateAsync({
        id: photo.id,
        url: photo.url,
        personId: photo.person_id,
      });
      setSelectedPhoto(null);
      toast.success(t('photos.deleteSuccess'));
    } catch {
      toast.error(t('photos.deleteError'));
    }
  }

  async function handleSetPrimary(photo: Media) {
    try {
      await setPrimaryMutation.mutateAsync({
        personId: photo.person_id,
        mediaId: photo.id,
      });
      toast.success(t('photos.setPrimarySuccess'));
    } catch {
      toast.error(t('photos.setPrimaryError'));
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('photos.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">{t('photos.title')}</CardTitle>
          {canEdit && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleUpload}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="mr-2 h-4 w-4" />
                )}
                {t('photos.add')}
              </Button>
            </>
          )}
        </CardHeader>
        <CardContent>
          {!photos || photos.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <ImageIcon className="mx-auto mb-2 h-10 w-10 opacity-50" />
              <p>{t('photos.empty')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <Image
                    src={photo.url}
                    alt={photo.caption || t('photos.alt')}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                  {photo.is_primary && (
                    <Badge className="absolute top-1 left-1 bg-amber-500 text-xs">
                      <Star className="mr-1 h-3 w-3" />
                      {t('photos.primary')}
                    </Badge>
                  )}
                  {photo.caption && (
                    <div className="absolute right-0 bottom-0 left-0 truncate bg-black/50 p-1 text-xs text-white">
                      {photo.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPhoto?.caption || t('photos.view')}
            </DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="space-y-4">
              <Image
                src={selectedPhoto.url}
                alt={selectedPhoto.caption || t('photos.alt')}
                width={800}
                height={600}
                className="w-full rounded-lg"
                sizes="(max-width: 768px) 100vw, 800px"
              />
              {canEdit && (
                <div className="flex justify-end gap-2">
                  {!selectedPhoto.is_primary && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetPrimary(selectedPhoto)}
                      disabled={setPrimaryMutation.isPending}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      {t('photos.setPrimary')}
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" />
                        {tCommon('delete')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t('photos.deleteConfirm')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('photos.deleteConfirmDesc')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(selectedPhoto)}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending
                            ? tCommon('deleting')
                            : tCommon('delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
