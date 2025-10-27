import { Suspense } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import type { Tables } from "@/lib/database.types";
import { FeedSkeleton } from "@/components/feed/FeedSkeleton";
import { MasonryFeed } from "@/components/feed/MasonryFeed";

export const dynamic = "force-dynamic";

async function fetchFeed() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { posts: [], likes: [], comments: [], previews: [], userId: "" };
  }

  const { data: posts } = await supabase
    .from("posts")
    .select(
      "id, caption, media_url, media_type, thumbnail_url, tags, created_at, profiles:author_id(id, username, full_name, avatar_url)"
    )
    .order("created_at", { ascending: false })
    .limit(30);

  const postIds = posts?.map((post) => post.id) ?? [];

  if (postIds.length === 0) {
    return { posts: [], likes: [], comments: [], previews: [], userId: session.user.id };
  }

  const [{ data: likes }, { data: comments }, { data: commentPreviews }] = await Promise.all([
    supabase
      .from("likes")
      .select("post_id, user_id")
      .in("post_id", postIds),
    supabase
      .from("comments")
      .select("id, post_id")
      .in("post_id", postIds),
    supabase
      .from("comments")
      .select("id, post_id, content, created_at, profiles:user_id(username, avatar_url)")
      .in("post_id", postIds)
      .order("created_at", { ascending: true })
      .limit(80),
  ]);

  return {
    posts: posts ?? [],
    likes: likes ?? [],
    comments: comments ?? [],
    previews: commentPreviews ?? [],
    userId: session.user.id,
  };
}

export default async function FeedPage() {
  const dataPromise = fetchFeed();

  return (
    <section className="space-y-8">
      <header className="rounded-4xl bg-white/80 px-6 py-8 shadow-xl shadow-forest-900/10">
        <h1 className="text-3xl font-semibold text-forest-900">Community feed</h1>
        <p className="mt-2 text-sm text-ink-600">
          Discover the latest heart-melting updates from animals and their human teammates.
        </p>
      </header>
      <Suspense fallback={<FeedSkeleton />}>
        <FeedContent promise={dataPromise} />
      </Suspense>
    </section>
  );
}

async function FeedContent({
  promise,
}: {
  promise: ReturnType<typeof fetchFeed>;
}) {
  const { posts, likes, comments, previews, userId } = await promise;

  return (
    <MasonryFeed
      posts={posts as unknown as FeedPost[]}
      likes={likes ?? []}
      comments={comments ?? []}
      commentPreviews={previews ?? []}
      currentUserId={userId}
    />
  );
}

export interface FeedPost extends Tables<"posts"> {
  profiles: Pick<Tables<"profiles">, "id" | "username" | "full_name" | "avatar_url">;
}
