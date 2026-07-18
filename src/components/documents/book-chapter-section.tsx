/**
 * @project AncestorTree
 * @file src/components/documents/book-chapter-section.tsx
 * @description Generation chapter section in the printable family book
 * @version 1.0.0
 * @updated 2026-07-18
 */

import type { BookChapter } from '@types';
import { BookPersonEntry } from './book-person-entry';

interface BookChapterSectionProps {
  chapter: BookChapter;
}

export function BookChapterSection({ chapter }: BookChapterSectionProps) {
  const totalPeople = chapter.branches.reduce(
    (sum, branch) => sum + branch.people.length,
    0
  );

  return (
    <section className="book-chapter">
      <div className="mb-4 rounded-lg bg-emerald-50 p-4">
        <h2 className="text-xl font-bold text-emerald-900">{chapter.title}</h2>
        <p className="text-sm text-emerald-700">{totalPeople} thành viên</p>
      </div>

      {chapter.branches.map((branch, branchIndex) => (
        <div key={branchIndex} className="mb-6">
          {branch.chi !== null && chapter.branches.length > 1 && (
            <h3 className="mb-2 border-l-2 border-emerald-300 pl-2 text-base font-semibold text-muted-foreground">
              Chi {branch.chi}
            </h3>
          )}
          <div className="divide-y">
            {branch.people.map((entry) => (
              <BookPersonEntry key={entry.person.id} entry={entry} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
