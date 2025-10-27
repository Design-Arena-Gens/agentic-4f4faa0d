"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { clsx } from "clsx";

export function SignOutButton({ className }: { className?: string }) {
  const supabase = useSupabase();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    setIsLoading(true);
    await supabase.auth.signOut();
    router.replace("/");
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isLoading}
      className={clsx(
        "focus-ring inline-flex w-full items-center justify-center gap-2 rounded-full border border-forest-900/10 bg-white px-4 py-2 text-sm font-semibold text-forest-900 transition hover:border-accent-500 hover:text-accent-500 disabled:opacity-60",
        className
      )}
    >
      <LogOut className="h-4 w-4" aria-hidden />
      <span>{isLoading ? "Signing out" : "Log out"}</span>
    </button>
  );
}
