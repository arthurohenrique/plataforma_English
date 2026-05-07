"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Aula, Conteudo, Modulo } from "@/lib/types";

type SidebarProps = {
  conteudos: Conteudo[];
  modulos: Modulo[];
  aulas: Aula[];
  currentAulaId?: string;
};

export function Sidebar({ conteudos, modulos, aulas, currentAulaId }: SidebarProps) {
  const [openCourses, setOpenCourses] = useState<Record<string, boolean>>(
    Object.fromEntries(conteudos.map((conteudo) => [conteudo.id, true])),
  );
  const [openModules, setOpenModules] = useState<Record<string, boolean>>(
    Object.fromEntries(modulos.map((modulo) => [modulo.id, true])),
  );

  const sortedAulas = useMemo(() => [...aulas].sort((a, b) => a.ordem - b.ordem), [aulas]);

  return (
    <aside className="h-full w-full space-y-4 overflow-y-auto border-r border-slate-200 bg-white p-4 lg:w-[280px]">
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-brandBlue">Conteudos</p>
        <p className="mt-1 text-xs text-slate-600">{sortedAulas.length} aulas disponiveis</p>
      </div>
      {conteudos.map((conteudo) => {
        const contentModules = modulos.filter((modulo) => modulo.conteudo_id === conteudo.id);
        return (
          <div key={conteudo.id} className="rounded-xl border border-slate-200">
            <button
              onClick={() => setOpenCourses((prev) => ({ ...prev, [conteudo.id]: !prev[conteudo.id] }))}
              className="w-full px-4 py-3 text-left text-sm font-bold text-brandBlue"
            >
              ▸ {conteudo.titulo}
            </button>
            {openCourses[conteudo.id] && (
              <div className="space-y-2 px-2 pb-3">
                {contentModules.map((modulo) => {
                  const moduleLessons = aulas.filter((aula) => aula.modulo_id === modulo.id);

                  return (
                    <div key={modulo.id} className="rounded-lg border border-slate-100 bg-slate-50">
                      <button
                        onClick={() => setOpenModules((prev) => ({ ...prev, [modulo.id]: !prev[modulo.id] }))}
                        className="w-full px-3 py-2 text-left text-xs font-semibold text-brandText"
                      >
                        {modulo.titulo} ({moduleLessons.length})
                      </button>
                      {openModules[modulo.id] && (
                        <div className="space-y-1 px-2 pb-2">
                          {moduleLessons.map((aula) => {
                            const isCurrent = currentAulaId === aula.id;

                            return (
                              <Link
                                key={aula.id}
                                href={`/biblioteca/${conteudo.id}/${aula.id}`}
                                className={`flex items-center justify-between rounded-md px-2 py-1 text-xs ${
                                  isCurrent ? "bg-brandBlue text-white" : "text-brandText hover:bg-white"
                                }`}
                              >
                                <span>{aula.titulo}</span>
                                <span className="text-slate-400">•</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}
