import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { EditProfileForm } from "@/components/profile/EditProfileForm";

export default async function EditProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  return (
    <section className="space-y-8">
      <header className="rounded-4xl bg-white/80 px-6 py-8 shadow-xl shadow-forest-900/10">
        <h1 className="text-3xl font-semibold text-forest-900">Edit profile</h1>
        <p className="mt-2 text-sm text-ink-600">
          Update your animal&apos;s story, visuals, and contact details.
        </p>
      </header>
      <EditProfileForm profile={profile} />
    </section>
  );
}
