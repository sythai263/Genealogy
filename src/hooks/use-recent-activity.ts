'use client';

import { useQuery } from '@tanstack/react-query';
import { getRecentActivity } from '@lib';

export function useRecentActivity(perSource: number = 5) {
  return useQuery({
    queryKey: ['admin', 'recent-activity', perSource],
    queryFn: () => getRecentActivity(perSource),
  });
}
