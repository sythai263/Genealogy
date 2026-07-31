/**
 * @project AncestorTree
 * @file src/components/documents/documents-view.tsx
 * @description Documents hub - GEDCOM export, book view, library links
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

import { DOCUMENTS_HUB_LINK_ICONS, DOCUMENTS_HUB_LINKS } from '@constants';
import { DocumentHubLinkCard } from './document-hub-link-card';
import { GedcomExportCard } from './gedcom-export-card';

export function DocumentsView() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Tài liệu</h1>
        <p className="text-muted-foreground">
          Lưu trữ, xuất dữ liệu và in ấn gia phả
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <GedcomExportCard />
        {DOCUMENTS_HUB_LINKS.map((link) => (
          <DocumentHubLinkCard
            key={link.id}
            config={link}
            icon={DOCUMENTS_HUB_LINK_ICONS[link.id]}
          />
        ))}
      </div>
    </div>
  );
}
