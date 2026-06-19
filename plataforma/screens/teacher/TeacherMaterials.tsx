"use client";

import { useMemo, useRef, useState } from "react";
import { AuthGuard } from "../../components/AuthGuard";
import { PlatformShell } from "../../components/PlatformShell";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Field, TextArea, TextInput } from "../../components/ui/Input";
import { Icon } from "../../components/ui/Icon";
import { Tag } from "../../components/ui/Tag";
import { usePlatform, uid } from "../../store/PlatformContext";
import { getSupabase } from "../../supabase/client";
import { platformRoutes } from "../../routes";
import type { MaterialSection } from "../../types";
import { MaterialsSkeleton } from "../../components/skeletons/MaterialsSkeleton";
import { formatBytes } from "./materialUtils";

const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50MB por arquivo

/** Caminho seguro no bucket: <sectionId>/<uuid>-<nome-higienizado>. */
function buildStoragePath(sectionId: string, fileName: string): string {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(-80);
  return `${sectionId}/${uid()}-${safe}`;
}

export function TeacherMaterials() {
  return (
    <AuthGuard role="professor" fallback={<MaterialsSkeleton />}>
      <PlatformShell
        title="Materiais"
        back={{ href: platformRoutes.professor.home, label: "Painel" }}
      >
        <Inner />
      </PlatformShell>
    </AuthGuard>
  );
}

function Inner() {
  const {
    content,
    upsertMaterialSection,
    removeMaterialSection,
    reorderMaterialSection,
  } = usePlatform();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<MaterialSection | null>(null);

  const sections = useMemo(
    () =>
      [...content.materialSections].sort((a, b) => a.order - b.order),
    [content.materialSections],
  );

  return (
    <div className="p-fade-in">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl min-w-0">
          <h1 className="text-[clamp(1.75rem,5.5vw,2.75rem)] leading-[1.05] font-semibold tracking-[-0.03em]">
            Materiais
          </h1>
          <p className="mt-3 text-[14px] sm:text-[16px] leading-relaxed text-[color:var(--p-muted)]">
            Crie seções, anexe arquivos (PDF, áudio, imagem, planilha) e
            organize a ordem em que o aluno deve acessá-los.
          </p>
        </div>

        {!creating && !editing && (
          <Button
            onClick={() => setCreating(true)}
            className="self-start sm:self-end"
          >
            <Icon name="plus" size={14} />
            Nova seção
          </Button>
        )}
      </header>

      {(creating || editing) && (
        <section className="mt-8">
          <SectionEditor
            existing={editing ?? undefined}
            onDone={() => {
              setCreating(false);
              setEditing(null);
            }}
            onSave={(s) => {
              upsertMaterialSection(s);
              setCreating(false);
              setEditing(null);
            }}
          />
        </section>
      )}

      <section className="mt-10 space-y-4 sm:space-y-5">
        {sections.length === 0 ? (
          <EmptyState
            icon="folder"
            title="Nenhuma seção criada"
            description="Crie a primeira seção para começar a organizar os materiais."
            action={
              !creating && (
                <Button onClick={() => setCreating(true)}>
                  Criar seção
                </Button>
              )
            }
          />
        ) : (
          sections.map((section, idx) => (
            <SectionCard
              key={section.id}
              section={section}
              isFirst={idx === 0}
              isLast={idx === sections.length - 1}
              onEdit={() => {
                setEditing(section);
                setCreating(false);
              }}
              onRemove={() => {
                if (
                  confirm(
                    `Remover a seção "${section.title}"? Todos os arquivos dentro dela serão apagados.`,
                  )
                ) {
                  removeMaterialSection(section.id);
                }
              }}
              onMoveUp={() => reorderMaterialSection(section.id, "up")}
              onMoveDown={() => reorderMaterialSection(section.id, "down")}
            />
          ))
        )}
      </section>
    </div>
  );
}

function SectionEditor({
  existing,
  onSave,
  onDone,
}: {
  existing?: MaterialSection;
  onSave: (s: MaterialSection) => void;
  onDone: () => void;
}) {
  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [error, setError] = useState<string | null>(null);

  function save() {
    if (!title.trim()) {
      setError("Dê um nome para a seção.");
      return;
    }
    onSave({
      id: existing?.id ?? "",
      title: title.trim(),
      description: description.trim(),
      order: existing?.order ?? 0,
      createdAt: existing?.createdAt ?? Date.now(),
    });
  }

  return (
    <div className="p-card p-5 sm:p-7 lg:p-8">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-[17px] sm:text-[18px] font-semibold tracking-tight">
          {existing ? "Editar seção" : "Nova seção"}
        </h2>
      </div>

      <div className="mt-5 grid gap-4">
        <Field label="Nome da seção" error={error ?? undefined}>
          <TextInput
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: Vocabulário essencial"
          />
        </Field>
        <Field
          label="Descrição (opcional)"
          hint="Aparece para o aluno como subtítulo da seção."
        >
          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Comece por aqui antes da próxima aula gravada."
          />
        </Field>
      </div>

      <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center gap-2 sm:gap-3 sm:justify-end">
        <Button variant="ghost" onClick={onDone} className="w-full sm:w-auto">
          Cancelar
        </Button>
        <Button onClick={save} className="w-full sm:w-auto">
          {existing ? "Salvar alterações" : "Criar seção"}
        </Button>
      </div>
    </div>
  );
}

