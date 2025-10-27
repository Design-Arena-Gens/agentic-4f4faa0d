"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useSupabase } from "@/components/providers/SupabaseProvider";

export function MarkAllAsReadButton() {
  const supabase = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleClick() {
    setIsLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      return;
    }

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id);

    setIsLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className="focus-ring inline-flex items-center gap-2 rounded-full border border-cream-200 px-3 py-2 text-xs font-semibold text-ink-500 transition hover:border-moss-500 hover:text-moss-600 disabled:opacity-60"
    >
      <Check className="h-4 w-4" aria-hidden />
      {success ? "Marked!" : "Mark all as read"}
    </button>
  );
}
