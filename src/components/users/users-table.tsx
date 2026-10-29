/**
 * @project AncestorTree
 * @file src/components/users/users-table.tsx
 * @description Users management table — selection checkbox, identity, role
 *              select, verification status, tree links, join date, row actions
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useLocale, useTranslations } from 'next-intl';
import {
  CheckCircle,
  Clock,
  GitBranch,
  Link2,
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui';
import { USER_ROLE_ORDER } from '@constants';
import type { Profile, UserRole } from '@types';
import { PersonName } from './person-name';
import { UserRoleBadge, roleLabel } from './user-role-badge';
import { UserRowActions } from './user-row-actions';

interface UsersTableProps {
  users: Profile[];
  currentUserId: string | undefined;
  selectedUsers: Set<string>;
  allSelected: boolean;
  someSelected: boolean;
  onToggleSelectAll: () => void;
  onToggleSelectUser: (userId: string) => void;
  onRoleChange: (
    userId: string,
    newRole: UserRole,
    currentRole: UserRole,
    userName: string
  ) => void;
  onMapTree: (user: Profile) => void;
  onSuspend: (user: Profile) => void;
  onDelete: (user: Profile) => void;
}

export function UsersTable({
  users,
  currentUserId,
  selectedUsers,
  allSelected,
  someSelected,
  onToggleSelectAll,
  onToggleSelectUser,
  onRoleChange,
  onMapTree,
  onSuspend,
  onDelete,
}: UsersTableProps) {
  const t = useTranslations('Admin');
  const locale = useLocale();
  const dateLocale = locale === 'vi' ? 'vi-VN' : 'en-US';

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(dateLocale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const isSelf = (user: Profile) => user.user_id === currentUserId;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox
              checked={
                allSelected ? true : someSelected ? 'indeterminate' : false
              }
              onCheckedChange={onToggleSelectAll}
              aria-label={t('users.selectAll')}
            />
          </TableHead>
          <TableHead>{t('users.columns.user')}</TableHead>
          <TableHead className="hidden sm:table-cell">
            {t('users.columns.email')}
          </TableHead>
          <TableHead>{t('users.columns.role')}</TableHead>
          <TableHead>{t('users.columns.status')}</TableHead>
          <TableHead className="hidden lg:table-cell">
            {t('users.columns.tree')}
          </TableHead>
          <TableHead className="hidden md:table-cell">
            {t('users.columns.createdAt')}
          </TableHead>
          <TableHead className="text-right">
            {t('users.columns.actions')}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const displayName = user.full_name || user.email;
          return (
            <TableRow
              key={user.id}
              className={selectedUsers.has(user.user_id) ? 'bg-accent/50' : ''}
            >
              <TableCell>
                {isSelf(user) ? (
                  <div className="w-4" />
                ) : (
                  <Checkbox
                    checked={selectedUsers.has(user.user_id)}
                    onCheckedChange={() => onToggleSelectUser(user.user_id)}
                    aria-label={t('users.selectUser', { name: displayName })}
                  />
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium flex items-center gap-1.5">
                      {user.full_name || t('users.notUpdated')}
                      {user.is_suspended && (
                        <Badge
                          variant="destructive"
                          className="text-[10px] px-1 py-0 h-4"
                        >
                          {t('users.status.suspended')}
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground sm:hidden">
                      {user.email}
                    </p>
                    {user.is_suspended && user.suspension_reason && (
                      <p className="text-xs text-destructive mt-0.5 truncate max-w-45">
                        {user.suspension_reason}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {user.email}
              </TableCell>
              <TableCell>
                {isSelf(user) ? (
                  <UserRoleBadge role={user.role} />
                ) : (
                  <Select
                    value={user.role}
                    onValueChange={(value) =>
                      onRoleChange(
                        user.user_id,
                        value as UserRole,
                        user.role,
                        displayName
                      )
                    }
                  >
                    <SelectTrigger className="w-35 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_ROLE_ORDER.map((role) => (
                        <SelectItem key={role} value={role}>
                          <span className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                role === 'admin'
                                  ? 'bg-red-500'
                                  : role === 'editor'
                                    ? 'bg-blue-500'
                                    : 'bg-gray-500'
                              }`}
                            />
                            {roleLabel(role, t)}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </TableCell>
              <TableCell>
                {user.is_verified ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {t('users.columns.verified')}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-amber-600 border-amber-300"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {t('users.status.pending')}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="space-y-0.5">
                  {user.linked_person ? (
                    <div className="flex items-center gap-1 text-xs">
                      <Link2 className="h-3 w-3 text-green-600 shrink-0" />
                      <PersonName personId={user.linked_person} />
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {t('users.notLinked')}
                    </span>
                  )}
                  {user.edit_root_person_id && (
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <GitBranch className="h-3 w-3 shrink-0" />
                      <PersonName personId={user.edit_root_person_id} />
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {formatDate(user.created_at)}
              </TableCell>
              <TableCell className="text-right">
                <UserRowActions
                  user={user}
                  isSelf={isSelf(user)}
                  onMapTree={onMapTree}
                  onSuspend={onSuspend}
                  onDelete={onDelete}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
