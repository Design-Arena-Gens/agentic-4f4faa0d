"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, UploadCloud } from "lucide-react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import type { Tables } from "@/lib/database.types";

export function EditProfileForm({ profile }: { profile: Tables<"profiles"> | null }) {
  const supabase = useSupabase();
  const [formState, setFormState] = useState({
    full_name: profile?.full_name ?? "",
    bio: profile?.bio ?? "",
    species: profile?.species ?? "",
    breed: profile?.breed ?? "",
    location: profile?.location ?? "",
    website: profile?.website ?? "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setStatusMessage("You must be signed in to update your profile.");
      setIsSaving(false);
      return;
    }

    let avatarUrl = profile?.avatar_url ?? null;

    if (avatarFile) {
      const filePath = `avatars/${user.id}-${Date.now()}-${avatarFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("pet-media")
        .upload(filePath, avatarFile, { upsert: true, contentType: avatarFile.type });
      if (uploadError) {
        setStatusMessage(uploadError.message);
        setIsSaving(false);
        return;
      }
      const {
        data: { publicUrl },
      } = supabase.storage.from("pet-media").getPublicUrl(filePath);
      avatarUrl = publicUrl;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formState.full_name,
        bio: formState.bio,
        species: formState.species,
        breed: formState.breed,
        location: formState.location,
        website: formState.website,
        avatar_url: avatarUrl,
      })
      .eq("id", user.id);

    if (error) {
      setStatusMessage(error.message);
    } else {
      setStatusMessage("Profile updated successfully!");
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarFile(null);
      setAvatarPreview(null);
    }
    setIsSaving(false);
  }

  return (
    <form
      className="grid gap-8 rounded-4xl border border-cream-200 bg-white/80 px-6 py-8 shadow-xl shadow-forest-900/10 lg:grid-cols-[240px,1fr]"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-36 w-36 overflow-hidden rounded-3xl border border-cream-100 bg-sand-100">
          {avatarPreview ? (
            <Image src={avatarPreview} alt="Avatar preview" fill className="object-cover" />
          ) : profile?.avatar_url ? (
            <Image src={profile.avatar_url} alt={profile.username} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl">🐾</div>
          )}
        </div>
        <label className="focus-ring inline-flex items-center gap-2 rounded-full border border-cream-200 px-4 py-2 text-xs font-semibold text-ink-500 transition hover:border-moss-500 hover:text-moss-600">
          <UploadCloud className="h-4 w-4" aria-hidden />
          Update avatar
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                setAvatarFile(file);
                const preview = URL.createObjectURL(file);
                setAvatarPreview(preview);
              }
            }}
          />
        </label>
      </div>
      <div className="grid gap-5">
        <Field
          label="Display name"
          id="full_name"
          value={formState.full_name}
          onChange={(value) => setFormState((prev) => ({ ...prev, full_name: value }))}
        />
        <Field
          label="Bio"
          id="bio"
          value={formState.bio}
          multiline
          onChange={(value) => setFormState((prev) => ({ ...prev, bio: value }))}
          assistive="Share your mission, personality, and care essentials."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Species"
            id="species"
            value={formState.species}
            onChange={(value) => setFormState((prev) => ({ ...prev, species: value }))}
          />
          <Field
            label="Breed"
            id="breed"
            value={formState.breed}
            onChange={(value) => setFormState((prev) => ({ ...prev, breed: value }))}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Location"
            id="location"
            value={formState.location}
            onChange={(value) => setFormState((prev) => ({ ...prev, location: value }))}
          />
          <Field
            label="Website"
            id="website"
            value={formState.website}
            onChange={(value) => setFormState((prev) => ({ ...prev, website: value }))}
            assistive="Link to adoption forms, clinics, or official sites."
          />
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-accent-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-500/30 transition hover:bg-accent-600 disabled:opacity-60"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          Save changes
        </button>
        {statusMessage && <p className="text-sm text-ink-600">{statusMessage}</p>}
      </div>
    </form>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  assistive,
  multiline,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  assistive?: string;
  multiline?: boolean;
}) {
  return (
    <label htmlFor={id} className="block space-y-2 text-sm font-medium text-forest-900">
      <span>{label}</span>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className="focus-ring w-full rounded-3xl border border-cream-200 bg-white px-4 py-3 text-sm text-ink-700 shadow-sm"
        />
      ) : (
        <input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="focus-ring w-full rounded-3xl border border-cream-200 bg-white px-4 py-3 text-sm text-ink-700 shadow-sm"
        />
      )}
      {assistive && <p className="text-xs font-normal text-ink-500">{assistive}</p>}
    </label>
  );
}
