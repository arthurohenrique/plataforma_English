"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePlatform } from "../store/PlatformContext";
import { platformRoutes } from "../routes";
import { Icon } from "./ui/Icon";

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
  const materiais =
    auth?.role === "professor"
      ? platformRoutes.professor.materiais
      : platformRoutes.aluno.materiais;
  const aulas =
    auth?.role === "professor"
      ? platformRoutes.professor.aulas
      : platformRoutes.aluno.aulas;
  const flashcards =
    auth?.role === "professor"
      ? platformRoutes.professor.flashcards
      : platformRoutes.aluno.flashcards;

  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-xl bg-white/75 border-b border-[color:var(--p-hairline)]"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex h-14 items-center gap-2 sm:gap-4 px-4 sm:px-6 lg:px-8">
        {back ? (
          <Link
            href={back.href}
            className="inline-flex items-center gap-1 text-[13px] text-[color:var(--p-muted)] hover:text-[color:var(--p-fg)] shrink-0"
            aria-label={`Voltar para ${back.label}`}
          >
            <Icon name="chevron-right" size={16} className="rotate-180" />
            <span className="hidden xs:inline sm:inline">{back.label}</span>
          </Link>
        ) : (
          <Link href={home} className="lg:hidden flex items-center gap-2 min-w-0">
            <img
              src="/logo.svg"
              alt=""
              width={20}
              height={20}
              className="h-5 w-5 rounded-md shrink-0"
            />
            <span className="text-[13px] sm:text-[14px] font-semibold tracking-tight truncate">
              Reinaldo Montes
            </span>
          </Link>
        )}

        <div className="hidden md:block text-[14px] font-semibold tracking-tight text-[color:var(--p-fg)] truncate min-w-0 flex-1">
          {title}
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2 shrink-0">
          <nav className="lg:hidden flex items-center gap-1 overflow-x-auto -mx-1 px-1">
            <PillLink href={home} active={pathname === home}>
              Painel
            </PillLink>
            <PillLink href={materiais} active={pathname.startsWith(materiais)}>
              Materiais
            </PillLink>
            <PillLink href={aulas} active={pathname.startsWith(aulas)}>
              Aulas
            </PillLink>
            <PillLink
              href={flashcards}
              active={pathname.startsWith(flashcards)}
            >
              Cartas
            </PillLink>
          </nav>

          <button
            onClick={logout}
            aria-label="Sair"
            className="lg:hidden rounded-full h-8 w-8 sm:w-auto sm:px-3 inline-flex items-center justify-center text-[11px] sm:text-[12px] font-medium border border-[color:var(--p-hairline)] bg-white text-[color:var(--p-muted)] hover:text-[color:var(--p-fg)]"
          >
            <Icon name="logout" size={14} className="sm:hidden" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function PillLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-full px-2.5 sm:px-3 h-8 inline-flex items-center text-[11px] sm:text-[12px] font-medium border transition-colors ${
        active
          ? "bg-[color:var(--p-fg)] text-white border-[color:var(--p-fg)]"
          : "bg-white text-[color:var(--p-muted)] border-[color:var(--p-hairline)]"
      }`}
    >
      {children}
    </Link>
  );
}
