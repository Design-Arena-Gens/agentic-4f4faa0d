"use client";

import { QueryProvider } from "./QueryProvider";
import { SupabaseProvider } from "./SupabaseProvider";

export function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SupabaseProvider>
      <QueryProvider>{children}</QueryProvider>
    </SupabaseProvider>
  );
}
