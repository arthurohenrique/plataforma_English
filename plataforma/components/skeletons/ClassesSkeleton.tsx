import { PlatformShell } from "../PlatformShell";
import { Skeleton, SkeletonText } from "../ui/Skeleton";

export function ClassesSkeleton({ title }: { title?: string }) {
  return (
    <PlatformShell title={title || "Aulas gravadas"}>
      <div className="p-fade-in">
        <header className="max-w-3xl">
          <Skeleton width={160} height={12} rounded="sm" />
          <Skeleton className="mt-4" width="55%" height={44} rounded="lg" />
          <div className="mt-4">
            <SkeletonText lines={2} lastLineWidth="60%" />
          </div>
        </header>

        <section className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 xl:col-span-4 p-card p-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[color:var(--p-hairline)] bg-white px-4 py-3 flex items-center gap-3"
              >
                <Skeleton width={28} height={28} rounded="full" />
                <div className="flex-1">
                  <Skeleton width="70%" height={12} rounded="sm" />
                  <Skeleton className="mt-2" width="40%" height={10} rounded="sm" />
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-7 xl:col-span-8">
            <Skeleton className="aspect-video w-full" height={undefined} rounded="lg" />
            <div className="mt-5">
              <Skeleton width={80} height={20} rounded="full" />
              <Skeleton className="mt-3" width="60%" height={26} rounded="md" />
              <SkeletonText className="mt-3" lines={2} lastLineWidth="80%" />
            </div>
          </div>
        </section>
      </div>
    </PlatformShell>
  );
}
