import { PlatformShell } from "../PlatformShell";
import { Skeleton, SkeletonCard, SkeletonText } from "../ui/Skeleton";

export function DashboardSkeleton({ title }: { title?: string }) {
  return (
    <PlatformShell title={title}>
      <div className="p-fade-in">
        <header className="max-w-3xl">
          <Skeleton width={180} height={12} rounded="sm" />
          <div className="mt-4 space-y-3">
            <Skeleton width="80%" height={44} rounded="lg" />
            <Skeleton width="55%" height={44} rounded="lg" />
          </div>
          <div className="mt-5">
            <SkeletonText lines={2} lastLineWidth="70%" />
          </div>
        </header>

        <section className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-card p-5">
              <Skeleton width={100} height={10} rounded="sm" />
              <Skeleton className="mt-3" width={80} height={28} rounded="md" />
            </div>
          ))}
        </section>

        <div className="mt-12">
          <Skeleton width={120} height={10} rounded="sm" />
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        <div className="mt-14">
          <Skeleton width={130} height={10} rounded="sm" />
        </div>
        <div className="mt-4 p-card p-7">
          <div className="flex items-center gap-5">
            <Skeleton width={56} height={56} rounded="lg" />
            <div className="flex-1">
              <Skeleton width="40%" height={18} rounded="md" />
              <Skeleton className="mt-2" width="65%" height={12} rounded="sm" />
            </div>
          </div>
        </div>
      </div>
    </PlatformShell>
  );
}
