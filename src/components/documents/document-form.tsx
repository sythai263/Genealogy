/**
 * @project AncestorTree
 * @file src/components/documents/document-form.tsx
 * @description Form for creating and editing clan documents
 * @version 1.0.0
 * @updated 2026-08-09
 */

'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@components/ui';
import {
  DOCUMENT_CATEGORY_OPTIONS,
} from '@constants';
import { formatFileSize } from '@lib';
import type { ClanDocument, CreateClanDocumentInput, DocumentCategory, Person } from '@types';

interface DocumentFormProps {
  document?: ClanDocument;
  people: Person[];
  onSubmit: (data: CreateClanDocumentInput, file?: File) => void;
  isPending: boolean;
}

export function DocumentForm({
  document: doc,
  people,
  onSubmit,
  isPending,
}: DocumentFormProps) {
  const [title, setTitle] = useState(doc?.title || '');
  const [category, setCategory] = useState<DocumentCategory>(doc?.category || 'khac');
  const [description, setDescription] = useState(doc?.description || '');
  const [tags, setTags] = useState(doc?.tags || '');
  const [personId, setPersonId] = useState(doc?.person_id || 'none');
  const [privacyLevel, setPrivacyLevel] = useState(doc?.privacy_level ?? 1);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }
    if (!doc && !file) {
      toast.error('Vui lòng chọn file tải lên');
      return;
    }
    onSubmit({
      title,
      category,
      description: description || undefined,
      tags: tags || undefined,
      person_id: personId === 'none' ? undefined : personId || undefined,
      file_url: doc?.file_url || '',
      file_type: file?.type || doc?.file_type,
      file_size: file?.size || doc?.file_size,
      privacy_level: privacyLevel,
    }, file || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Tiêu đề *</Label>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ảnh nhà thờ tổ năm 1960" />
      </div>
      {!doc && (
        <div>
          <Label>File *</Label>
          <div className="flex items-center gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.mp4,.webm"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
          </div>
          {file && (
            <p className="text-xs text-muted-foreground mt-1">
              {file.name} ({formatFileSize(file.size)})
            </p>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Danh mục</Label>
          <Select value={category} onValueChange={v => setCategory(v as DocumentCategory)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DOCUMENT_CATEGORY_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Thành viên liên quan</Label>
          <Select value={personId} onValueChange={setPersonId}>
            <SelectTrigger><SelectValue placeholder="Không chọn" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Không chọn</SelectItem>
              {people.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.display_name} (Đời {p.generation})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Mô tả</Label>
        <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Mô tả ngắn về tài liệu" />
      </div>
      <div>
        <Label>Tags (phân cách bằng dấu phẩy)</Label>
        <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="nhà thờ, lịch sử, 1960" />
      </div>
      <div>
        <Label>Quyền riêng tư</Label>
        <Select value={privacyLevel.toString()} onValueChange={v => setPrivacyLevel(parseInt(v))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Công khai (ai cũng xem được)</SelectItem>
            <SelectItem value="1">Thành viên (đăng nhập mới xem)</SelectItem>
            <SelectItem value="2">Nội bộ (chỉ quản trị viên)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Đang lưu...' : (doc ? 'Cập nhật' : 'Tải lên')}
      </Button>
    </form>
  );
}
