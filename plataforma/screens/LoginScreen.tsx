"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePlatform } from "../store/PlatformContext";
import { platformRoutes } from "../routes";
import { Button } from "../components/ui/Button";
import { Field, TextInput } from "../components/ui/Input";
import { Icon, type IconName } from "../components/ui/Icon";
import { LoginSkeleton } from "../components/skeletons/LoginSkeleton";
import type { Role } from "../types";

export function LoginScreen() {
  const router = useRouter();
  const { ready, auth, login } = usePlatform();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<Role>("aluno");

  useEffect(() => {
    if (!ready) return;
    if (auth) {
      router.replace(
        auth.role === "professor"
          ? platformRoutes.professor.home
          : platformRoutes.aluno.home,
      );
    }
  }, [ready, auth, router]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    login(username || "Convidado", role);
  }

  // While hydrating from localStorage, or if we already have a session and
  // are about to redirect, show a skeleton instead of a flash of the form.
  if (!ready || auth) {
    return <LoginSkeleton />;
  }

  return (
    <div className="p-bg-radial min-h-[100dvh] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md p-fade-in">
        <div className="flex items-center gap-2 justify-center">
          <span className="inline-block h-7 w-7 rounded-full bg-[color:var(--p-fg)]" />
          <span className="text-[16px] font-semibold tracking-tight">
            Oxford Particular
          </span>
        </div>

        <h1 className="mt-8 text-center text-[40px] sm:text-[48px] leading-[1.05] font-semibold tracking-[-0.03em]">
          Bem-vindo.
        </h1>
        <p className="mt-3 text-center text-[16px] leading-relaxed text-[color:var(--p-muted)]">
          Entre como aluno ou professor para acessar a plataforma.
        </p>

        <form onSubmit={submit} className="mt-10 p-card p-7 sm:p-8 space-y-5">
          <Field label="Nome de usuário">
            <TextInput
              autoFocus
              placeholder="Digite seu nome"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Field>

          <div>
            <p className="text-[13px] font-medium mb-2">Perfil de acesso</p>
            <div className="grid grid-cols-2 gap-2">
              <RoleOption
                selected={role === "aluno"}
                onSelect={() => setRole("aluno")}
                title="Aluno"
                desc="Estudar e resolver desafios"
                icon="user"
              />
              <RoleOption
                selected={role === "professor"}
                onSelect={() => setRole("professor")}
                title="Professor"
                desc="Criar e gerenciar conteúdo"
                icon="presenter"
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full">
            Entrar na plataforma
          </Button>
        </form>

        <p className="mt-6 text-center text-[12px] text-[color:var(--p-muted)]">
          <a href="/" className="underline-offset-2 hover:underline">
            ← Voltar para o site
          </a>
        </p>
      </div>
    </div>
  );
}

function RoleOption({
  selected,
  onSelect,
  title,
  desc,
  icon,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  desc: string;
  icon: IconName;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-left rounded-2xl border p-4 transition-all ${
        selected
          ? "border-[color:var(--p-fg)] bg-[color:var(--p-surface-2)] shadow-[0_1px_0_rgba(10,37,64,0.05)]"
          : "border-[color:var(--p-hairline)] bg-white hover:bg-[color:var(--p-surface-2)]"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${
            selected
              ? "bg-[color:var(--p-fg)] text-white"
              : "bg-[color:var(--p-surface)] text-[color:var(--p-muted)]"
          }`}
        >
          <Icon name={icon} size={16} />
        </span>
        <span className="text-[14px] font-semibold tracking-tight">{title}</span>
      </div>
      <p className="mt-1 text-[12px] text-[color:var(--p-muted)]">{desc}</p>
    </button>
  );
}
