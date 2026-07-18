/**
 * @project AncestorTree
 * @file src/components/people/people-filters.tsx
 * @description Search and filter controls for the people list
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

import { Filter, Search, X } from 'lucide-react';
import {
  Button,
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
  PEOPLE_STATUS_FILTER_OPTIONS,
  isPeopleStatusFilter,
  type PeopleStatusFilter,
} from '@constants';

interface PeopleFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  generationFilter: string;
  onGenerationFilterChange: (value: string) => void;
  generations: number[];
  chiFilter: string;
  onChiFilterChange: (value: string) => void;
  chiValues: number[];
  statusFilter: PeopleStatusFilter;
  onStatusFilterChange: (value: PeopleStatusFilter) => void;
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function PeopleFilters({
  search,
  onSearchChange,
  generationFilter,
  onGenerationFilterChange,
  generations,
  chiFilter,
  onChiFilterChange,
  chiValues,
  statusFilter,
  onStatusFilterChange,
  hasFilters,
  onClearFilters,
}: PeopleFiltersProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Filter className="h-4 w-4" />
          Bộ lọc
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-9"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select
            value={generationFilter}
            onValueChange={onGenerationFilterChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn đời" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả đời</SelectItem>
              {generations.map((generation) => (
                <SelectItem key={generation} value={generation.toString()}>
                  Đời {generation}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={chiFilter} onValueChange={onChiFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn chi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chi</SelectItem>
              {chiValues.map((chi) => (
                <SelectItem key={chi} value={chi.toString()}>
                  Chi {chi}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) => {
              if (isPeopleStatusFilter(value)) onStatusFilterChange(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {PEOPLE_STATUS_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="mr-1 h-4 w-4" />
            Xóa bộ lọc
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
