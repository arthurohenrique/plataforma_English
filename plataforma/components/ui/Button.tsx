"use client";

import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--p-accent)] disabled:opacity-50 disabled:pointer-events-none";

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[12px]",
  md: "h-10 px-5 text-[14px]",
  lg: "h-12 px-6 text-[15px]",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-[color:var(--p-accent)] text-white hover:bg-[color:var(--p-accent-hover)] hover:-translate-y-[1px] shadow-[0_1px_2px_rgba(200,16,46,0.25)]",
  secondary:
    "bg-[color:var(--p-fg)] text-white hover:bg-[#0f2f4f] hover:-translate-y-[1px]",
  ghost:
    "bg-transparent text-[color:var(--p-fg)] border border-[color:var(--p-hairline)] hover:bg-[color:var(--p-surface)]",
  danger:
    "bg-transparent text-[color:var(--p-accent)] border border-[color:var(--p-hairline)] hover:bg-[color:var(--p-accent-soft)]",
  success:
    "bg-[color:var(--p-success)] text-white hover:opacity-90 hover:-translate-y-[1px]",
};

type Common = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
};

type ButtonProps = Common &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">;
type LinkProps = Common & { href: string } & Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    "children" | "className" | "href"
  >;

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  variant = "primary",
  size = "md",
  className = "",
  href,
  children,
  ...rest
}: LinkProps) {
  return (
    <a
      href={href}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </a>
  );
}
