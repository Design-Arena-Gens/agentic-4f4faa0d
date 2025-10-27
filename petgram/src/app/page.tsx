import Image from "next/image";
import Link from "next/link";
import { PawPrint, Sparkles } from "lucide-react";

const heroMedia = {
  video:
    "https://videos.pexels.com/video-files/4148872/4148872-uhd_2560_1440_25fps.mp4",
  poster:
    "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?auto=format&fit=crop&w=1600&q=80",
};

const highlightImages = [
  "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1525253013412-55f8bed1cfb4?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1563460716037-460a3ad24ba9?auto=format&fit=crop&w=800&q=80",
];

export default function Home() {
  return (
    <div className="bg-cream-50 text-ink-900">
      <header className="relative isolate overflow-hidden">
        <div className="absolute inset-0 hero-gradient" aria-hidden="true" />
        <div className="absolute inset-0 opacity-40">
          <video
            className="h-full w-full object-cover"
            src={heroMedia.video}
            poster={heroMedia.poster}
            autoPlay
            muted
            loop
            playsInline
            aria-label="Playful pets running and playing together"
          />
        </div>
        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col gap-12 px-6 py-24 lg:flex-row lg:items-center lg:gap-16 lg:px-12">
          <div className="space-y-8 backdrop-blur-sm bg-cream-50/80 p-8 rounded-3xl shadow-xl shadow-forest-900/5 lg:max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-sand-100 px-4 py-2 text-sm font-medium text-moss-500">
              <Sparkles className="h-4 w-4" aria-hidden />
              Pet stories that warm every heart
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-forest-900 sm:text-5xl">
              Welcome to Petgram — the joyful social feed made just for animals.
            </h1>
            <p className="text-lg text-ink-700">
              Share vibrant photos, loop-worthy videos, and behind-the-scenes moments of the
              animals you adore. Follow other caretakers, build community, and celebrate every
              wag, whisker, and wing.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/sign-up"
                className="focus-ring inline-flex items-center justify-center rounded-full bg-accent-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-accent-500/30 transition hover:bg-accent-600"
              >
                Join Petgram
              </Link>
              <Link
                href="/sign-in"
                className="focus-ring inline-flex items-center justify-center rounded-full border border-forest-900/15 bg-white px-6 py-3 text-base font-semibold text-forest-900 transition hover:border-accent-500 hover:text-accent-500"
              >
                Log In
              </Link>
              <Link
                href="#features"
                className="focus-ring inline-flex items-center justify-center rounded-full bg-transparent px-6 py-3 text-base font-semibold text-forest-900 transition hover:text-accent-500"
              >
                Learn More
              </Link>
            </div>
            <dl className="grid grid-cols-2 gap-6 text-sm text-ink-500 sm:grid-cols-4">
              <div>
                <dt className="font-semibold text-ink-700">Certified rescues</dt>
                <dd className="mt-1 text-2xl font-bold text-forest-900">650+</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink-700">Daily posts</dt>
                <dd className="mt-1 text-2xl font-bold text-forest-900">12k</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink-700">Countries</dt>
                <dd className="mt-1 text-2xl font-bold text-forest-900">45</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink-700">Happy pets</dt>
                <dd className="mt-1 text-2xl font-bold text-forest-900">∞</dd>
              </div>
            </dl>
          </div>
          <div className="relative w-full max-w-3xl overflow-hidden rounded-4xl border border-white/40 bg-white/70 p-4 shadow-2xl shadow-forest-900/20">
            <div className="grid grid-cols-2 gap-4">
              {highlightImages.map((src, index) => (
                <figure
                  key={src}
                  className={`relative aspect-[4/5] overflow-hidden rounded-3xl shadow-lg shadow-forest-900/10 ${
                    index % 2 === 0 ? "translate-y-6" : "-translate-y-6"
                  } transition-transform duration-500 hover:translate-y-0`}
                >
                  <Image
                    src={src}
                    alt="Playful animal on Petgram"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </figure>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-cream-50/80 px-4 py-3 text-sm text-ink-700">
              <PawPrint className="h-5 w-5 text-accent-500" aria-hidden />
              <span>
                Built for rescues, veterinary clinics, breeders, sanctuaries, and the humans who
                adore them.
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-24 px-6 py-24" id="features">
        <section className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold text-forest-900 sm:text-4xl">
              A playful yet professional toolkit for animal-first storytelling
            </h2>
            <p className="text-lg text-ink-700">
              Petgram pairs enterprise-grade Supabase authentication with intuitive creative tools so
              animal care teams and pet parents can publish within seconds.
            </p>
            <ul className="space-y-4 text-base text-ink-700">
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-moss-300/30 text-moss-500">
                  •
                </span>
                Secure Supabase-powered accounts with fast registration, password recovery, and multi-device support.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-moss-300/30 text-moss-500">
                  •
                </span>
                Upload HD photos or videos with drag-and-drop, smart compression, and tagging for every furry friend.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-moss-300/30 text-moss-500">
                  •
                </span>
                Grow community with likes, comments, shares, direct mentions, and real-time notifications.
              </li>
            </ul>
            <div className="flex flex-wrap gap-4 pt-4 text-sm font-medium">
              <span className="rounded-full bg-white px-4 py-2 shadow-sm shadow-forest-900/5">
                Masonry feed layout
              </span>
              <span className="rounded-full bg-white px-4 py-2 shadow-sm shadow-forest-900/5">
                Accessibility-first design
              </span>
              <span className="rounded-full bg-white px-4 py-2 shadow-sm shadow-forest-900/5">
                Mobile-ready navigation
              </span>
            </div>
          </div>
          <div className="grid gap-6 rounded-4xl bg-white/70 p-6 shadow-xl shadow-forest-900/15">
            <article className="rounded-3xl border border-cream-200 bg-cream-50 p-6">
              <h3 className="text-lg font-semibold text-forest-900">For shelters</h3>
              <p className="mt-2 text-sm text-ink-700">
                Showcase adoptable friends, schedule content drops, and manage volunteer access from a
                single workspace.
              </p>
            </article>
            <article className="rounded-3xl border border-cream-200 bg-cream-50 p-6">
              <h3 className="text-lg font-semibold text-forest-900">For clinics</h3>
              <p className="mt-2 text-sm text-ink-700">
                Share recovery stories, highlight wellness tips, and keep clients in the loop with
                personalized notifications.
              </p>
            </article>
            <article className="rounded-3xl border border-cream-200 bg-cream-50 p-6">
              <h3 className="text-lg font-semibold text-forest-900">For pet parents</h3>
              <p className="mt-2 text-sm text-ink-700">
                Chronicle milestones, team up with trainers, and find play pals nearby through rich
                location and breed search tools.
              </p>
            </article>
          </div>
        </section>

        <section className="grid gap-10 rounded-4xl border border-cream-200 bg-white/80 p-10 shadow-xl shadow-forest-900/10 lg:grid-cols-[1.2fr,1fr]">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-forest-900">Built for every screen</h2>
            <p className="text-lg text-ink-700">
              Mobile-first layouts, tactile interactions, and high-contrast components ensure Petgram
              feels right at home on phones, tablets, and desktops.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-cream-200 bg-cream-50 p-5">
                <h3 className="text-base font-semibold text-forest-900">Inclusive by design</h3>
                <p className="mt-2 text-sm text-ink-700">
                  Semantic HTML, ARIA roles, and keyboard navigation ensure everyone can celebrate
                  their companions.
                </p>
              </div>
              <div className="rounded-3xl border border-cream-200 bg-cream-50 p-5">
                <h3 className="text-base font-semibold text-forest-900">Performance obsessed</h3>
                <p className="mt-2 text-sm text-ink-700">
                  Intelligent media compression keeps the feed quick without sacrificing cuddly detail.
                </p>
              </div>
            </div>
          </div>
          <div className="relative aspect-[3/4] overflow-hidden rounded-4xl bg-forest-900/5">
            <Image
              src="https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80"
              alt="Preview of the Petgram mobile interface"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 80vw, 30vw"
            />
          </div>
        </section>
      </main>

      <footer className="bg-forest-900 text-cream-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold">Ready to see your animal community thrive?</p>
            <p className="mt-1 text-sm text-cream-200">
              Launch your Petgram hub today and invite caretakers, clients, and fans in seconds.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className="focus-ring inline-flex items-center justify-center rounded-full bg-accent-500 px-6 py-3 text-base font-semibold text-white transition hover:bg-accent-600"
            >
              Get Started
            </Link>
            <Link
              href="/sign-in"
              className="focus-ring inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-base font-semibold text-white transition hover:border-white"
            >
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
