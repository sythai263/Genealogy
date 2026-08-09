/**
 * @project AncestorTree
 * @file src/components/relationship/relationship-result-card.tsx
 * @description Displays relationship pathfinding result with bold Hán-Việt kinship terms
 * @version 1.1.0
 * @updated 2026-08-09
 */

import Link from 'next/link';
import { ArrowRight, GitBranchPlus } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ui';
import { type RelationshipResult, cn } from '@lib';

interface RelationshipResultCardProps {
  result: RelationshipResult;
  treeRootId: string;
}

/**
 * Render text with **Hán Việt (diễn giải)** segments bolded.
 */
function KinshipText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return (
            <strong
              key={index}
              className="font-bold text-foreground underline decoration-primary/40 decoration-2 underline-offset-2"
            >
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}

export function RelationshipResultCard({
  result,
  treeRootId,
}: RelationshipResultCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Kết quả</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
          <p className="text-lg leading-relaxed">
            <KinshipText text={result.description} />
          </p>
          {result.descriptionDetail && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              <KinshipText text={result.descriptionDetail} />
            </p>
          )}
        </div>

        {result.found && result.path.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium">
              Đường đi ({result.distance} bậc):
            </p>
            <div className="flex flex-wrap items-center gap-1">
              {result.path.map((person, idx) => (
                <div key={person.id} className="flex items-center gap-1">
                  <Link
                    href={`/people/${person.id}`}
                    className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm transition-colors hover:bg-accent"
                  >
                    <div
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium',
                        person.gender === 1
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-pink-100 text-pink-700'
                      )}
                    >
                      {person.display_name.slice(-1)}
                    </div>
                    {person.display_name}
                  </Link>
                  {idx < result.path.length - 1 && (
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {result.lca && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Tổ tiên chung:</span>
            <Link
              href={`/people/${result.lca.id}`}
              className="font-medium hover:underline"
            >
              {result.lca.display_name}
            </Link>
            <Badge variant="outline">Đời {result.lca.generation}</Badge>
          </div>
        )}

        {result.found && (
          <div className="pt-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/tree?root=${treeRootId}`}>
                <GitBranchPlus className="mr-1.5 h-4 w-4" />
                Xem trên cây gia phả
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
