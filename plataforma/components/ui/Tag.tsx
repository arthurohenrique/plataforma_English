import type { ReactNode } from "react";

type Tone = "neutral" | "accent" | "success" | "warning";

const tones: Record<Tone, string> = {
  neutral:
    "bg-[color:var(--p-surface)] text-[color:var(--p-muted)] border-[color:var(--p-hairline)]",
  accent:
    "bg-[color:var(--p-accent-soft)] text-[color:var(--p-accent)] border-[color:var(--p-accent-soft)]",
  success:
    "bg-emerald-50 text-emerald-700 border-emerald-100",
  warning:
    "bg-amber-50 text-amber-700 border-amber-100",
};

export function Tag({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-tight ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
