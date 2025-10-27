import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/navigation/AppShell";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import type { Tables } from "@/lib/database.types";

export const dynamic = "force-dynamic";

export default async function ProtectedAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (profileError) {
    console.error(profileError.message);
  }

  const profile: Tables<"profiles"> =
    profileData ??
    ({
      id: session.user.id,
      username: session.user.user_metadata?.username ?? session.user.email?.split("@")[0] ?? "petgrammer",
      full_name: session.user.user_metadata?.full_name ?? null,
      bio: null,
      avatar_url: session.user.user_metadata?.avatar_url ?? null,
      species: null,
      breed: null,
      location: null,
      website: null,
      created_at: new Date().toISOString(),
    } as Tables<"profiles">);

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, is_read, created_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(30);

  const unreadNotifications = notifications?.filter((notification) => !notification.is_read).length ?? 0;

  return (
    <AppShell profile={profile} unreadNotifications={unreadNotifications}>
      {children}
    </AppShell>
  );
}
