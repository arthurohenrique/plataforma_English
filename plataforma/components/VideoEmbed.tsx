"use client";

import { Icon } from "./ui/Icon";

function toYoutubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v");
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
      if (u.pathname.startsWith("/embed/")) return url;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.replace("/", "");
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    return null;
  } catch {
    return null;
  }
}

export function VideoEmbed({ url, title }: { url: string; title?: string }) {
  if (!url) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[color:var(--p-hairline-strong)] bg-[color:var(--p-surface-2)] px-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-[color:var(--p-hairline)] text-[color:var(--p-muted)]">
          <Icon name="film" size={22} />
        </span>
        <p className="text-[13px] sm:text-[14px] font-medium text-[color:var(--p-fg)]">
          Vídeo ainda não anexado
        </p>
        <p className="max-w-xs text-[12px] text-[color:var(--p-muted)]">
          O professor pode adicionar o vídeo desta aula a qualquer momento.
        </p>
      </div>
    );
  }

  const embed = toYoutubeEmbed(url);

  if (!embed) {
    // Fallback: try native video, else link
    const isVideoFile = /\.(mp4|webm|ogg|mov)$/i.test(url);
    if (isVideoFile) {
      return (
        <video
          controls
          className="w-full aspect-video rounded-2xl border border-[color:var(--p-hairline)] bg-black"
          src={url}
        />
      );
    }
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex aspect-video w-full items-center justify-center rounded-2xl border border-[color:var(--p-hairline)] bg-[color:var(--p-surface-2)] text-[13px] text-[color:var(--p-fg)] hover:bg-[color:var(--p-surface)] transition-colors"
      >
        Abrir vídeo em nova aba ↗
      </a>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-[color:var(--p-hairline)] bg-black">
      <iframe
        src={embed}
        title={title || "Aula"}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
