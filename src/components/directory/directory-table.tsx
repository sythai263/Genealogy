/**
 * @project AncestorTree
 * @file src/components/directory/directory-table.tsx
 * @description Results table for the family directory
 * @version 1.1.0
 * @updated 2026-07-19
 */

import { Lock } from 'lucide-react';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  Skeleton,
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui';
import type { DirectoryContactDisplay, Person } from '@types';
import { DirectoryTableRow } from './directory-table-row';

interface DirectoryTableProps {
  people: Person[];
  /** Total matching rows from server (not just current page). */
  total: number;
  isLoading: boolean;
  isAuthenticated: boolean;
  getContact: (person: Person) => DirectoryContactDisplay;
}

export function DirectoryTable({
  people,
  total,
  isLoading,
  isAuthenticated,
  getContact,
}: DirectoryTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardDescription>
            {isLoading ? 'Đang tải...' : `${total} thành viên`}
          </CardDescription>
          {!isAuthenticated && (
            <Badge variant="outline" className="gap-1">
              <Lock className="h-3 w-3" />
              Đăng nhập để xem đầy đủ
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-4 p-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : people.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            Không tìm thấy thành viên phù hợp
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Họ tên</TableHead>
                  <TableHead className="min-w-[60px]">Đời</TableHead>
                  <TableHead className="min-w-[140px]">Điện thoại</TableHead>
                  <TableHead className="min-w-[180px]">Email</TableHead>
                  <TableHead className="min-w-[200px]">Địa chỉ</TableHead>
                  <TableHead className="min-w-[80px]">Liên kết</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {people.map((person) => (
                  <DirectoryTableRow
                    key={person.id}
                    person={person}
                    contact={getContact(person)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
