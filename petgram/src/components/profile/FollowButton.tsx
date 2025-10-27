"use client";

import { useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { Loader2 } from "lucide-react";

interface FollowButtonProps {
  profileId: string;
  initialFollowing: boolean;
}

export function FollowButton({ profileId, initialFollowing }: FollowButtonProps) {
  const supabase = useSupabase();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);

  async function toggleFollow() {
    setIsLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsLoading(false);
      return;
    }

    if (isFollowing) {
      await supabase
        .from("followers")
        .delete()
        .eq("followed_id", profileId)
        .eq("follower_id", user.id);
      setIsFollowing(false);
    } else {
      await supabase
        .from("followers")
        .insert({ followed_id: profileId, follower_id: user.id });
      setIsFollowing(true);
    }

    setIsLoading(false);
  }

  return (
    <button
      type="button"
      onClick={toggleFollow}
      disabled={isLoading}
      className={`focus-ring inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition ${
        isFollowing
          ? "border border-moss-500 bg-moss-500/20 text-moss-600"
          : "bg-accent-500 text-white shadow shadow-accent-500/20 hover:bg-accent-600"
      }`}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}
