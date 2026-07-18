/**
 * @project AncestorTree
 * @file src/components/directory/directory-filters.tsx
 * @description Search and filter controls for the family directory
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

import { Search } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui';
import {
  DIRECTORY_GENDER_FILTER_OPTIONS,
  DIRECTORY_STATUS_FILTER_OPTIONS,
  isDirectoryGenderFilter,
  isDirectoryStatusFilter,
} from '@constants';
import type { DirectoryGenderFilter, DirectoryStatusFilter } from '@types';

interface DirectoryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  generationFilter: string;
  onGenerationFilterChange: (value: string) => void;
  generations: number[];
  genderFilter: DirectoryGenderFilter;
  onGenderFilterChange: (value: DirectoryGenderFilter) => void;
  statusFilter: DirectoryStatusFilter;
  onStatusFilterChange: (value: DirectoryStatusFilter) => void;
}

export function DirectoryFilters({
  search,
  onSearchChange,
  generationFilter,
  onGenerationFilterChange,
  generations,
  genderFilter,
  onGenderFilterChange,
  statusFilter,
  onStatusFilterChange,
}: DirectoryFiltersProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Bộ lọc</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên, SĐT, email..."
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Select
            value={generationFilter}
            onValueChange={onGenerationFilterChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Đời" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả đời</SelectItem>
              {generations.map((generation) => (
                <SelectItem key={generation} value={String(generation)}>
                  Đời {generation}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={genderFilter}
            onValueChange={(value) => {
              if (isDirectoryGenderFilter(value)) onGenderFilterChange(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Giới tính" />
            </SelectTrigger>
            <SelectContent>
              {DIRECTORY_GENDER_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              if (isDirectoryStatusFilter(value)) onStatusFilterChange(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {DIRECTORY_STATUS_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
