"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

export function AppNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="flex w-full justify-around gap-2 rounded-3xl bg-white/80 p-2 shadow-lg shadow-forest-900/10 lg:flex-col">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "focus-ring relative flex flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-3 text-xs font-medium transition lg:flex-row lg:justify-start lg:px-4 lg:text-sm",
              isActive
                ? "bg-moss-300/20 text-forest-900"
                : "text-ink-500 hover:bg-cream-50 hover:text-forest-900"
            )}
          >
            <Icon className={clsx("h-5 w-5", isActive ? "text-forest-900" : "text-ink-500")} aria-hidden />
            <span>{item.label}</span>
            {item.badge && item.badge > 0 ? (
              <span className="absolute -top-2 right-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-accent-500 px-1 text-[0.65rem] font-semibold text-white lg:static lg:ml-auto lg:h-6 lg:px-2">
                {item.badge > 9 ? "9+" : item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
