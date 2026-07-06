"use client";

import { useState } from "react";
import type { Checkpoint } from "../types";
import { usePlatform, uid } from "../store/PlatformContext";
import { getSupabase } from "../supabase/client";
import { Button } from "./ui/Button";
import { Field, TextArea, TextInput } from "./ui/Input";
import { Tag } from "./ui/Tag";
import { Icon } from "./ui/Icon";

/** Bolinha numerada dos passos do "como colocar o vídeo". */
function StepNumber({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[color:var(--p-fg)] text-[12px] font-semibold text-white">
      {children}
    </span>
  );
}

export function CheckpointEditor({
  existing,
  onDone,
}: {
  existing?: Checkpoint;
  onDone?: () => void;
}) {
  const { upsertCheckpoint, content } = usePlatform();

  // id fixado no mount (usado no save e para compor o caminho de legado).
  const [id] = useState(existing?.id || uid("c"));
  const [title, setTitle] = useState(existing?.title || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [videoUrl, setVideoUrl] = useState(existing?.videoUrl || "");
  // Vídeo legado enviado ao Storage (plano pago). No free tier usamos link
  // externo; mantemos o path só para não quebrar aulas antigas até o professor
  // removê-lo e colar um link.
  const [legacyPath, setLegacyPath] = useState(existing?.videoPath || "");
  const [durationMin, setDurationMin] = useState<string>(
    existing?.durationMin ? String(existing.durationMin) : "",
  );
  const [err, setErr] = useState<string | null>(null);

  async function removeLegacyVideo() {
    if (!legacyPath) return;
    const path = legacyPath;
    setLegacyPath("");
    try {
      await getSupabase().storage.from("materials").remove([path]);
    } catch {
      // melhor esforço; objeto órfão é tolerável (ver dívidas conhecidas)
    }
  }

  function save() {
    setErr(null);
    if (!title.trim() || !description.trim()) {
      setErr("Título e descrição são obrigatórios.");
      return;
    }
    const cp: Checkpoint = {
      id,
      title: title.trim(),
      description: description.trim(),
      videoUrl: videoUrl.trim(),
      videoPath: legacyPath || undefined,
      durationMin: durationMin.trim() ? Number(durationMin) : undefined,
      order: existing?.order ?? content.checkpoints.length,
      createdAt: existing?.createdAt || Date.now(),
    };
    upsertCheckpoint(cp);
    onDone?.();
  }

  return (
    <div className="p-card p-5 sm:p-7 lg:p-8 p-fade-in">
      <Tag tone="accent">{existing ? "Editar checkpoint" : "Novo checkpoint"}</Tag>
      <h3 className="mt-3 text-[20px] font-semibold tracking-tight">
        Detalhes da aula
      </h3>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Título">
          <TextInput
            placeholder="Ex.: Aula 1 — Boas-vindas"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <Field label="Duração (minutos)" hint="Opcional">
          <TextInput
            type="number"
            inputMode="numeric"
            placeholder="20"
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Descrição">
          <TextArea
            placeholder="O que será coberto nesta aula…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
      </div>

      <div className="mt-6">
        <div className="rounded-2xl border border-[color:var(--p-hairline)] bg-[color:var(--p-surface-2)] p-4 sm:p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white border border-[color:var(--p-hairline)] text-[color:var(--p-muted)]">
              <Icon name="film" size={16} />
            </span>
            <h4 className="text-[14px] sm:text-[15px] font-semibold text-[color:var(--p-fg)]">
              Como colocar o vídeo da aula
            </h4>
          </div>

          <ol className="mt-4 grid gap-3">
            <li className="flex gap-3">
              <StepNumber>1</StepNumber>
              <p className="text-[13px] sm:text-[14px] leading-relaxed text-[color:var(--p-fg-soft)]">
                Envie o vídeo da aula no <strong>YouTube</strong> (site ou app,
                pelo botão de criar / enviar vídeo).
              </p>
            </li>
            <li className="flex gap-3">
              <StepNumber>2</StepNumber>
              <p className="text-[13px] sm:text-[14px] leading-relaxed text-[color:var(--p-fg-soft)]">
                Quando o YouTube perguntar quem pode ver, escolha{" "}
                <strong>Não listado</strong>. Assim só quem tem o link (seus
                alunos, aqui na plataforma) consegue assistir — o vídeo não
                aparece em buscas nem no seu canal.
              </p>
            </li>
            <li className="flex gap-3">
              <StepNumber>3</StepNumber>
              <p className="text-[13px] sm:text-[14px] leading-relaxed text-[color:var(--p-fg-soft)]">
                Copie o link do vídeo e cole no campo abaixo.
              </p>
            </li>
          </ol>

          <p className="mt-4 rounded-xl bg-white border border-[color:var(--p-hairline)] px-3 py-2.5 text-[12px] sm:text-[13px] leading-relaxed text-[color:var(--p-accent)]">
            Não escolha <strong>“Privado”</strong>: nessa opção nem os seus
            alunos conseguem ver o vídeo.
          </p>
        </div>

        <div className="mt-4">
          <Field
            label="Link do vídeo"
            hint="Cole aqui o link copiado do YouTube. Pode deixar em branco e adicionar depois."
          >
            <TextInput
              type="url"
              inputMode="url"
              placeholder="https://youtu.be/…"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </Field>
        </div>

        {legacyPath && (
          <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-[color:var(--p-hairline)] bg-[color:var(--p-surface-2)] px-3 sm:px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 min-w-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-[color:var(--p-hairline)] text-[color:var(--p-muted)]">
                <Icon name="film" size={16} />
              </span>
              <p className="text-[12px] sm:text-[13px] leading-relaxed text-[color:var(--p-muted)]">
                Esta aula tem um vídeo enviado ao Storage (plano antigo). Ele tem
                prioridade sobre o link. Remova-o para usar o link acima.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={removeLegacyVideo}
              className="w-full sm:w-auto shrink-0"
            >
              <Icon name="trash" size={14} />
              Remover vídeo enviado
            </Button>
          </div>
        )}
      </div>

      {err && (
        <p className="mt-4 text-[13px] text-[color:var(--p-accent)]">{err}</p>
      )}

      <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-2">
        <Button onClick={save} className="w-full sm:w-auto">
          Salvar aula
        </Button>
        {onDone && (
          <Button variant="ghost" onClick={onDone} className="w-full sm:w-auto">
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
}
