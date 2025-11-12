'use client';
import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TableProvider } from '../contexts/TableContext';
import { PeopleProvider } from '@/contexts/PeopleContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60000,
          gcTime: 5 * 60 * 1000,
          refetchOnWindowFocus: true,
        },
      },
    });
  });
  return (
    <QueryClientProvider client={client}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        enableColorScheme
      >
        <PeopleProvider>
          <TableProvider>{children}</TableProvider>
        </PeopleProvider>
      </NextThemesProvider>
    </QueryClientProvider>
  );
}
