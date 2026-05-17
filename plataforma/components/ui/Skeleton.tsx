import type { CSSProperties } from "react";

type Props = {
  className?: string;
  style?: CSSProperties;
  width?: number | string;
  height?: number | string;
  rounded?: "sm" | "md" | "lg" | "full";
};

const roundedMap = {
  sm: "rounded-md",
  md: "rounded-xl",
  lg: "rounded-2xl",
  full: "rounded-full",
} as const;

export function Skeleton({
  className = "",
  style,
  width,
  height,
  rounded = "md",
}: Props) {
  return (
    <span
      aria-hidden
      className={`p-skel block ${roundedMap[rounded]} ${className}`}
      style={{
        width,
        height,
        ...style,
      }}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className = "",
  lastLineWidth = "60%",
}: {
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}) {
  return (
    <span className={`flex flex-col gap-2 ${className}`} aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={12}
          width={i === lines - 1 ? lastLineWidth : "100%"}
          rounded="sm"
        />
      ))}
    </span>
  );
}

export function SkeletonCard({
  className = "",
  height = 200,
}: {
  className?: string;
  height?: number | string;
}) {
  return (
    <div
      className={`p-card p-6 ${className}`}
      style={{ minHeight: height }}
      aria-hidden
    >
      <Skeleton width={44} height={44} rounded="lg" />
      <Skeleton className="mt-5" width="70%" height={18} rounded="md" />
      <SkeletonText className="mt-3" lines={2} />
    </div>
  );
}
