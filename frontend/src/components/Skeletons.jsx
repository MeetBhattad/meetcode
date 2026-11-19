const Shimmer = ({ className = '', style }) => (
  <div className={`bg-white/[0.05] rounded animate-pulse ${className}`} style={style} />
);

// Homepage problem list
export const ProblemListSkeleton = () => (
  <div className="space-y-1">
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-transparent">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Shimmer className="w-[18px] h-[18px] rounded-full flex-shrink-0" />
          <Shimmer className="h-4" style={{ width: `${40 + (i % 4) * 12}%` }} />
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          <Shimmer className="h-6 w-16 rounded-md" />
          <Shimmer className="h-6 w-24 rounded-md hidden sm:block" />
        </div>
      </div>
    ))}
  </div>
);

// Dashboard
export const DashboardSkeleton = () => (
  <div className="min-h-screen bg-[#07070a] p-6">
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <Shimmer className="h-3 w-32" />
        <Shimmer className="h-9 w-56" />
        <Shimmer className="h-3 w-64" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] p-4 space-y-3">
            <Shimmer className="h-3 w-16" />
            <Shimmer className="h-8 w-20" />
            <Shimmer className="h-2.5 w-24" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-white/[0.06] p-5">
        <div className="flex justify-between mb-4">
          <Shimmer className="h-4 w-40" />
          <Shimmer className="h-3 w-20" />
        </div>
        <Shimmer className="h-[120px] w-full rounded-xl" />
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-2xl border border-white/[0.06] p-5">
          <Shimmer className="h-4 w-32 mb-4" />
          <Shimmer className="h-[240px] w-full rounded-xl" />
        </div>
        <div className="rounded-2xl border border-white/[0.06] p-5">
          <Shimmer className="h-4 w-28 mb-4" />
          <div className="space-y-2">
            <Shimmer className="h-8 w-full rounded-md" />
            <Shimmer className="h-8 w-3/4 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Paths list
export const PathsSkeleton = () => (
  <div className="min-h-screen bg-[#07070a] p-6">
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="space-y-2">
        <Shimmer className="h-3 w-32" />
        <Shimmer className="h-8 w-52" />
        <Shimmer className="h-3 w-80 max-w-full" />
      </div>
      <div className="space-y-3">
        <Shimmer className="h-4 w-32" />
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/[0.06] p-5 space-y-3">
              <Shimmer className="h-4 w-3/4" />
              <Shimmer className="h-2.5 w-full" />
              <Shimmer className="h-2 w-16" />
              <Shimmer className="h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <Shimmer className="h-4 w-28" />
        <div className="grid md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/[0.06] p-4 space-y-2">
              <Shimmer className="h-4 w-2/3" />
              <Shimmer className="h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);