"use client";

import { Loader2 } from "lucide-react";
import { clsx } from "clsx";

export function AuthSubmitButton({
  children,
  isLoading,
  className,
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className={clsx(
        "focus-ring inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-500/30 transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-80",
        className
      )}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
