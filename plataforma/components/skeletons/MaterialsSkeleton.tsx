import { PlatformShell } from "../PlatformShell";
import { Skeleton, SkeletonText } from "../ui/Skeleton";

export function MaterialsSkeleton() {
  return (
    <PlatformShell title="Materiais">
      <div className="p-fade-in">
        <header className="max-w-3xl">
          <Skeleton width="55%" height={44} rounded="lg" />
          <Skeleton className="mt-3" width="40%" height={44} rounded="lg" />
          <div className="mt-4">
            <SkeletonText lines={2} lastLineWidth="65%" />
          </div>
        </header>

        <section className="mt-10 space-y-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-card p-7">
              <div className="flex items-start gap-4">
                <Skeleton width={48} height={48} rounded="lg" />
                <div className="flex-1">
                  <Skeleton width={80} height={14} rounded="sm" />
                  <Skeleton className="mt-3" width="55%" height={22} rounded="md" />
                  <SkeletonText className="mt-2" lines={1} lastLineWidth="80%" />
                </div>
              </div>
              <div className="mt-6 grid gap-2">
                {Array.from({ length: 3 }).map((__, j) => (
                  <Skeleton key={j} height={56} rounded="lg" />
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </PlatformShell>
  );
}
