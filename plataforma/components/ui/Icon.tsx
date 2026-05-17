import type { SVGProps } from "react";

export type IconName =
  | "book"
  | "wave"
  | "headphones"
  | "blocks"
  | "document"
  | "play"
  | "chat"
  | "cap"
  | "spark"
  | "trend"
  | "user"
  | "presenter"
  | "pencil"
  | "film"
  | "inbox"
  | "lightbulb"
  | "arrow-right"
  | "check"
  | "plus"
  | "minus"
  | "chevron-right"
  | "chevron-up"
  | "chevron-down"
  | "logout";

type Props = SVGProps<SVGSVGElement> & {
  name: IconName;
  size?: number;
};

export function Icon({ name, size = 20, className = "", ...rest }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
    ...rest,
  };

  switch (name) {
    case "book":
      return (
        <svg {...common}>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
          <path d="M4 5.5V21" />
          <path d="M20 18v3H6.5A2.5 2.5 0 0 1 4 18.5" />
        </svg>
      );
    case "wave":
      return (
        <svg {...common}>
          <path d="M3 12h2" />
          <path d="M7 8v8" />
          <path d="M11 5v14" />
          <path d="M15 8v8" />
          <path d="M19 11v2" />
        </svg>
      );
    case "headphones":
      return (
        <svg {...common}>
          <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
          <path d="M4 13h3v6H5a1 1 0 0 1-1-1z" />
          <path d="M20 13h-3v6h2a1 1 0 0 0 1-1z" />
        </svg>
      );
    case "blocks":
      return (
        <svg {...common}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "document":
      return (
        <svg {...common}>
          <path d="M6 3h8l4 4v14H6z" />
          <path d="M14 3v4h4" />
          <path d="M9 12h6" />
          <path d="M9 16h6" />
        </svg>
      );
    case "play":
      return (
        <svg {...common}>
          <path d="M8 5.5v13l11-6.5z" />
        </svg>
      );
    case "chat":
      return (
        <svg {...common}>
          <path d="M4 5h16v11H8l-4 4z" />
        </svg>
      );
    case "cap":
      return (
        <svg {...common}>
          <path d="M2 9.5 12 5l10 4.5L12 14z" />
          <path d="M6 11.5V16c2 1.5 4 2.25 6 2.25S16 17.5 18 16v-4.5" />
          <path d="M22 9.5V15" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="M12 3v4" />
          <path d="M12 17v4" />
          <path d="M3 12h4" />
          <path d="M17 12h4" />
          <path d="m5.6 5.6 2.8 2.8" />
          <path d="m15.6 15.6 2.8 2.8" />
          <path d="m18.4 5.6-2.8 2.8" />
          <path d="m8.4 15.6-2.8 2.8" />
        </svg>
      );
    case "trend":
      return (
        <svg {...common}>
          <path d="M3 17 9 11l4 4 8-8" />
          <path d="M14 7h7v7" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
        </svg>
      );
    case "presenter":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="11" rx="1.5" />
          <path d="M8 19h8" />
          <path d="M12 15v4" />
          <circle cx="12" cy="9" r="2" />
        </svg>
      );
    case "pencil":
      return (
        <svg {...common}>
          <path d="m4 20 4-1 11-11-3-3L5 16z" />
          <path d="m14 5 3 3" />
        </svg>
      );
    case "film":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 9h18" />
          <path d="M3 15h18" />
          <path d="M8 4v16" />
          <path d="M16 4v16" />
        </svg>
      );
    case "inbox":
      return (
        <svg {...common}>
          <path d="M3 13h5l1.5 2.5h5L16 13h5" />
          <path d="M5 13 7 5h10l2 8" />
          <path d="M3 13v6h18v-6" />
        </svg>
      );
    case "lightbulb":
      return (
        <svg {...common}>
          <path d="M9 18h6" />
          <path d="M10 21h4" />
          <path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1.2 1.5 1.2 2.5h5.6c0-1 .5-1.8 1.2-2.5A6 6 0 0 0 12 3z" />
        </svg>
      );
    case "arrow-right":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );
    case "check":
      return (
        <svg {...common} strokeWidth={2}>
          <path d="m5 13 4 4L19 7" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common} strokeWidth={1.8}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    case "minus":
      return (
        <svg {...common} strokeWidth={1.8}>
          <path d="M5 12h14" />
        </svg>
      );
    case "chevron-right":
      return (
        <svg {...common}>
          <path d="m9 6 6 6-6 6" />
        </svg>
      );
    case "chevron-up":
      return (
        <svg {...common}>
          <path d="m6 15 6-6 6 6" />
        </svg>
      );
    case "chevron-down":
      return (
        <svg {...common}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    case "logout":
      return (
        <svg {...common}>
          <path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4" />
          <path d="M16 8 20 12l-4 4" />
          <path d="M20 12H10" />
        </svg>
      );
  }
}
