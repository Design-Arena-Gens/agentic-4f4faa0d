import { Bell, Heart, MessageCircle, UserPlus, PawPrint } from "lucide-react";
import Link from "next/link";
import { MarkAllAsReadButton } from "@/components/notifications/MarkAllAsReadButton";
import type { Tables } from "@/lib/database.types";

interface NotificationListProps {
  notifications: Tables<"notifications">[];
}

const iconMap = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
} as const;

export function NotificationList({ notifications }: NotificationListProps) {
  if (!notifications || notifications.length === 0) {
    return (
      <div className="rounded-4xl border border-dashed border-forest-900/15 bg-cream-50 px-6 py-24 text-center">
        <PawPrint className="mx-auto h-8 w-8 text-moss-500" aria-hidden />
        <p className="mt-4 text-sm text-ink-600">
          You&apos;re all caught up! Share a new moment to spark fresh engagement.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-500">
          {notifications.filter((notification) => !notification.is_read).length} unread
        </p>
        <MarkAllAsReadButton />
      </div>
      <ul className="space-y-3">
        {notifications.map((notification) => {
          const Icon = iconMap[notification.type] ?? Bell;
          const message = typeof notification.data === "object" && notification.data !== null
            ? (notification.data as { message?: string }).message
            : undefined;
          const postId = typeof notification.data === "object" && notification.data !== null
            ? (notification.data as { post_id?: string }).post_id
            : undefined;

          return (
            <li
              key={notification.id}
              className={`flex items-center gap-4 rounded-3xl border px-4 py-3 text-sm shadow-sm transition ${
                notification.is_read
                  ? "border-cream-200 bg-white"
                  : "border-accent-500/30 bg-accent-500/10"
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-accent-500">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <div className="flex-1 text-ink-700">
                <p className="font-medium text-forest-900">
                  {message ?? buildDefaultMessage(notification.type)}
                </p>
                <p className="text-xs text-ink-500">{formatRelativeTime(notification.created_at)}</p>
              </div>
              {postId && (
                <Link
                  href={`/app/post/${postId}`}
                  className="focus-ring inline-flex items-center rounded-full border border-cream-200 px-3 py-1 text-xs font-semibold text-moss-600 transition hover:border-moss-500"
                >
                  View
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function buildDefaultMessage(type: Tables<"notifications">["type"]) {
  switch (type) {
    case "like":
      return "Someone liked your post";
    case "comment":
      return "A pet lover responded to your story";
    case "follow":
      return "You have a new follower";
    default:
      return "New activity on Petgram";
  }
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const diff = date.getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const seconds = Math.round(diff / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (Math.abs(seconds) < 60) return rtf.format(seconds, "second");
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  return rtf.format(days, "day");
}
