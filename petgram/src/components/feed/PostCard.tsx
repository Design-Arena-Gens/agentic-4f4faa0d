"use client";

import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  SendHorizonal,
  Loader2,
} from "lucide-react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import type { FeedPost } from "@/app/(protected)/app/page";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clsx } from "clsx";

interface CommentPreview {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  } | null;
}

interface PostCardProps {
  post: FeedPost;
  likeCount: number;
  commentCount: number;
  hasLiked: boolean;
  commentPreview: CommentPreview[];
  currentUserId: string;
}

interface CommentWithAuthor extends CommentPreview {
  profiles: {
    username: string;
    avatar_url: string | null;
  } | null;
}

export function PostCard({
  post,
  likeCount,
  commentCount,
  hasLiked,
  commentPreview,
  currentUserId,
}: PostCardProps) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const [isHovered, setIsHovered] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(likeCount);
  const [userHasLiked, setUserHasLiked] = useState(hasLiked);
  const [isCommenting, setIsCommenting] = useState(false);
  const [localCommentCount, setLocalCommentCount] = useState(commentCount);
  const mediaRef = useRef<HTMLVideoElement | HTMLImageElement | null>(null);

  const profile = post.profiles;
  const createdAt = useMemo(() => formatRelativeTime(post.created_at), [post.created_at]);

  const { data: commentsData = commentPreview, isFetching: isLoadingComments, refetch } = useQuery<CommentWithAuthor[]>({
    queryKey: ["comments", post.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("id, post_id, content, created_at, user_id, profiles:user_id(username, avatar_url)")
        .eq("post_id", post.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as CommentWithAuthor[];
    },
    enabled: isCommenting,
    initialData: commentPreview,
  });

  type LikeMutationContext = { count: number; liked: boolean };

  const likeMutation = useMutation<boolean, Error, void, LikeMutationContext>({
    mutationFn: async () => {
      if (userHasLiked) {
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", currentUserId);
        if (error) throw error;
        return false;
      }
      const { error } = await supabase
        .from("likes")
        .insert({ post_id: post.id, user_id: currentUserId });
      if (error) throw error;
      return true;
    },
    onMutate: async () => {
      const previous = { count: localLikeCount, liked: userHasLiked };
      setLocalLikeCount((count) => count + (userHasLiked ? -1 : 1));
      setUserHasLiked((liked) => !liked);
      return previous;
    },
    onError: (_error, _variables, context) => {
      if (context) {
        setLocalLikeCount(context.count);
        setUserHasLiked(context.liked);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  const commentMutation = useMutation<CommentWithAuthor, Error, string, { previous?: CommentWithAuthor[] }>({
    mutationFn: async (content: string) => {
      const { error, data } = await supabase
        .from("comments")
        .insert({
          post_id: post.id,
          user_id: currentUserId,
          content,
        })
        .select("id, content, created_at, profiles:user_id(username, avatar_url)")
        .single();

      if (error) throw error;
      return data as CommentWithAuthor;
    },
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: ["comments", post.id] });
      const previous = queryClient.getQueryData<CommentWithAuthor[]>(["comments", post.id]) ?? commentPreview;
      const optimistic: CommentWithAuthor = {
        id: `optimistic-${Date.now()}`,
        post_id: post.id,
        content,
        created_at: new Date().toISOString(),
        profiles: {
          username: profile.username,
          avatar_url: profile.avatar_url,
        },
      };
      queryClient.setQueryData<CommentWithAuthor[]>(["comments", post.id], [...previous, optimistic]);
      setLocalCommentCount((count) => count + 1);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData<CommentWithAuthor[]>(["comments", post.id], context.previous);
        setLocalCommentCount(context.previous.length);
      }
    },
    onSuccess: (newComment) => {
      let nextLength = 0;
      queryClient.setQueryData<CommentWithAuthor[]>(["comments", post.id], (prev = []) => {
        const next = prev.map((comment) =>
          comment.id.startsWith("optimistic") ? newComment : comment
        );
        nextLength = next.length;
        return next;
      });
      setLocalCommentCount(nextLength);
    },
  });

  async function handleToggleComments() {
    setIsCommenting((prev) => {
      const next = !prev;
      if (!prev) {
        void refetch();
      }
      return next;
    });
  }

  async function handleShare() {
    const shareData = {
      title: `${profile.full_name ?? profile.username} on Petgram`,
      text: post.caption ?? "Check out this adorable moment on Petgram!",
      url: `${window.location.origin}/app/post/${post.id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copied to clipboard");
      }
    } catch (error) {
      console.warn(error);
    }
  }

  return (
    <article
      className="group relative overflow-hidden rounded-4xl border border-cream-200 bg-white/80 p-5 shadow-xl shadow-forest-900/10 transition hover:-translate-y-1 hover:shadow-forest-900/20"
      aria-labelledby={`post-${post.id}`}
    >
      <header className="mb-4 flex items-center gap-3">
        <Link
          href={`/app/profile/${profile.username}`}
          className="relative h-12 w-12 overflow-hidden rounded-2xl bg-sand-100"
        >
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt={profile.username} fill className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xl">🐾</span>
          )}
        </Link>
        <div>
          <Link
            href={`/app/profile/${profile.username}`}
            className="text-sm font-semibold text-forest-900 hover:text-accent-500"
          >
            {profile.full_name ?? profile.username}
          </Link>
          <p className="text-xs text-ink-500">@{profile.username} • {createdAt}</p>
        </div>
      </header>
      <figure
        className="relative overflow-hidden rounded-3xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {post.media_type === "image" ? (
          <Image
            ref={mediaRef as unknown as React.RefObject<HTMLImageElement>}
            src={post.media_url}
            alt={post.caption ?? "Petgram post"}
            width={800}
            height={1000}
            className="h-auto w-full object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={post.media_url}
            poster={post.thumbnail_url ?? undefined}
            muted
            controls={isHovered}
            autoPlay
            loop
            playsInline
            className="h-full w-full rounded-3xl"
          />
        )}
      </figure>
      {post.caption && (
        <p id={`post-${post.id}`} className="mt-4 text-sm text-ink-700">
          {post.caption}
        </p>
      )}
      {post.tags && post.tags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-moss-500">
          {post.tags.map((tag) => (
            <li key={tag} className="rounded-full bg-sand-100 px-3 py-1">
              #{tag}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm font-semibold text-ink-600">
          <button
            type="button"
            onClick={() => likeMutation.mutate()}
            className={clsx(
              "focus-ring inline-flex items-center gap-1 rounded-full border border-transparent bg-cream-200 px-3 py-2 transition hover:border-accent-500 hover:text-accent-500",
              userHasLiked && "border-accent-500 text-accent-500"
            )}
          >
            <Heart
              className={clsx(
                "h-4 w-4",
                userHasLiked ? "fill-current text-accent-500" : "text-ink-500"
              )}
              aria-hidden
            />
            {localLikeCount}
          </button>
          <button
            type="button"
            onClick={handleToggleComments}
            className="focus-ring inline-flex items-center gap-1 rounded-full border border-transparent bg-cream-200 px-3 py-2 text-ink-600 transition hover:border-moss-300 hover:text-moss-500"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            {localCommentCount}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="focus-ring inline-flex items-center gap-1 rounded-full border border-transparent bg-cream-200 px-3 py-2 text-ink-600 transition hover:border-forest-900 hover:text-forest-900"
          >
            <Share2 className="h-4 w-4" aria-hidden />
            Share
          </button>
        </div>
        <button
          type="button"
          className="focus-ring inline-flex items-center gap-2 rounded-full border border-cream-200 bg-white px-3 py-2 text-xs font-semibold text-ink-500 transition hover:border-forest-900 hover:text-forest-900"
        >
          <Bookmark className="h-4 w-4" aria-hidden />
          Save
        </button>
      </div>

      {isCommenting && (
        <div className="mt-5 space-y-4">
          <form
            className="flex items-center gap-3 rounded-3xl border border-cream-200 bg-white px-4 py-2"
            onSubmit={async (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const content = String(formData.get("comment") ?? "").trim();
              if (!content) return;
              await commentMutation.mutateAsync(content);
              event.currentTarget.reset();
            }}
          >
            <input
              type="text"
              name="comment"
              placeholder="Share something kind"
              className="focus-ring flex-1 border-none bg-transparent text-sm text-ink-700 placeholder:text-ink-400 focus:outline-none"
            />
            <button
              type="submit"
              className="focus-ring inline-flex items-center gap-1 rounded-full bg-moss-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-moss-300"
            >
              <SendHorizonal className="h-4 w-4" aria-hidden />
              Send
            </button>
          </form>
          <div className="space-y-3"
            aria-live="polite"
          >
            {isLoadingComments && (
              <div className="flex items-center gap-2 text-xs text-ink-500">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading comments...
              </div>
            )}
            {(commentsData ?? []).map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="relative h-9 w-9 overflow-hidden rounded-2xl bg-sand-100">
                  {comment.profiles?.avatar_url ? (
                    <Image
                      src={comment.profiles.avatar_url}
                      alt={comment.profiles.username}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-lg">🐾</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col rounded-2xl bg-cream-50 px-3 py-2">
                  <span className="text-xs font-semibold text-forest-900">
                    @{comment.profiles?.username ?? "petlover"}
                  </span>
                  <p className="text-sm text-ink-700">{comment.content}</p>
                </div>
              </div>
            ))}
            {commentsData && commentsData.length === 0 && (
              <p className="text-xs text-ink-500">Be the first to leave a comment.</p>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const delta = date.getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const seconds = Math.round(delta / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const weeks = Math.round(days / 7);

  if (Math.abs(seconds) < 60) return rtf.format(Math.round(seconds), "second");
  if (Math.abs(minutes) < 60) return rtf.format(Math.round(minutes), "minute");
  if (Math.abs(hours) < 24) return rtf.format(Math.round(hours), "hour");
  if (Math.abs(days) < 7) return rtf.format(Math.round(days), "day");
  return rtf.format(Math.round(weeks), "week");
}
