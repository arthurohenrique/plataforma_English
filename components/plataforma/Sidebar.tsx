"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Aula, Curso, Modulo, ProgressoAula } from "@/lib/types";
import { ProgressBar } from "@/components/plataforma/ProgressBar";

type SidebarProps = {
  cursos: Curso[];
  modulos: Modulo[];
  aulas: Aula[];
  progresso: ProgressoAula[];
  currentAulaId?: string;
};

export function Sidebar({ cursos, modulos, aulas, progresso, currentAulaId }: SidebarProps) {
  const [openCourses, setOpenCourses] = useState<Record<string, boolean>>(
    Object.fromEntries(cursos.map((curso) => [curso.id, true])),
  );
  const [openModules, setOpenModules] = useState<Record<string, boolean>>(
    Object.fromEntries(modulos.map((modulo) => [modulo.id, true])),
  );

  const completed = useMemo(() => progresso.filter((item) => item.assistida).length, [progresso]);

  return (
    <aside className="h-full w-full space-y-4 overflow-y-auto border-r border-slate-200 bg-white p-4 lg:w-[280px]">
      <ProgressBar current={completed} total={aulas.length} />
      {cursos.map((curso) => {
        const courseModules = modulos.filter((modulo) => modulo.curso_id === curso.id);
        return (
          <div key={curso.id} className="rounded-xl border border-slate-200">
            <button
              onClick={() => setOpenCourses((prev) => ({ ...prev, [curso.id]: !prev[curso.id] }))}
              className="w-full px-4 py-3 text-left text-sm font-bold text-brandBlue"
            >
              ▸ {curso.titulo}
            </button>
            {openCourses[curso.id] && (
              <div className="space-y-2 px-2 pb-3">
                {courseModules.map((modulo) => {
                  const moduleLessons = aulas.filter((aula) => aula.modulo_id === modulo.id);
                  const watchedInModule = moduleLessons.filter((aula) =>
                    progresso.some((item) => item.aula_id === aula.id && item.assistida),
                  ).length;

                  return (
                    <div key={modulo.id} className="rounded-lg border border-slate-100 bg-slate-50">
                      <button
                        onClick={() => setOpenModules((prev) => ({ ...prev, [modulo.id]: !prev[modulo.id] }))}
                        className="w-full px-3 py-2 text-left text-xs font-semibold text-brandText"
                      >
                        {modulo.titulo} ({watchedInModule}/{moduleLessons.length})
                      </button>
                      {openModules[modulo.id] && (
                        <div className="space-y-1 px-2 pb-2">
                          {moduleLessons.map((aula) => {
                            const isDone = progresso.some((item) => item.aula_id === aula.id && item.assistida);
                            const isCurrent = currentAulaId === aula.id;

                            return (
                              <Link
                                key={aula.id}
                                href={`/curso/${curso.id}/${aula.id}`}
                                className={`flex items-center justify-between rounded-md px-2 py-1 text-xs ${
                                  isCurrent ? "bg-brandBlue text-white" : "text-brandText hover:bg-white"
                                }`}
                              >
                                <span>{aula.titulo}</span>
                                <span className={isDone ? "text-green-500" : "text-slate-400"}>{isDone ? "✓" : "•"}</span>
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
