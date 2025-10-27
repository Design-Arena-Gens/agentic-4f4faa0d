import { PostCard } from "./PostCard";
import type { FeedPost } from "@/app/(protected)/app/page";

interface LikeRecord {
  post_id: string;
  user_id: string;
}

interface CommentRecord {
  id: string;
  post_id: string;
}

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

interface MasonryFeedProps {
  posts: FeedPost[];
  likes: LikeRecord[];
  comments: CommentRecord[];
  commentPreviews: CommentPreview[];
  currentUserId: string;
}

export function MasonryFeed({
  posts,
  likes,
  comments,
  commentPreviews,
  currentUserId,
}: MasonryFeedProps) {
  const likeCount = new Map<string, number>();
  const commentCount = new Map<string, number>();
  const userLikes = new Set<string>();
  const previews = new Map<string, CommentPreview[]>();

  likes.forEach((like) => {
    likeCount.set(like.post_id, (likeCount.get(like.post_id) ?? 0) + 1);
    if (like.user_id === currentUserId) {
      userLikes.add(like.post_id);
    }
  });

  comments.forEach((comment) => {
    commentCount.set(comment.post_id, (commentCount.get(comment.post_id) ?? 0) + 1);
  });

  commentPreviews.forEach((comment) => {
    const list = previews.get(comment.post_id) ?? [];
    if (list.length < 2) {
      previews.set(comment.post_id, [...list, comment]);
    }
  });

  if (posts.length === 0) {
    return (
      <div className="rounded-4xl border border-dashed border-forest-900/20 bg-white/70 px-6 py-24 text-center shadow-inner">
        <p className="text-lg font-semibold text-forest-900">It&apos;s quiet… for now.</p>
        <p className="mt-2 text-sm text-ink-600">
          Follow a few more animal accounts or be the first to upload a playful moment.
        </p>
      </div>
    );
  }

  return (
    <div className="masonry columns-1 sm:columns-2 xl:columns-3">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          likeCount={likeCount.get(post.id) ?? 0}
          commentCount={commentCount.get(post.id) ?? 0}
          hasLiked={userLikes.has(post.id)}
          commentPreview={previews.get(post.id) ?? []}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
