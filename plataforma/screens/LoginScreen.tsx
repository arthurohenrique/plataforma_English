"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePlatform } from "../store/PlatformContext";
import { platformRoutes } from "../routes";
import { Button } from "../components/ui/Button";
import { Field, TextInput } from "../components/ui/Input";
import { LoginSkeleton } from "../components/skeletons/LoginSkeleton";

type Mode = "signin" | "signup";

export function LoginScreen() {
  const router = useRouter();
  const {
    ready,
    auth,
    configError,
    signInWithPassword,
    signUpWithPassword,
    signInWithGoogle,
  } = usePlatform();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email.trim()) {
      setError("Informe seu e-mail.");
      return;
    }
    if (password.length < 6) {
      setError("A senha precisa ter ao menos 6 caracteres.");
      return;
    }

    setBusy(true);
    const result =
      mode === "signin"
        ? await signInWithPassword(email, password)
        : await signUpWithPassword(email, password);
    setBusy(false);

    if (result.error) {
      setError(translateError(result.error));
      return;
    }
    if (result.info) {
      setInfo(result.info);
      return;
    }
    // Sucesso com sessão: o redirect acontece no useEffect quando `auth` muda.
  }

  async function google() {
    setError(null);
    setInfo(null);
    setBusy(true);
    const result = await signInWithGoogle();
    if (result.error) {
      setBusy(false);
      setError(translateError(result.error));
    }
    // Em caso de sucesso o navegador é redirecionado para o Google.
  }

  // Enquanto hidrata, ou se já há sessão (prestes a redirecionar), mostra
  // skeleton em vez do flash do formulário.
  if (!ready || auth) {
    return <LoginSkeleton />;
  }

  return (
    <div
      className="p-bg-radial min-h-[100dvh] flex items-center justify-center px-4 sm:px-6 py-10 sm:py-12"
      style={{
        paddingTop: "calc(2.5rem + env(safe-area-inset-top))",
        paddingBottom: "calc(2.5rem + env(safe-area-inset-bottom))",
      }}
    >
      <div className="w-full max-w-md p-fade-in">
        <div className="flex items-center gap-2 justify-center">
          <img
            src="/logo.svg"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 rounded-lg"
          />
          <span className="text-[15px] sm:text-[16px] font-semibold tracking-tight">
            Reinaldo Montes
          </span>
        </div>

        <h1 className="mt-6 sm:mt-8 text-center text-[clamp(2rem,7vw,3rem)] leading-[1.05] font-semibold tracking-[-0.03em]">
          {mode === "signin" ? "Bem-vindo." : "Criar conta."}
        </h1>
        <p className="mt-3 text-center text-[14px] sm:text-[16px] leading-relaxed text-[color:var(--p-muted)]">
          {mode === "signin"
            ? "Entre para acessar a plataforma."
            : "Cadastre-se com seu e-mail para começar a estudar."}
        </p>

        {configError && (
          <p className="mt-6 rounded-2xl border border-[color:var(--p-hairline)] bg-[color:var(--p-accent-soft)] px-4 py-3 text-center text-[13px] text-[color:var(--p-accent)]">
            {configError}
          </p>
        )}

        <div className="mt-8 sm:mt-10 p-card p-5 sm:p-7 lg:p-8">
          <button
            type="button"
            onClick={google}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2.5 rounded-full border border-[color:var(--p-hairline)] bg-white px-4 h-11 text-[14px] font-medium tracking-tight transition-all hover:bg-[color:var(--p-surface-2)] hover:-translate-y-[1px] disabled:opacity-50 disabled:pointer-events-none"
          >
            <GoogleMark />
            Continuar com Google
          </button>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-[color:var(--p-hairline)]" />
            <span className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--p-muted)]">
              ou
            </span>
            <span className="h-px flex-1 bg-[color:var(--p-hairline)]" />
          </div>

          <form onSubmit={submit} className="space-y-5">
            <Field label="E-mail">
              <TextInput
                type="email"
                autoComplete="email"
                placeholder="voce@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Senha">
              <TextInput
                type="password"
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                placeholder="Pelo menos 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>

            {error && (
              <p className="text-[13px] text-[color:var(--p-accent)]">{error}</p>
            )}
            {info && (
              <p className="text-[13px] text-[color:var(--p-success)]">{info}</p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy
                ? "Aguarde…"
                : mode === "signin"
                  ? "Entrar na plataforma"
                  : "Criar conta"}
            </Button>
          </form>

          <p className="mt-5 text-center text-[13px] text-[color:var(--p-muted)]">
            {mode === "signin" ? "Ainda não tem conta?" : "Já tem conta?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
                setInfo(null);
              }}
              className="font-medium text-[color:var(--p-fg)] underline-offset-2 hover:underline"
            >
              {mode === "signin" ? "Criar conta" : "Entrar"}
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-[12px] text-[color:var(--p-muted)]">
          <a href="/" className="underline-offset-2 hover:underline">
            ← Voltar para o site
          </a>
        </p>
      </div>
    </div>
  );
}

function translateError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "E-mail ou senha incorretos.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Este e-mail já tem conta. Tente entrar.";
  if (m.includes("email not confirmed"))
    return "E-mail ainda não confirmado. Verifique sua caixa de entrada.";
  if (m.includes("password")) return "Senha inválida (mínimo 6 caracteres).";
  return message;
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.01-2.34z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}
