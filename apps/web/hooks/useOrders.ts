'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '@/lib/api';

export function useOrders(filters?: { type?: string; payment?: string }) {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      const { data } = await api.get('/orders', { params: filters });
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
      queryClient.setQueryData(['orders', filters], newOrders);
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
    };

    return () => eventSource.close();
  }, [filters, queryClient]);

  return { orders, isLoading };
}
