"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { Loader2, UploadCloud, XCircle, Tag, AtSign } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { compressImage, compressVideo } from "@/utils/media";
import { useDebounce } from "@/hooks/useDebounce";

interface SelectedMedia {
  file: File;
  preview: string;
  type: "image" | "video";
}

export function UploadForm() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia | null>(null);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [taggedAccounts, setTaggedAccounts] = useState<string[]>([]);
  const [accountQuery, setAccountQuery] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const debouncedAccountQuery = useDebounce(accountQuery, 300);

  const {
    data: accountSuggestions,
    isLoading: isSearchingAccounts,
  } = useQuery({
    queryKey: ["account-search", debouncedAccountQuery],
    enabled: debouncedAccountQuery.length > 1,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .ilike("username", `%${debouncedAccountQuery}%`)
        .limit(8);
      if (error) throw error;
      return data?.map((profile) => profile.username) ?? [];
    },
  });

  useEffect(() => {
    return () => {
      if (selectedMedia?.preview) {
        URL.revokeObjectURL(selectedMedia.preview);
      }
    };
  }, [selectedMedia]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const type = file.type.startsWith("video") ? "video" : "image";
    setFeedback("Compressing media for a speedy upload…");

    const compressed =
      type === "image" ? await compressImage(file) : await compressVideo(file);

    const previewUrl = URL.createObjectURL(compressed);
    setSelectedMedia({ file: compressed, preview: previewUrl, type });
    setFeedback(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp"],
      "video/*": [".mp4", ".mov", ".webm"],
    },
    maxFiles: 1,
  });

  const addTag = () => {
    if (!tagInput.trim()) return;
    setTags((prev) => Array.from(new Set([...prev, cleanTag(tagInput)])));
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((item) => item !== tag));
  };

  const addTaggedAccount = (handle: string) => {
    setTaggedAccounts((prev) =>
      prev.includes(handle) ? prev : [...prev, handle.replace(/^@/, "")]
    );
    setAccountQuery("");
  };

  const removeTaggedAccount = (handle: string) => {
    setTaggedAccounts((prev) => prev.filter((item) => item !== handle));
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        throw new Error("You must be signed in to upload.");
      }
      if (!selectedMedia) {
        throw new Error("Select a photo or video to upload.");
      }

      setFeedback("Uploading to Petgram…");

      const filePath = `posts/${user.id}/${Date.now()}-${selectedMedia.file.name}`;
      const storage = supabase.storage.from("pet-media");
      const { error: uploadError } = await storage.upload(filePath, selectedMedia.file, {
        upsert: false,
        contentType: selectedMedia.file.type,
      });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = storage.getPublicUrl(filePath);

      const { error: postError, data: postData } = await supabase
        .from("posts")
        .insert({
          author_id: user.id,
          caption,
          media_url: publicUrl,
          media_type: selectedMedia.type,
          tags,
        })
        .select("id")
        .single();

      if (postError) throw postError;

      if (taggedAccounts.length > 0) {
        const { data: mentionedProfiles } = await supabase
          .from("profiles")
          .select("id, username")
          .in(
            "username",
            taggedAccounts.map((handle) => handle.replace(/^@/, ""))
          );

        const notifications = (mentionedProfiles ?? []).map((profile) => ({
          user_id: profile.id,
          type: "comment" as const,
          data: {
            message: `${user.user_metadata?.username ?? "A fellow petlover"} mentioned you in a post`,
            post_id: postData?.id,
          },
          is_read: false,
        }));

        if (notifications.length > 0) {
          await supabase.from("notifications").insert(notifications);
        }
      }

      setFeedback("Upload complete! Your followers will love this.");
      return postData?.id;
    },
    onSuccess: () => {
      setCaption("");
      setTags([]);
      setTaggedAccounts([]);
      setSelectedMedia(null);
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (error: Error) => {
      setFeedback(error.message);
    },
    onSettled: () => {
      setTimeout(() => setFeedback(null), 4000);
    },
  });

  return (
    <div className="grid gap-8 rounded-4xl border border-cream-200 bg-white/80 p-8 shadow-xl shadow-forest-900/10 lg:grid-cols-[minmax(320px,380px),1fr]">
      <div
        {...getRootProps({
          className: `flex h-full min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-6 text-center transition ${
            isDragActive ? "border-moss-500 bg-moss-500/10" : "border-forest-900/15"
          }`,
        })}
      >
        <input {...getInputProps()} aria-label="Upload media" />
        {selectedMedia ? (
          <div className="flex w-full flex-col items-center gap-4">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-cream-50">
              {selectedMedia.type === "image" ? (
                <Image
                  src={selectedMedia.preview}
                  alt="Selected media preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <video
                  src={selectedMedia.preview}
                  className="h-full w-full object-cover"
                  muted
                  autoPlay
                  loop
                  controls
                />
              )}
            </div>
            <button
              type="button"
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-cream-200 px-4 py-2 text-xs font-semibold text-ink-500 transition hover:border-red-400 hover:text-red-500"
              onClick={() => setSelectedMedia(null)}
            >
              <XCircle className="h-4 w-4" aria-hidden />
              Remove media
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-ink-600">
            <UploadCloud className="mx-auto h-12 w-12 text-moss-500" aria-hidden />
            <div className="space-y-2">
              <p className="text-base font-semibold text-forest-900">
                Drag & drop or click to upload
              </p>
              <p className="text-sm">
                Share up to 120 MB photos or videos. We&apos;ll automatically optimize them for fast viewing.
              </p>
            </div>
          </div>
        )}
      </div>

      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          uploadMutation.mutate();
        }}
      >
        <div className="space-y-3">
          <label htmlFor="caption" className="text-sm font-medium text-forest-900">
            Caption
          </label>
          <textarea
            id="caption"
            name="caption"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            rows={4}
            placeholder="Describe this heartwarming animal moment."
            className="focus-ring w-full rounded-3xl border border-cream-200 bg-white px-4 py-3 text-sm text-ink-700 shadow-sm placeholder:text-ink-400"
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-forest-900" htmlFor="tag-input">
            Tags
          </label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                id="tag-input"
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                placeholder="Add descriptive tags (e.g. agility, adoption-day)"
                className="focus-ring w-full rounded-3xl border border-cream-200 bg-white px-4 py-3 text-sm text-ink-700 shadow-sm"
              />
              <Tag className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
            </div>
            <button
              type="button"
              className="focus-ring inline-flex items-center justify-center rounded-full bg-accent-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-accent-600"
              onClick={addTag}
            >
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <ul className="flex flex-wrap gap-2 text-xs font-semibold text-moss-600">
              {tags.map((tag) => (
                <li key={tag} className="inline-flex items-center gap-2 rounded-full bg-sand-100 px-3 py-1">
                  <span>#{tag}</span>
                  <button
                    type="button"
                    aria-label={`Remove #${tag}`}
                    onClick={() => removeTag(tag)}
                    className="text-ink-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-forest-900" htmlFor="account-query">
            Tag animal accounts
          </label>
          <div className="relative">
            <input
              id="account-query"
              value={accountQuery}
              onChange={(event) => setAccountQuery(event.target.value)}
              placeholder="Start typing @username"
              className="focus-ring w-full rounded-3xl border border-cream-200 bg-white px-4 py-3 text-sm text-ink-700 shadow-sm"
            />
            <AtSign className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
          </div>
          {isSearchingAccounts && (
            <div className="flex items-center gap-2 text-xs text-ink-500">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Looking up profiles…
            </div>
          )}
          {accountSuggestions && accountSuggestions.length > 0 && (
            <ul className="flex flex-wrap gap-2 text-xs text-ink-600">
              {accountSuggestions.map((handle) => (
                <li key={handle}>
                  <button
                    type="button"
                    onClick={() => addTaggedAccount(handle)}
                    className="focus-ring inline-flex items-center gap-1 rounded-full bg-sand-100 px-3 py-1 font-semibold text-moss-600 transition hover:bg-moss-500/15"
                  >
                    @{handle}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {taggedAccounts.length > 0 && (
            <ul className="flex flex-wrap gap-2 text-xs font-semibold text-moss-600">
              {taggedAccounts.map((handle) => (
                <li key={handle} className="inline-flex items-center gap-2 rounded-full bg-cream-50 px-3 py-1">
                  <span>@{handle}</span>
                  <button
                    type="button"
                    aria-label={`Remove @${handle}`}
                    onClick={() => removeTaggedAccount(handle)}
                    className="text-ink-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          disabled={uploadMutation.isPending || !selectedMedia}
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-moss-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-moss-500/30 transition hover:bg-moss-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {uploadMutation.isPending && <Loader2 className="h-5 w-5 animate-spin" aria-hidden />}
          Publish to feed
        </button>

        {feedback && <p className="text-sm font-medium text-ink-600">{feedback}</p>}
      </form>
    </div>
  );
}

function cleanTag(value: string) {
  return value
    .replace(/^[#@]+/, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
}
