import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfilePostGrid } from "@/components/profile/ProfilePostGrid";

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", params.username)
    .single();

  if (error || !profile) {
    notFound();
  }

  const [{ count: followerCount }, { count: followingCount }, { data: followingState }, { data: posts }] =
    await Promise.all([
      supabase
        .from("followers")
        .select("id", { count: "exact", head: true })
        .eq("followed_id", profile.id),
      supabase
        .from("followers")
        .select("id", { count: "exact", head: true })
        .eq("follower_id", profile.id),
      session
        ? supabase
            .from("followers")
            .select("id")
            .eq("follower_id", session.user.id)
            .eq("followed_id", profile.id)
        : Promise.resolve({ data: null }),
      supabase
        .from("posts")
        .select("id, media_url, media_type, caption, thumbnail_url, created_at")
        .eq("author_id", profile.id)
        .order("created_at", { ascending: false }),
    ]);

  const isOwner = session?.user?.id === profile.id;
  const isFollowing = Boolean(followingState && followingState.length > 0);

  return (
    <section className="space-y-8">
      <ProfileHeader
        profile={profile}
        followerCount={followerCount ?? 0}
        followingCount={followingCount ?? 0}
        isOwner={isOwner}
        isFollowing={isFollowing}
      />
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-forest-900">Posts</h2>
        <ProfilePostGrid posts={(posts ?? []).map((post) => ({
          id: post.id,
          media_url: post.media_url,
          media_type: post.media_type,
          caption: post.caption,
          thumbnail_url: post.thumbnail_url,
        }))} />
      </div>
    </section>
  );
}
