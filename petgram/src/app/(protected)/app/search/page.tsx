import { SearchExperience } from "@/components/search/SearchExperience";

export default function SearchPage() {
  return (
    <section className="space-y-8">
      <header className="rounded-4xl bg-white/80 px-6 py-8 shadow-xl shadow-forest-900/10">
        <h1 className="text-3xl font-semibold text-forest-900">Discover animals & caretakers</h1>
        <p className="mt-2 text-sm text-ink-600">
          Search by breed, location, species, or keywords to build your dream pet community.
        </p>
      </header>
      <SearchExperience />
    </section>
  );
}
