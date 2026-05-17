import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
  size = "lg",
}: {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const max =
    size === "sm"
      ? "max-w-2xl"
      : size === "md"
        ? "max-w-4xl"
        : size === "lg"
          ? "max-w-6xl"
          : "max-w-7xl";
  return (
    <div className={`mx-auto w-full ${max} px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}
