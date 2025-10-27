import Image from "next/image";
import Link from "next/link";
import { MapPin, Globe2, PawPrint } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { FollowButton } from "@/components/profile/FollowButton";

interface ProfileHeaderProps {
  profile: Tables<"profiles">;
  followerCount: number;
  followingCount: number;
  isOwner: boolean;
  isFollowing: boolean;
}

export function ProfileHeader({
  profile,
  followerCount,
  followingCount,
  isOwner,
  isFollowing,
}: ProfileHeaderProps) {
  return (
    <div className="grid gap-6 rounded-4xl bg-white/80 px-6 py-8 shadow-xl shadow-forest-900/10 lg:grid-cols-[240px,1fr]">
      <div className="flex flex-col items-center gap-4 text-center lg:text-left">
        <div className="relative h-44 w-44 overflow-hidden rounded-4xl border-4 border-cream-100 bg-sand-100 shadow-lg">
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt={profile.username} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl">🐾</div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-forest-900">
            {profile.full_name ?? profile.username}
          </h1>
          <p className="text-sm text-ink-500">@{profile.username}</p>
        </div>
        {isOwner ? (
          <Link
            href="/app/edit-profile"
            className="focus-ring inline-flex items-center justify-center rounded-full border border-cream-200 px-4 py-2 text-sm font-semibold text-ink-600 transition hover:border-accent-500 hover:text-accent-500"
          >
            Edit profile
          </Link>
        ) : (
          <FollowButton profileId={profile.id} initialFollowing={isFollowing} />
        )}
      </div>
      <div className="space-y-6">
        <div className="flex flex-wrap gap-4 text-sm font-semibold text-ink-600">
          <div className="rounded-2xl bg-cream-100 px-4 py-2">
            <span className="text-forest-900">{followerCount.toLocaleString()}</span> followers
          </div>
          <div className="rounded-2xl bg-cream-100 px-4 py-2">
            <span className="text-forest-900">{followingCount.toLocaleString()}</span> following
          </div>
          <div className="rounded-2xl bg-cream-100 px-4 py-2">
            <span className="text-forest-900">{profile.species ?? "Animal"}</span>
          </div>
          {profile.breed && (
            <div className="rounded-2xl bg-cream-100 px-4 py-2 text-forest-900">{profile.breed}</div>
          )}
        </div>
        {profile.bio && <p className="text-sm leading-relaxed text-ink-700">{profile.bio}</p>}
        <ul className="flex flex-wrap items-center gap-4 text-xs text-ink-500">
          {profile.location && (
            <li className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-moss-500" aria-hidden />
              {profile.location}
            </li>
          )}
          {profile.website && (
            <li className="inline-flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-moss-500" aria-hidden />
              <a href={profile.website} className="focus-ring text-moss-500 hover:text-accent-500" target="_blank" rel="noreferrer">
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
            </li>
          )}
        </ul>
        <div className="flex items-center gap-2 rounded-3xl bg-cream-50 px-4 py-3 text-xs font-medium text-ink-500">
          <PawPrint className="h-4 w-4 text-accent-500" aria-hidden />
          Joined Petgram on {new Date(profile.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
