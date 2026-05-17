import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  as: As = "div",
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "li";
  hover?: boolean;
}) {
  return (
    <As
      className={`p-card transition-all duration-300 ${
        hover
          ? "hover:-translate-y-[2px] hover:shadow-[0_20px_40px_-20px_rgba(10,37,64,0.18)]"
          : ""
      } ${className}`}
    >
      {children}
    </As>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-[18px] font-semibold tracking-tight text-[color:var(--p-fg)]">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1 text-[13px] text-[color:var(--p-muted)]">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
