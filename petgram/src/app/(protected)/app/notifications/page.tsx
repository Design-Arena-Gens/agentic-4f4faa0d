import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { NotificationList } from "@/components/notifications/NotificationList";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, user_id, type, data, is_read, created_at")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-3 rounded-4xl bg-white/80 px-6 py-8 shadow-xl shadow-forest-900/10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-forest-900">Notifications</h1>
          <p className="mt-2 text-sm text-ink-600">
            Celebrate every like, comment, and new follower in your pet community.
          </p>
        </div>
      </header>
      <NotificationList notifications={notifications ?? []} />
    </section>
  );
}
