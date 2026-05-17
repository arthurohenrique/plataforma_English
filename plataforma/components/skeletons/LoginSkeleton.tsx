import { Skeleton } from "../ui/Skeleton";

export function LoginSkeleton() {
  return (
    <div className="p-bg-radial min-h-[100dvh] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md p-fade-in">
        <div className="flex items-center gap-2 justify-center">
          <Skeleton width={28} height={28} rounded="full" />
          <Skeleton width={140} height={14} rounded="sm" />
        </div>

        <div className="mt-8 flex justify-center">
          <Skeleton width={240} height={44} rounded="lg" />
        </div>
        <div className="mt-3 flex justify-center">
          <Skeleton width={300} height={14} rounded="sm" />
        </div>

        <div className="mt-10 p-card p-8 space-y-5">
          <div className="space-y-2">
            <Skeleton width={120} height={12} rounded="sm" />
            <Skeleton height={44} rounded="lg" />
          </div>
          <div className="space-y-2">
            <Skeleton width={140} height={12} rounded="sm" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton height={72} rounded="lg" />
              <Skeleton height={72} rounded="lg" />
            </div>
          </div>
          <Skeleton height={48} rounded="full" />
        </div>
      </div>
    </div>
  );
}
