"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { usePlatform } from "../store/PlatformContext";
import { platformRoutes } from "../routes";
import { Tag } from "./ui/Tag";
import { Icon, type IconName } from "./ui/Icon";

type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  match: (path: string) => boolean;
};

function getNav(role: "aluno" | "professor"): NavItem[] {
  const base = role === "professor" ? platformRoutes.professor : platformRoutes.aluno;
  return [
    {
      href: base.home,
      label: "Áreas de estudo",
      icon: "blocks",
      match: (p) => p === base.home,
    },
    {
      href: base.aulas,
      label: "Aulas gravadas",
      icon: "play",
      match: (p) => p.startsWith(base.aulas),
    },
    {
      href: base.flashcards,
      label: "Flashcards",
      icon: "book",
      match: (p) => p.startsWith(base.flashcards),
    },
  ];
}

export function Sidebar() {
  const pathname = usePathname() || "";
  const { auth, logout } = usePlatform();
  if (!auth) return null;

  const nav = getNav(auth.role);

  return (
    <aside className="hidden lg:flex lg:flex-col w-[260px] shrink-0 border-r border-[color:var(--p-hairline)] bg-[color:var(--p-surface)]/60 backdrop-blur-xl">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-[color:var(--p-hairline)]">
        <span className="inline-block h-6 w-6 rounded-full bg-[color:var(--p-fg)]" />
        <span className="text-[15px] font-semibold tracking-tight">
          Oxford Particular
        </span>
      </div>

      <div className="px-4 py-5">
        <div className="rounded-2xl border border-[color:var(--p-hairline)] bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[color:var(--p-blue)] to-[color:var(--p-accent)]" />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold">{auth.username}</p>
              <Tag tone={auth.role === "professor" ? "accent" : "neutral"}>
                {auth.role === "professor" ? "Professor" : "Aluno"}
              </Tag>
            </div>
          </div>
        </div>
      </div>

      <nav className="px-3 flex flex-col gap-1">
        {nav.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 h-10 text-[13px] font-medium transition-colors ${
                active
                  ? "bg-white text-[color:var(--p-fg)] shadow-[0_1px_0_rgba(10,37,64,0.05)] border border-[color:var(--p-hairline)]"
                  : "text-[color:var(--p-muted)] hover:text-[color:var(--p-fg)] hover:bg-white/70"
              }`}
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[color:var(--p-surface-2)] text-[color:var(--p-muted)]">
                <Icon name={item.icon} size={14} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div
        className="mt-auto p-4"
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      >
        <button
          onClick={logout}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--p-hairline)] bg-white px-4 h-9 text-[13px] font-medium text-[color:var(--p-muted)] hover:text-[color:var(--p-fg)] transition-colors"
        >
          <Icon name="logout" size={14} />
          Sair
        </button>
      </div>
    </aside>
  );
}
