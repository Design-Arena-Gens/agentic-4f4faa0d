import Link from "next/link";
import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-3xl border border-cream-200 bg-white/90 p-8 shadow-2xl shadow-forest-900/10">
        <div className="space-y-2 text-center">
          <p className="inline-flex items-center justify-center gap-2 text-sm font-medium text-moss-500">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sand-100 text-accent-500">
              🐾
            </span>
            Petgram
          </p>
          <h1 className="text-2xl font-semibold text-forest-900">{title}</h1>
          <p className="text-sm text-ink-500">{subtitle}</p>
        </div>
        <div className="mt-8 space-y-6">{children}</div>
        {footer && <div className="mt-6 text-sm text-ink-500">{footer}</div>}
      </div>
      <p className="mt-6 text-center text-xs text-ink-500">
        Need a reminder of why we do this? <Link href="/" className="font-medium text-moss-500 hover:text-accent-500">Explore Petgram&apos;s mission</Link>.
      </p>
    </div>
  );
}
