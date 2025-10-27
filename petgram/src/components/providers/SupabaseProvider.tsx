"use client";

import { createContext, useContext } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useSupabaseBrowser } from "@/lib/supabase/browserClient";
import type { Database } from "@/lib/database.types";

const SupabaseContext = createContext<SupabaseClient<Database> | null>(null);

export function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = useSupabaseBrowser();

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const ctx = useContext(SupabaseContext);
  if (!ctx) {
    throw new Error("Supabase client not available. Wrap your component in SupabaseProvider.");
  }
  return ctx;
}
