import { UploadForm } from "@/components/upload/UploadForm";

export default function UploadPage() {
  return (
    <section className="space-y-8">
      <header className="rounded-4xl bg-white/80 px-6 py-8 shadow-xl shadow-forest-900/10">
        <h1 className="text-3xl font-semibold text-forest-900">Share a new moment</h1>
        <p className="mt-2 text-sm text-ink-600">
          Upload a photo or video, add a playful caption, and tag the animal friends who star in it.
        </p>
      </header>
      <UploadForm />
    </section>
  );
}
