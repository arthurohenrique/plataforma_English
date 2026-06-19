"use client";

import { useMemo } from "react";
import { AuthGuard } from "../../components/AuthGuard";
import { PlatformShell } from "../../components/PlatformShell";
import { EmptyState } from "../../components/ui/EmptyState";
import { Icon } from "../../components/ui/Icon";
import { Tag } from "../../components/ui/Tag";
import { useState } from "react";
import { usePlatform } from "../../store/PlatformContext";
import { getSupabase } from "../../supabase/client";
import { platformRoutes } from "../../routes";
import { MaterialsSkeleton } from "../../components/skeletons/MaterialsSkeleton";
import { formatBytes } from "../teacher/materialUtils";
import type { Material } from "../../types";

export function StudentMaterials() {
  return (
    <AuthGuard role="aluno" fallback={<MaterialsSkeleton />}>
      <PlatformShell
        title="Materiais"
        back={{ href: platformRoutes.aluno.home, label: "Painel" }}
      >
        <Inner />
      </PlatformShell>
    </AuthGuard>
  );
}

function Inner() {
  const { content, materialsBySection } = usePlatform();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function download(m: Material) {
    setError(null);
    setDownloadingId(m.id);
    try {
      const { data, error } = await getSupabase()
        .storage.from("materials")
        .createSignedUrl(m.storagePath, 60, { download: m.displayName });
      if (error || !data) throw error ?? new Error("Falha ao gerar link.");
      const a = document.createElement("a");
      a.href = data.signedUrl;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      setError("Não consegui baixar este arquivo. Tente novamente.");
    } finally {
      setDownloadingId(null);
    }
  }

  const sections = useMemo(
    () =>
      [...content.materialSections].sort((a, b) => a.order - b.order),
    [content.materialSections],
  );

  const totalFiles = content.materials.length;

  return (
    <div className="p-fade-in">
      <header className="max-w-3xl">
        <h1 className="text-[clamp(1.75rem,5.5vw,2.75rem)] leading-[1.05] font-semibold tracking-[-0.03em]">
          Materiais
          <br />
          <span className="text-[color:var(--p-muted)]">de estudo.</span>
        </h1>
        <p className="mt-3 sm:mt-4 text-[14px] sm:text-[16px] leading-relaxed text-[color:var(--p-muted)]">
          Tudo o que seu professor disponibilizou para download — listas,
          áudios, planilhas, PDFs. Siga a ordem indicada.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Tag tone="neutral">
            {sections.length}{" "}
            {sections.length === 1 ? "seção" : "seções"}
          </Tag>
          <Tag tone="accent">
            {totalFiles} {totalFiles === 1 ? "arquivo" : "arquivos"}
          </Tag>
        </div>
        {error && (
          <p className="mt-4 text-[13px] text-[color:var(--p-accent)]">{error}</p>
        )}
      </header>

      <section className="mt-8 sm:mt-10 space-y-4 sm:space-y-5">
        {sections.length === 0 ? (
          <EmptyState
            icon="folder"
            title="Nada por aqui ainda"
            description="O professor ainda não publicou materiais. Volte mais tarde."
          />
        ) : (
          sections.map((section) => {
            const items = materialsBySection(section.id);
            return (
              <div key={section.id} className="p-card p-5 sm:p-7 lg:p-8">
                <div className="flex items-start gap-3 sm:gap-4">
                  <span className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-[color:var(--p-accent-soft)] text-[color:var(--p-accent)] shrink-0">
                    <Icon name="folder" size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag tone="neutral">Seção {section.order + 1}</Tag>
                    </div>
                    <h2 className="mt-2 text-[18px] sm:text-[20px] font-semibold tracking-tight break-words">
                      {section.title}
                    </h2>
                    {section.description && (
                      <p className="mt-1 text-[13px] sm:text-[14px] leading-relaxed text-[color:var(--p-muted)]">
                        {section.description}
                      </p>
                    )}
                  </div>
                </div>

                {items.length === 0 ? (
                  <p className="mt-5 text-[13px] text-[color:var(--p-muted)]">
                    Nenhum arquivo nesta seção ainda.
                  </p>
                ) : (
                  <ul className="mt-5 grid gap-2">
                    {items.map((m) => (
                      <li key={m.id}>
                        <button
                          type="button"
                          onClick={() => download(m)}
                          disabled={downloadingId === m.id}
                          className="flex w-full text-left items-center gap-3 rounded-2xl border border-[color:var(--p-hairline)] bg-white px-3 sm:px-4 py-3 transition-all hover:-translate-y-[1px] hover:shadow-[0_12px_24px_-16px_rgba(10,37,64,0.18)] disabled:opacity-60 disabled:pointer-events-none"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--p-surface)] text-[color:var(--p-muted)]">
                            <Icon name="document" size={18} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[14px] sm:text-[15px] font-medium text-[color:var(--p-fg)]">
                              {m.displayName}
                            </p>
                            <p className="mt-0.5 truncate text-[11px] sm:text-[12px] text-[color:var(--p-muted)]">
                              {formatBytes(m.size)}
                              {m.mime ? ` · ${m.mime}` : ""}
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1.5 shrink-0 text-[12px] sm:text-[13px] font-medium text-[color:var(--p-accent)]">
                            <Icon name="download" size={16} />
                            <span className="hidden sm:inline">
                              {downloadingId === m.id ? "Baixando…" : "Baixar"}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
