import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from '@/shared/api/query-client';
import { api, unwrap } from '@/shared/api/client';
import { useAuthStore } from '@/entities/user/store';
import { useThemeStore } from '@/features/theme/store';
import type { ExpertDto, Paginated } from '@/shared';

export function Providers({ children }: { children: ReactNode }) {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const applyTheme = useThemeStore((s) => s.apply);
  const location = useLocation();

  useEffect(() => {
    applyTheme();
    void fetchMe();
  }, [applyTheme, fetchMe]);

  useEffect(() => {
    if (location.pathname !== '/marketplace') return;

    const prefetch = () => {
      void queryClient.prefetchQuery({
        queryKey: ['experts', {}],
        queryFn: () =>
          unwrap<Paginated<ExpertDto>>(
            api.get('/marketplace/experts', { params: { pageSize: 100 } }),
          ),
        staleTime: 60_000,
      });
    };

    const timer = setTimeout(prefetch, 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'hsl(230 28% 11%)',
            border: '1px solid hsl(230 20% 22%)',
            color: 'hsl(220 30% 96%)',
          },
        }}
      />
    </QueryClientProvider>
  );
}
