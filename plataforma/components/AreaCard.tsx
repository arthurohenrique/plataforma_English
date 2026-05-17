"use client";

import Link from "next/link";
import type { Area } from "../types";
import { Icon } from "./ui/Icon";

export function AreaCard({
  area,
  href,
  meta,
  progress,
}: {
  area: Area;
  href: string;
  meta?: string;
  progress?: { done: number; total: number };
}) {
  const pct =
    progress && progress.total > 0
      ? Math.round((progress.done / progress.total) * 100)
      : 0;

  return (
    <Link
      href={href}
      className="group p-card p-7 sm:p-8 transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_20px_40px_-20px_rgba(10,37,64,0.18)]"
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{
          background: `${area.accent}14`,
          color: area.accent,
        }}
      >
        <Icon name={area.icon} size={22} />
      </div>

      <h3 className="mt-6 text-[20px] font-semibold tracking-tight text-[color:var(--p-fg)]">
        {area.title}
      </h3>
      <p className="mt-2 text-[14px] leading-relaxed text-[color:var(--p-muted)]">
        {area.description}
      </p>

      {(meta || progress) && (
        <div className="mt-6 flex items-center justify-between">
          <span className="text-[12px] font-medium text-[color:var(--p-muted)]">
            {meta}
          </span>
          {progress && progress.total > 0 && (
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-24 rounded-full bg-[color:var(--p-surface)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    background: area.accent,
                  }}
                />
              </div>
              <span className="text-[11px] font-medium text-[color:var(--p-muted)]">
                {pct}%
              </span>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-[color:var(--p-fg)] group-hover:gap-2.5 transition-all">
        Entrar <Icon name="arrow-right" size={14} />
      </div>
    </Link>
  );
}
