import Image from "next/image";
import Link from "next/link";

interface ProfilePostGridProps {
  posts: {
    id: string;
    media_url: string;
    media_type: "image" | "video";
    caption: string | null;
    thumbnail_url: string | null;
  }[];
}

export function ProfilePostGrid({ posts }: ProfilePostGridProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-4xl border border-dashed border-forest-900/15 bg-cream-50 px-6 py-20 text-center">
        <p className="text-sm text-ink-600">
          No posts yet. Share a photo or video to start your animal&apos;s Petgram story.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/app/post/${post.id}`}
          className="group relative aspect-square overflow-hidden rounded-3xl border border-cream-200 bg-white shadow-sm shadow-forest-900/10"
        >
          {post.media_type === "image" ? (
            <Image
              src={post.media_url}
              alt={post.caption ?? "Petgram post"}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <video
              src={post.media_url}
              poster={post.thumbnail_url ?? undefined}
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          )}
          {post.caption && (
            <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent p-3 text-xs text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              {post.caption}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
