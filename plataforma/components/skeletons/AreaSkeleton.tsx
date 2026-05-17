import { PlatformShell } from "../PlatformShell";
import { Skeleton, SkeletonText } from "../ui/Skeleton";

export function AreaSkeleton() {
  return (
    <PlatformShell title="Carregando…">
      <div className="p-fade-in">
        <header className="max-w-3xl">
          <Skeleton width={48} height={48} rounded="lg" />
          <Skeleton className="mt-5" width="55%" height={44} rounded="lg" />
          <div className="mt-4">
            <SkeletonText lines={2} lastLineWidth="65%" />
          </div>
        </header>

        <section className="mt-10 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-card p-7">
              <Skeleton width="40%" height={18} rounded="md" />
              <SkeletonText className="mt-3" lines={2} lastLineWidth="80%" />
              <div className="mt-5 grid gap-2">
                {Array.from({ length: 4 }).map((__, j) => (
                  <Skeleton key={j} height={44} rounded="lg" />
                ))}
              </div>
              <div className="mt-5 flex gap-2">
                <Skeleton width={120} height={36} rounded="full" />
                <Skeleton width={100} height={36} rounded="full" />
              </div>
            </div>
          ))}
        </section>
      </div>
    </PlatformShell>
  );
}
