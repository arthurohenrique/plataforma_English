import { notFound } from "next/navigation";
import { getStudentBibliotecaLesson } from "@/lib/supabase/student-biblioteca";
import Link from "next/link";

type AulaPageProps = {
  params: Promise<{ conteudoId: string; aulaId: string }>;
};

export default async function AulaPage({ params }: AulaPageProps) {
  const { conteudoId, aulaId } = await params;
  const payload = await getStudentBibliotecaLesson(conteudoId, aulaId);

  if (!payload) {
    notFound();
  }

  const hasDidacticContent = payload.aulaAtual.didacticSessions.some((session) => session.exercises.length > 0);
  const hasOriginalHtml = Boolean(payload.aulaAtual.contentHtml && payload.aulaAtual.contentHtml.trim().length > 0);
  const currentSection = payload.sections.find((section) => section.id === payload.aulaAtual.sectionId);
  const currentUnit = currentSection?.units.find((unit) => unit.id === payload.aulaAtual.unitId);

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col lg:flex-row">
      <aside className="h-full w-full space-y-4 overflow-y-auto border-r border-slate-200 bg-white p-4 lg:w-[360px]">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-brandBlue">Roteiro didatico</p>
          <p className="mt-1 text-xs text-slate-600">
            {payload.sections.length} secoes • {payload.aulas.length} itens
          </p>
        </div>

        {payload.sections.map((section) => (
          <section key={section.id} className="rounded-xl border border-slate-200 bg-white">
            <h2 className="border-b border-slate-100 px-4 py-3 text-sm font-bold text-brandBlue">{section.titulo}</h2>
            <div className="space-y-3 p-3">
              {section.units.map((unit) => (
                <article key={unit.id} className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                  <h3 className="px-1 text-xs font-semibold text-brandText">{unit.titulo}</h3>
                  <div className="mt-2 space-y-1">
                    {unit.aulas.map((aula) => {
                      const isCurrent = aula.id === payload.aulaAtual.id;
                      return (
                        <Link
                          key={aula.id}
                          href={`/biblioteca/${payload.conteudo.id}/${aula.id}`}
                          className={`block rounded-md px-2 py-1 text-xs ${
                            isCurrent ? "bg-brandBlue text-white" : "text-brandText hover:bg-white"
                          }`}
                        >
                          {aula.itemTitle || aula.titulo}
                        </Link>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </aside>

      <main className="flex-1 px-4 py-6 md:px-8">
        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-brandBlue">{payload.conteudo.titulo}</p>
          <p className="mt-2 text-xs text-slate-500">
            {currentSection?.titulo ?? payload.aulaAtual.sectionTitle} {" > "}
            {currentUnit?.titulo ?? payload.aulaAtual.unitTitle}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-brandText">{payload.aulaAtual.titulo}</h1>
          <p className="mt-2 text-xs text-slate-500">Fonte: {payload.aulaAtual.sourceUrl}</p>
          <p className="mt-4 text-sm text-slate-700">{payload.aulaAtual.descricao}</p>

          {hasOriginalHtml ? (
            <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brandBlue">Conteudo original</p>
              <div
                className="max-w-none overflow-x-auto text-sm text-slate-900 [&_input]:rounded [&_input]:border [&_input]:border-slate-300 [&_input]:px-2 [&_input]:py-1 [&_select]:rounded [&_select]:border [&_select]:border-slate-300 [&_textarea]:rounded [&_textarea]:border [&_textarea]:border-slate-300 [&_textarea]:p-2"
                dangerouslySetInnerHTML={{ __html: payload.aulaAtual.contentHtml }}
              />
            </section>
          ) : hasDidacticContent ? (
            <section className="mt-6 space-y-5">
              {payload.aulaAtual.didacticSessions.map((session) => (
                <article key={session.id} className="rounded-xl border border-slate-200 p-4">
                  <h2 className="text-lg font-bold text-brandBlue">{session.title || "Sessao"}</h2>
                  {session.description ? <p className="mt-1 text-sm text-slate-600">{session.description}</p> : null}

                  <div className="mt-4 space-y-4">
                    {session.exercises.map((exercise) => (
                      <section key={exercise.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                        <h3 className="text-sm font-semibold text-brandText">{exercise.title || "Exercicio"}</h3>
                        {exercise.instruction ? (
                          <p className="mt-1 text-xs text-slate-600">{exercise.instruction}</p>
                        ) : null}

                        <div className="mt-3 space-y-3">
                          {exercise.questions.map((question) => (
                            <div key={question.id} className="rounded-md border border-slate-200 bg-white p-3">
                              {question.promptHtml ? (
                                <div
                                  className="prose prose-sm max-w-none text-sm text-slate-800"
                                  dangerouslySetInnerHTML={{ __html: question.promptHtml }}
                                />
                              ) : (
                                <p className="text-sm text-slate-800">{question.promptText || "Pergunta sem enunciado."}</p>
                              )}

                              {question.options.length > 0 ? (
                                <ul className="mt-2 space-y-1">
                                  {question.options.map((option) => (
                                    <li
                                      key={option.id}
                                      className={`rounded px-2 py-1 text-xs ${
                                        option.isCorrect ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700"
                                      }`}
                                    >
                                      {option.label ? `${option.label} - ` : ""}
                                      {option.text || "Opcao sem texto"}
                                    </li>
                                  ))}
                                </ul>
                              ) : null}

                              {question.answerKeys.length > 0 ? (
                                <div className="mt-2 rounded bg-blue-50 px-2 py-1 text-xs text-blue-800">
                                  <span className="font-semibold">Gabarito:</span> {question.answerKeys.join(" | ")}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                </article>
              ))}
            </section>
          ) : payload.aulaAtual.contentHtml ? (
            <section className="prose prose-sm mt-6 max-w-none" dangerouslySetInnerHTML={{ __html: payload.aulaAtual.contentHtml }} />
          ) : (
            <pre className="mt-6 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              {payload.aulaAtual.contentText || "Sem conteudo textual disponivel."}
            </pre>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {payload.anterior ? (
              <Link
                href={`/biblioteca/${payload.conteudo.id}/${payload.anterior.id}`}
                className="rounded-full border border-brandBlue px-4 py-2 text-sm font-semibold text-brandBlue"
              >
                ← Item anterior
              </Link>
            ) : null}
            {payload.proxima ? (
              <Link
                href={`/biblioteca/${payload.conteudo.id}/${payload.proxima.id}`}
                className="rounded-full bg-brandBlue px-4 py-2 text-sm font-semibold text-white"
              >
                Proximo item →
              </Link>
            ) : null}
          </div>
        </article>
      </main>
    </div>
  );
}