function SectionCard({
  section,
  isFirst,
  isLast,
  onEdit,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  section: MaterialSection;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const {
    materialsBySection,
    addMaterial,
    renameMaterial,
    removeMaterial,
    reorderMaterial,
  } = usePlatform();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const items = materialsBySection(section.id);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    const errors: string[] = [];
    try {
      const supabase = getSupabase();
      for (const file of Array.from(files)) {
        if (file.size > MAX_FILE_BYTES) {
          errors.push(`"${file.name}" passa de 50MB.`);
          continue;
        }
        const storagePath = buildStoragePath(section.id, file.name);
        const { error } = await supabase.storage
          .from("materials")
          .upload(storagePath, file, {
            contentType: file.type || "application/octet-stream",
            upsert: false,
          });
        if (error) {
          errors.push(`"${file.name}": ${error.message}`);
          continue;
        }
        addMaterial(section.id, {
          displayName: file.name,
          fileName: file.name,
          mime: file.type || "application/octet-stream",
          size: file.size,
          storagePath,
        });
      }
    } catch {
      errors.push("Erro inesperado ao enviar. Tente novamente.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    setUploadError(errors.length ? errors.join(" · ") : null);
  }

  return (
    <div className="p-card p-5 sm:p-7 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag tone="neutral">
              Seção {section.order + 1}
            </Tag>
            <Tag tone="accent">
              {items.length} {items.length === 1 ? "arquivo" : "arquivos"}
            </Tag>
          </div>
          <h3 className="mt-3 text-[18px] sm:text-[20px] font-semibold tracking-tight break-words">
            {section.title}
          </h3>
          {section.description && (
            <p className="mt-1.5 text-[13px] sm:text-[14px] leading-relaxed text-[color:var(--p-muted)]">
              {section.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          <IconButton
            label="Mover para cima"
            disabled={isFirst}
            onClick={onMoveUp}
          >
            <Icon name="chevron-up" size={16} />
          </IconButton>
          <IconButton
            label="Mover para baixo"
            disabled={isLast}
            onClick={onMoveDown}
          >
            <Icon name="chevron-down" size={16} />
          </IconButton>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Editar
          </Button>
          <Button variant="danger" size="sm" onClick={onRemove}>
            <Icon name="trash" size={14} />
            Excluir
          </Button>
        </div>
      </div>

      <div className="mt-6 border-t border-[color:var(--p-hairline)] pt-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.16em] text-[color:var(--p-muted)]">
            Arquivos
          </p>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full sm:w-auto"
            >
              <Icon name="upload" size={14} />
              {uploading ? "Enviando…" : "Anexar arquivo"}
            </Button>
          </div>
        </div>

        {uploadError && (
          <p className="mt-3 text-[12px] text-[color:var(--p-accent)]">
            {uploadError}
          </p>
        )}

        {items.length === 0 ? (
          <p className="mt-4 text-[13px] text-[color:var(--p-muted)]">
            Nenhum arquivo ainda. Anexe PDFs, imagens, áudios ou planilhas.
          </p>
        ) : (
          <ul className="mt-4 grid gap-2">
            {items.map((m, i) => (
              <li
                key={m.id}
                className="flex items-center gap-3 rounded-2xl border border-[color:var(--p-hairline)] bg-white px-3 sm:px-4 py-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[color:var(--p-surface)] text-[color:var(--p-muted)]">
                  <Icon name="document" size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-[color:var(--p-fg)]">
                    {m.displayName}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-[color:var(--p-muted)]">
                    {m.fileName} · {formatBytes(m.size)}
                    {m.mime ? ` · ${m.mime}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <IconButton
                    label="Mover para cima"
                    disabled={i === 0}
                    onClick={() => reorderMaterial(m.id, "up")}
                  >
                    <Icon name="chevron-up" size={14} />
                  </IconButton>
                  <IconButton
                    label="Mover para baixo"
                    disabled={i === items.length - 1}
                    onClick={() => reorderMaterial(m.id, "down")}
                  >
                    <Icon name="chevron-down" size={14} />
                  </IconButton>
                  <IconButton
                    label="Renomear"
                    onClick={() => {
                      const next = prompt(
                        "Novo nome para o arquivo:",
                        m.displayName,
                      );
                      if (next != null) renameMaterial(m.id, next);
                    }}
                  >
                    <Icon name="pencil" size={14} />
                  </IconButton>
                  <IconButton
                    label="Remover arquivo"
                    onClick={() => {
                      if (confirm(`Remover "${m.displayName}"?`)) {
                        removeMaterial(m.id);
                      }
                    }}
                  >
                    <Icon name="trash" size={14} />
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function IconButton({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--p-hairline)] bg-white text-[color:var(--p-muted)] transition-colors hover:text-[color:var(--p-fg)] disabled:opacity-40 disabled:pointer-events-none"
    >
      {children}
    </button>
  );
}
