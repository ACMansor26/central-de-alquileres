function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-[24px] bg-slate-200/80 ${className}`} />;
}

export default function RouteLoadingShell({
  variant,
}: {
  variant: "home" | "search" | "analysis";
}) {
  if (variant === "home") {
    return (
      <main className="min-h-screen bg-white">
        <section className="relative min-h-[65vh] px-4 pb-16 pt-20">
          <div className="absolute inset-0 bg-slate-900" />
          <div className="relative mx-auto mt-10 max-w-4xl text-center">
            <div className="animate-pulse">
              <div className="mx-auto h-12 w-72 rounded-2xl bg-white/15 md:h-16 md:w-[34rem]" />
              <div className="mx-auto mt-5 h-5 w-full max-w-xl rounded-full bg-white/10" />
              <div className="mx-auto mt-3 h-5 w-full max-w-lg rounded-full bg-white/10" />
            </div>
            <div className="mx-auto mt-10 max-w-4xl rounded-xl bg-white p-3 shadow-2xl">
              <SkeletonBlock className="h-16" />
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SkeletonBlock className="mb-8 h-20" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <SkeletonBlock className="h-[520px] border border-slate-200" />
              <SkeletonBlock className="h-[520px] border border-slate-200" />
              <SkeletonBlock className="h-[520px] border border-slate-200" />
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (variant === "search") {
    return (
      <main className="min-h-screen bg-slate-50 px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="mb-8 flex items-center justify-between">
              <SkeletonBlock className="h-8 w-36" />
              <SkeletonBlock className="h-16 w-32" />
            </div>
            <SkeletonBlock className="mb-10 h-20" />
            <div className="mb-6 flex justify-end">
              <SkeletonBlock className="h-12 w-44" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonBlock className="h-[520px] border border-slate-200" />
            <SkeletonBlock className="h-[520px] border border-slate-200" />
            <SkeletonBlock className="h-[520px] border border-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f8fc] px-4 pb-20 pt-28 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 overflow-hidden rounded-[34px] border border-slate-200/70 bg-white shadow-[0_30px_90px_-48px_rgba(15,23,42,0.55)]">
          <div className="bg-[linear-gradient(135deg,_rgba(15,23,42,0.96)_0%,_rgba(23,37,84,0.94)_55%,_rgba(29,78,216,0.9)_100%)] p-6 md:p-8">
            <div className="animate-pulse">
              <div className="h-4 w-28 rounded-full bg-white/20" />
              <div className="mt-6 h-11 w-72 rounded-2xl bg-white/20" />
              <div className="mt-4 h-4 w-full max-w-2xl rounded-full bg-white/15" />
              <div className="mt-3 h-4 w-full max-w-xl rounded-full bg-white/10" />
            </div>
          </div>

          <div className="grid gap-4 bg-white px-6 py-5 md:grid-cols-[1.25fr,0.75fr] md:px-8">
            <SkeletonBlock className="h-20" />
            <SkeletonBlock className="h-20" />
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <SkeletonBlock className="h-40 border border-slate-200" />
          <SkeletonBlock className="h-40 border border-slate-200" />
          <SkeletonBlock className="h-40 border border-slate-200" />
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SkeletonBlock className="h-36 border border-slate-200" />
          <SkeletonBlock className="h-36 border border-slate-200" />
          <SkeletonBlock className="h-36 border border-slate-200" />
          <SkeletonBlock className="h-36 border border-slate-200" />
        </section>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <SkeletonBlock className="h-[520px] border border-slate-200 lg:col-span-2" />
          <SkeletonBlock className="h-[360px] border border-slate-200" />
          <SkeletonBlock className="h-[360px] border border-slate-200" />
          <SkeletonBlock className="h-[360px] border border-slate-200" />
          <SkeletonBlock className="h-[360px] border border-slate-200" />
        </section>
      </div>
    </main>
  );
}
