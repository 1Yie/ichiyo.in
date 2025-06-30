
"use client";

import ClientThemeProvider from '@/app/[locale]/(main)/client-theme-provider';

export default function ClientThemeWrapper({ children }: { children: React.ReactNode }) {
  return <ClientThemeProvider>{children}</ClientThemeProvider>;
}
