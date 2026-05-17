"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function PlatformShell({
  children,
  title,
  back,
}: {
  children: ReactNode;
  title?: string;
  back?: { href: string; label: string };
}) {
  return (
    <div className="flex min-h-[100dvh] bg-[color:var(--p-bg)]">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar title={title} back={back} />
        <main className="flex-1 px-5 sm:px-8 py-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}
