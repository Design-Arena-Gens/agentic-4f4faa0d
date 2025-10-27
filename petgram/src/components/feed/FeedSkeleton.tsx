export function FeedSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-4xl border border-cream-200 bg-white/70 p-6 shadow-xl shadow-forest-900/5"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-sand-100" />
            <div className="space-y-2">
              <div className="h-3 w-24 rounded-full bg-sand-100" />
              <div className="h-2.5 w-32 rounded-full bg-sand-100" />
            </div>
          </div>
          <div className="mt-6 h-72 rounded-3xl bg-sand-100" />
          <div className="mt-6 h-2.5 w-2/3 rounded-full bg-sand-100" />
          <div className="mt-3 flex gap-2">
            <div className="h-8 w-20 rounded-full bg-sand-100" />
            <div className="h-8 w-20 rounded-full bg-sand-100" />
            <div className="h-8 w-20 rounded-full bg-sand-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
