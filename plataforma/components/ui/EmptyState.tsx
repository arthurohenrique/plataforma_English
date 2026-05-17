import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

export function EmptyState({
  title,
  description,
  action,
  icon = "spark",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: IconName;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center rounded-3xl border border-dashed border-[color:var(--p-hairline-strong)] bg-[color:var(--p-surface-2)] px-6 py-16">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-[color:var(--p-hairline)] text-[color:var(--p-muted)]">
        <Icon name={icon} size={22} />
      </div>
      <h3 className="mt-5 text-[18px] font-semibold tracking-tight text-[color:var(--p-fg)]">
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-md text-[14px] text-[color:var(--p-muted)]">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
