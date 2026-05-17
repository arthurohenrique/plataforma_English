"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePlatform } from "../store/PlatformContext";
import { platformRoutes } from "../routes";

export function Topbar({
  title,
  back,
}: {
  title?: string;
  back?: { href: string; label: string };
}) {
  const { auth, logout } = usePlatform();
  const pathname = usePathname() || "";

  const home =
    auth?.role === "professor"
      ? platformRoutes.professor.home
      : platformRoutes.aluno.home;
  const aulas =
    auth?.role === "professor"
      ? platformRoutes.professor.aulas
      : platformRoutes.aluno.aulas;

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/75 border-b border-[color:var(--p-hairline)]">
      <div className="flex h-14 items-center gap-4 px-5 sm:px-8">
        {back ? (
          <Link
            href={back.href}
            className="inline-flex items-center gap-1 text-[13px] text-[color:var(--p-muted)] hover:text-[color:var(--p-fg)]"
          >
            <span aria-hidden>‹</span> {back.label}
          </Link>
        ) : (
          <Link href={home} className="lg:hidden flex items-center gap-2">
            <span className="inline-block h-5 w-5 rounded-full bg-[color:var(--p-fg)]" />
            <span className="text-[14px] font-semibold tracking-tight">
              Oxford Particular
            </span>
          </Link>
        )}

        <div className="hidden md:block text-[14px] font-semibold tracking-tight text-[color:var(--p-fg)] truncate">
          {title}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <nav className="lg:hidden flex items-center gap-1 mr-1">
            <Link
              href={home}
              className={`rounded-full px-3 h-8 inline-flex items-center text-[12px] font-medium border transition-colors ${
                pathname === home
                  ? "bg-[color:var(--p-fg)] text-white border-[color:var(--p-fg)]"
                  : "bg-white text-[color:var(--p-muted)] border-[color:var(--p-hairline)]"
              }`}
            >
              Áreas
            </Link>
            <Link
              href={aulas}
              className={`rounded-full px-3 h-8 inline-flex items-center text-[12px] font-medium border transition-colors ${
                pathname.startsWith(aulas)
                  ? "bg-[color:var(--p-fg)] text-white border-[color:var(--p-fg)]"
                  : "bg-white text-[color:var(--p-muted)] border-[color:var(--p-hairline)]"
              }`}
            >
              Aulas
            </Link>
          </nav>

          <button
            onClick={logout}
            className="lg:hidden rounded-full px-3 h-8 inline-flex items-center text-[12px] font-medium border border-[color:var(--p-hairline)] bg-white text-[color:var(--p-muted)] hover:text-[color:var(--p-fg)]"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
