import Link from "next/link";
import type { Aula } from "@/lib/types";

type AulaInfoProps = {
  aula: Aula;
  anterior?: Aula;
  proxima?: Aula;
  cursoId: string;
};

export function AulaInfo({ aula, anterior, proxima, cursoId }: AulaInfoProps) {
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-bold text-brandBlue">{aula.titulo}</h1>
      <p className="mt-2 text-sm text-brandText">{aula.descricao}</p>

      <div className="mt-4">
        <h2 className="text-sm font-semibold text-brandBlue">Materiais para download</h2>
        <ul className="mt-2 list-inside list-disc text-sm text-brandText">
          {aula.materiais_url.length > 0 ? (
            aula.materiais_url.map((material) => (
              <li key={material}>
                <a href={material} className="text-brandBlue hover:underline">
                  {material}
                </a>
              </li>
            ))
          ) : (
            <li>Sem materiais adicionais nesta aula.</li>
          )}
        </ul>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {anterior ? (
          <Link
            href={`/curso/${cursoId}/${anterior.id}`}
            className="rounded-full border border-brandBlue px-4 py-2 text-sm font-semibold text-brandBlue"
          >
            ← Aula anterior
          </Link>
        ) : null}
        {proxima ? (
          <Link href={`/curso/${cursoId}/${proxima.id}`} className="rounded-full bg-brandBlue px-4 py-2 text-sm font-semibold text-white">
            Proxima aula →
          </Link>
        ) : null}
      </div>
    </section>
  );
}
