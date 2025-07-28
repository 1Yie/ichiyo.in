"use client";

import ClientThemeProvider from "./client-theme-provider";

export default function ClientThemeWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientThemeProvider>{children}</ClientThemeProvider>;
}
