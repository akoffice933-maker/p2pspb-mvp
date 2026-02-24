'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '@/lib/api';

type SortBy = 'createdAt' | 'rate' | 'amount';
type SortOrder = 'asc' | 'desc';

export function useOrders(
  filters?: { type?: string; payment?: string },
  page: number = 1,
  limit: number = 20,
  sortBy?: SortBy,
  sortOrder?: SortOrder,
) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['orders', filters, page, limit, sortBy, sortOrder],
    queryFn: async () => {
      const { data } = await api.get('/orders', {
        params: {
          ...filters,
          page,
          limit,
          sortBy,
          sortOrder,
        },
      });
      return data;
    },
  });

  // SSE для обновлений
  useEffect(() => {
    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000'}/sse/orders`
    );

    eventSource.onmessage = (event) => {
      const newOrders = JSON.parse(event.data);
      queryClient.setQueryData(['orders', filters, page, limit, sortBy, sortOrder], newOrders);
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
    };

    return () => eventSource.close();
  }, [filters, page, limit, sortBy, sortOrder, queryClient]);

  return { data, isLoading };
}
