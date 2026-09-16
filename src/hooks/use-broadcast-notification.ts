'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { broadcastSystemNotification } from '@services';

export function useBroadcastNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; body?: string; link?: string }) =>
      broadcastSystemNotification(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
