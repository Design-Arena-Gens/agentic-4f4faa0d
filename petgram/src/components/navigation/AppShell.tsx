import Image from "next/image";
import type { ReactNode } from "react";
import { Bell, Home, Search, Upload, UserRound } from "lucide-react";
import { clsx } from "clsx";
import { AppNav } from "./AppNav";
import { SignOutButton } from "./SignOutButton";
import type { Tables } from "@/lib/database.types";

interface AppShellProps {
  children: ReactNode;
  profile: Tables<"profiles">;
  unreadNotifications: number;
}

export function AppShell({ children, profile, unreadNotifications }: AppShellProps) {
  const navItems = [
    { label: "Home", href: "/app", icon: Home },
    { label: "Search", href: "/app/search", icon: Search },
    { label: "Upload", href: "/app/upload", icon: Upload },
    { label: "Notifications", href: "/app/notifications", icon: Bell, badge: unreadNotifications },
    { label: "Profile", href: `/app/profile/${profile.username}`, icon: UserRound },
  ];

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6 lg:flex-row lg:px-10">
        <aside className="sticky top-6 z-20 flex flex-col gap-6 lg:h-[calc(100vh-3rem)] lg:w-64">
          <div className="flex items-center gap-3 rounded-3xl bg-white/80 px-4 py-3 shadow-xl shadow-forest-900/10">
            <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-sand-100">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name ?? profile.username}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl">
                  🐾
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-ink-500">Signed in as</p>
              <p className="text-base font-semibold text-forest-900">{profile.full_name ?? profile.username}</p>
            </div>
          </div>
          <AppNav items={navItems} />
          <SignOutButton />
        </aside>
        <main className={clsx("flex-1", "lg:pb-16")}>{children}</main>
      </div>
      <div className="sticky bottom-0 z-30 border-t border-cream-200 bg-white/95 px-4 py-2 shadow-[0_-10px_30px_rgba(46,74,31,0.08)] backdrop-blur lg:hidden">
        <AppNav items={navItems} />
      </div>
    </div>
  );
}
