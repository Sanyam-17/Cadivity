/* Courses page skeleton loader — shown by Next.js App Router while data fetches */
export default function CoursesLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background animate-pulse">
      {/* Hero skeleton */}
      <div className="bg-slate-900 py-20">
        <div className="container mx-auto px-4 max-w-3xl space-y-4">
          <div className="h-4 w-32 bg-slate-700 rounded" />
          <div className="h-12 w-2/3 bg-slate-700 rounded" />
          <div className="h-6 w-full max-w-lg bg-slate-700 rounded" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="py-20 bg-white container mx-auto px-4">
        <div className="h-8 w-56 bg-slate-200 rounded mx-auto mb-4" />
        <div className="h-4 w-80 bg-slate-100 rounded mx-auto mb-10" />

        {/* Search bar skeleton */}
        <div className="flex gap-3 mb-8 max-w-lg">
          <div className="h-10 flex-1 bg-slate-100 rounded-lg" />
          <div className="h-10 w-28 bg-slate-100 rounded-lg" />
          <div className="h-10 w-28 bg-slate-100 rounded-lg" />
        </div>

        {/* Card grid skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 h-40 w-full" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="h-4 bg-slate-100 rounded w-5/6" />
                <div className="h-10 bg-slate-200 rounded-lg mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
