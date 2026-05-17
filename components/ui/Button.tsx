import type { AnchorHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "whatsapp";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 h-11 text-[15px] font-medium tracking-tight transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent";

const styles: Record<Variant, string> = {
  primary:
    "bg-accent text-white shadow-[0_1px_2px_rgba(200,16,46,0.25)] hover:bg-accent-hover hover:-translate-y-[1px] active:translate-y-0",
  secondary:
    "bg-foreground text-white hover:bg-[#0f2f4f] hover:-translate-y-[1px]",
  ghost:
    "bg-white/0 text-foreground hover:bg-foreground/5 border border-hairline",
  whatsapp:
    "bg-[#25D366] text-white shadow-[0_1px_2px_rgba(37,211,102,0.35)] hover:bg-[#1ebd5b] hover:-translate-y-[1px]",
};

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: Variant;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  children,
  className = "",
  ...rest
}: Props) {
  return (
    <a className={`${base} ${styles[variant]} ${className}`} {...rest}>
      {children}
    </a>
  );
}
