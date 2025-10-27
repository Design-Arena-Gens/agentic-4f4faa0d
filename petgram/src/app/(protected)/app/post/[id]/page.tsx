import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { PostCard } from "@/components/feed/PostCard";
import type { FeedPost } from "@/app/(protected)/app/page";

export default async function PostDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  const { data: post, error } = await supabase
    .from("posts")
    .select(
      "id, caption, media_url, media_type, thumbnail_url, tags, created_at, profiles:author_id(id, username, full_name, avatar_url)"
    )
    .eq("id", params.id)
    .single();

  if (error || !post) {
    notFound();
  }

  const [{ data: likes }, { data: comments }] = await Promise.all([
    supabase
      .from("likes")
      .select("post_id, user_id")
      .eq("post_id", post.id),
    supabase
      .from("comments")
      .select("id, post_id, content, created_at, profiles:user_id(username, avatar_url)")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true }),
  ]);

  const likeCount = likes?.length ?? 0;
  const hasLiked = likes?.some((like) => like.user_id === session.user.id) ?? false;
  const commentPreview = (comments ?? []).slice(0, 3);

  return (
    <section className="space-y-6">
      <PostCard
        post={post as FeedPost}
        likeCount={likeCount}
        commentCount={comments?.length ?? 0}
        hasLiked={hasLiked}
        commentPreview={commentPreview}
        currentUserId={session.user.id}
      />
    </section>
  );
}
