"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PawPrint, MapPin, Search, Bone, Sparkles } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useDebounce } from "@/hooks/useDebounce";
import type { Tables } from "@/lib/database.types";

interface Filters {
  query: string;
  species: string;
  breed: string;
  location: string;
}

interface ProfileResult extends Tables<"profiles"> {
  is_following?: boolean;
  followers_count?: number;
}

const speciesOptions = ["Dog", "Cat", "Bird", "Reptile", "Small Mammal", "Farm", "Exotic"];

export function SearchExperience() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<Filters>({ query: "", species: "", breed: "", location: "" });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const debouncedFilters = useDebounce(filters, 350);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });
  }, [supabase]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["search", debouncedFilters, currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [] as ProfileResult[];

      let builder = supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, bio, species, breed, location")
        .order("full_name", { ascending: true })
        .limit(40);

      builder = builder.neq("id", currentUserId);

      const searchClauses: string[] = [];

      if (debouncedFilters.query) {
        const term = debouncedFilters.query.trim();
        searchClauses.push(
          `username.ilike.%${term}%`,
          `full_name.ilike.%${term}%`,
          `bio.ilike.%${term}%`
        );
      }

      if (searchClauses.length > 0) {
        builder = builder.or(searchClauses.join(","));
      }

      if (debouncedFilters.species) {
        builder = builder.ilike("species", `%${debouncedFilters.species}%`);
      }
      if (debouncedFilters.breed) {
        builder = builder.ilike("breed", `%${debouncedFilters.breed}%`);
      }
      if (debouncedFilters.location) {
        builder = builder.ilike("location", `%${debouncedFilters.location}%`);
      }

      const { data: profiles, error } = await builder;
      if (error) throw error;

      if (!profiles || profiles.length === 0) return [] as ProfileResult[];

      const ids = profiles.map((profile) => profile.id);
      const [{ data: followerCounts }, { data: following }] = await Promise.all([
        supabase
          .from("followers")
          .select("followed_id")
          .in("followed_id", ids),
        supabase
          .from("followers")
          .select("followed_id")
          .eq("follower_id", currentUserId)
          .in("followed_id", ids),
      ]);

      const countMap = new Map<string, number>();
      followerCounts?.forEach((record) => {
        countMap.set(record.followed_id, (countMap.get(record.followed_id) ?? 0) + 1);
      });

      const followingSet = new Set(following?.map((item) => item.followed_id));

      return profiles.map((profile) => ({
        ...profile,
        followers_count: countMap.get(profile.id) ?? 0,
        is_following: followingSet.has(profile.id),
      }));
    },
    enabled: currentUserId !== null,
  });

  const followMutation = useMutation({
    mutationFn: async ({
      profileId,
      isFollowing,
    }: {
      profileId: string;
      isFollowing: boolean;
    }) => {
      if (!currentUserId) return isFollowing;
      if (isFollowing) {
        const { error } = await supabase
          .from("followers")
          .delete()
          .eq("followed_id", profileId)
          .eq("follower_id", currentUserId);
        if (error) throw error;
        return false;
      }
      const { error } = await supabase
        .from("followers")
        .insert({ followed_id: profileId, follower_id: currentUserId });
      if (error) throw error;
      return true;
    },
    onMutate: async ({ profileId, isFollowing }) => {
      await queryClient.cancelQueries({ queryKey: ["search", debouncedFilters, currentUserId] });
      const previous = queryClient.getQueryData<ProfileResult[]>(["search", debouncedFilters, currentUserId]);
      queryClient.setQueryData<ProfileResult[]>(["search", debouncedFilters, currentUserId], (prev = []) =>
        prev.map((profile) =>
          profile.id === profileId
            ? {
                ...profile,
                is_following: !isFollowing,
                followers_count: (profile.followers_count ?? 0) + (isFollowing ? -1 : 1),
              }
            : profile
        )
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["search", debouncedFilters, currentUserId], context.previous);
      }
    },
  });

  const results = data ?? [];

  return (
    <div className="grid gap-8 rounded-4xl border border-cream-200 bg-white/80 p-8 shadow-xl shadow-forest-900/10 lg:grid-cols-[320px,1fr]">
      <form className="space-y-5" aria-label="Search animals">
        <label className="block text-sm font-medium text-forest-900" htmlFor="query">
          Keyword search
        </label>
        <div className="relative">
          <input
            id="query"
            name="query"
            value={filters.query}
            onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
            placeholder="Search by name, rescue, or story"
            className="focus-ring w-full rounded-3xl border border-cream-200 bg-white px-5 py-3 text-sm text-ink-700 shadow-sm placeholder:text-ink-400"
          />
          <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
        </div>

        <fieldset className="space-y-4">
          <legend className="text-sm font-medium text-forest-900">Species</legend>
          <div className="grid grid-cols-2 gap-3">
            {speciesOptions.map((option) => {
              const isActive = filters.species === option;
              return (
                <button
                  type="button"
                  key={option}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      species: prev.species === option ? "" : option,
                    }))
                  }
                  className={`focus-ring inline-flex items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "border-moss-500 bg-moss-500/15 text-moss-600"
                      : "border-cream-200 bg-cream-50 text-ink-500 hover:border-forest-900/30 hover:text-forest-900"
                  }`}
                  aria-pressed={isActive}
                >
                  <PawPrint className="h-4 w-4" aria-hidden /> {option}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="space-y-4">
          <label htmlFor="breed" className="block text-sm font-medium text-forest-900">
            Breed or type
          </label>
          <div className="relative">
            <input
              id="breed"
              name="breed"
              value={filters.breed}
              onChange={(event) => setFilters((prev) => ({ ...prev, breed: event.target.value }))}
              placeholder="e.g. Border Collie, Savannah cat"
              className="focus-ring w-full rounded-3xl border border-cream-200 bg-white px-5 py-3 text-sm text-ink-700 shadow-sm placeholder:text-ink-400"
            />
            <Bone className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
          </div>
        </div>

        <div className="space-y-4">
          <label htmlFor="location" className="block text-sm font-medium text-forest-900">
            Location
          </label>
          <div className="relative">
            <input
              id="location"
              name="location"
              value={filters.location}
              onChange={(event) => setFilters((prev) => ({ ...prev, location: event.target.value }))}
              placeholder="City, region, or country"
              className="focus-ring w-full rounded-3xl border border-cream-200 bg-white px-5 py-3 text-sm text-ink-700 shadow-sm placeholder:text-ink-400"
            />
            <MapPin className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
          </div>
        </div>
      </form>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-ink-500">
            {isLoading || isFetching ? "Searching the pet universe…" : `${results.length} profiles found`}
          </p>
          <button
            type="button"
            className="focus-ring rounded-full border border-cream-200 px-4 py-2 text-xs font-semibold text-ink-500 transition hover:border-accent-500 hover:text-accent-500"
            onClick={() => setFilters({ query: "", species: "", breed: "", location: "" })}
          >
            Clear filters
          </button>
        </div>

        <div className="grid gap-4">
          {results.length === 0 && !isLoading ? (
            <div className="rounded-3xl border border-dashed border-forest-900/20 bg-cream-50 px-6 py-16 text-center">
              <Sparkles className="mx-auto h-6 w-6 text-accent-500" aria-hidden />
              <p className="mt-4 text-sm text-ink-600">
                Try expanding your search with broader keywords or different filters.
              </p>
            </div>
          ) : (
            results.map((profile) => (
              <article
                key={profile.id}
                className="flex flex-col gap-4 rounded-3xl border border-cream-200 bg-white px-5 py-4 shadow-sm shadow-forest-900/5 sm:flex-row sm:items-center"
              >
                <Link
                  href={`/app/profile/${profile.username}`}
                  className="relative h-16 w-16 flex-none overflow-hidden rounded-3xl bg-sand-100"
                >
                  {profile.avatar_url ? (
                    <Image src={profile.avatar_url} alt={profile.username} fill className="object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-2xl">🐾</span>
                  )}
                </Link>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/app/profile/${profile.username}`}
                      className="text-base font-semibold text-forest-900 hover:text-accent-500"
                    >
                      {profile.full_name ?? profile.username}
                    </Link>
                    <span className="text-xs text-ink-500">@{profile.username}</span>
                  </div>
                  <p className="text-xs text-ink-500">
                    {profile.species ?? "Unknown species"}
                    {profile.breed ? ` • ${profile.breed}` : ""}
                    {profile.location ? ` • ${profile.location}` : ""}
                  </p>
                  {profile.bio && <p className="text-sm text-ink-600">{profile.bio}</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs font-semibold text-ink-500">
                    {(profile.followers_count ?? 0).toLocaleString()} followers
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      followMutation.mutate({
                        profileId: profile.id,
                        isFollowing: Boolean(profile.is_following),
                      })
                    }
                    className={`focus-ring inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold transition ${
                      profile.is_following
                        ? "border border-moss-500 bg-moss-500/20 text-moss-600"
                        : "bg-accent-500 text-white shadow shadow-accent-500/20 hover:bg-accent-600"
                    }`}
                    disabled={!currentUserId || followMutation.isPending}
                  >
                    {profile.is_following ? "Following" : "Follow"}
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
