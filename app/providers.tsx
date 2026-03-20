'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { SessionProvider } from 'next-auth/react';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5, // 5 minutes
                gcTime: 1000 * 60 * 30, // 30 minutes
                refetchOnWindowFocus: false, // Prevents loading every time user switches window back
                retry: 1,
            },
        },
    }));

    return (
        <SessionProvider refetchOnWindowFocus={false}>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
                <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                        <NotificationProvider>
                            <TooltipProvider>
                                {children}
                                <Toaster position="top-center" />
                            </TooltipProvider>
                        </NotificationProvider>
                    </AuthProvider>
                </QueryClientProvider>
            </ThemeProvider>
        </SessionProvider>
    );
}
