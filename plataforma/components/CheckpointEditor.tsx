"use client";

import { useRef, useState } from "react";
import type { Checkpoint } from "../types";
import { usePlatform, uid } from "../store/PlatformContext";
import { getSupabase } from "../supabase/client";
import { Button } from "./ui/Button";
import { Field, TextArea, TextInput } from "./ui/Input";
import { Tag } from "./ui/Tag";
import { Icon } from "./ui/Icon";

const MAX_VIDEO_BYTES = 500 * 1024 * 1024; // 500MB por vídeo

/** Caminho seguro no bucket: checkpoints/<checkpointId>/<uuid>-<nome>. */
function buildVideoPath(checkpointId: string, fileName: string): string {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(-80);
  return `checkpoints/${checkpointId}/${uid()}-${safe}`;
}

export function CheckpointEditor({
  existing,
  onDone,
}: {
  existing?: Checkpoint;
  onDone?: () => void;
}) {
  const { upsertCheckpoint, content } = usePlatform();

  // id fixado no mount: usado tanto no upload (caminho do Storage) quanto no save.
  const [id] = useState(existing?.id || uid("c"));
  const [title, setTitle] = useState(existing?.title || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [videoPath, setVideoPath] = useState(existing?.videoPath || "");
  const [videoName, setVideoName] = useState("");
  const [durationMin, setDurationMin] = useState<string>(
    existing?.durationMin ? String(existing.durationMin) : "",
  );
  const [err, setErr] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploadError(null);
    if (!file.type.startsWith("video/")) {
      setUploadError("Selecione um arquivo de vídeo.");
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setUploadError("O vídeo passa de 500MB.");
      return;
    }
    setUploading(true);
    try {
      const supabase = getSupabase();
      const newPath = buildVideoPath(id, file.name);
      const { error } = await supabase.storage
        .from("materials")
        .upload(newPath, file, {
          contentType: file.type || "video/mp4",
          upsert: false,
        });
      if (error) {
        setUploadError(error.message);
        return;
      }
      // Remove o vídeo anterior (se houver) ao substituir.
      const oldPath = videoPath;
      setVideoPath(newPath);
      setVideoName(file.name);
      if (oldPath && oldPath !== newPath) {
        await supabase.storage.from("materials").remove([oldPath]);
      }
    } catch {
      setUploadError("Erro inesperado ao enviar. Tente novamente.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function removeVideo() {
    if (!videoPath) return;
    const path = videoPath;
    setVideoPath("");
    setVideoName("");
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
      videoUrl: existing?.videoUrl || "",
      videoPath: videoPath || undefined,
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

      <div className="mt-4">
        <Field
          label="Vídeo da aula"
          hint="Envie o arquivo de vídeo (MP4, WebM, MOV) — até 500MB. Você pode deixar em branco e anexar depois."
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            hidden
            onChange={(e) => handleFile(e.target.files)}
          />
          {videoPath ? (
            <div className="flex items-center gap-3 rounded-2xl border border-[color:var(--p-hairline)] bg-white px-3 sm:px-4 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[color:var(--p-surface)] text-[color:var(--p-muted)]">
                <Icon name="film" size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-[color:var(--p-fg)]">
                  {videoName || "Vídeo anexado"}
                </p>
                <p className="mt-0.5 text-[11px] text-[color:var(--p-success)]">
                  Pronto para publicar
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? "Enviando…" : "Trocar"}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={removeVideo}
                  disabled={uploading}
                >
                  <Icon name="trash" size={14} />
                  Remover
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[color:var(--p-hairline-strong)] bg-[color:var(--p-surface-2)] px-6 py-8 text-center transition-colors hover:bg-[color:var(--p-surface)] disabled:opacity-60"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-[color:var(--p-hairline)] text-[color:var(--p-muted)]">
                <Icon name="upload" size={20} />
              </span>
              <span className="text-[14px] font-medium text-[color:var(--p-fg)]">
                {uploading ? "Enviando vídeo…" : "Enviar vídeo da aula"}
              </span>
              <span className="text-[12px] text-[color:var(--p-muted)]">
                MP4, WebM ou MOV · até 500MB
              </span>
            </button>
          )}
        </Field>
        {uploadError && (
          <p className="mt-2 text-[13px] text-[color:var(--p-accent)]">
            {uploadError}
          </p>
        )}
      </div>

      {err && (
        <p className="mt-4 text-[13px] text-[color:var(--p-accent)]">{err}</p>
      )}

      <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-2">
        <Button onClick={save} disabled={uploading} className="w-full sm:w-auto">
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
