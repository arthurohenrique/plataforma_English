"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Aula } from "@/lib/types";

type VideoPlayerProps = {
  aula: Aula;
  onProgressSave?: (seconds: number, completed: boolean) => void;
};

export function VideoPlayer({ aula, onProgressSave }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const content = useMemo(() => {
    if (aula.video_tipo === "youtube" || aula.video_tipo === "vimeo" || aula.video_tipo === "externo") {
      return (
        <iframe
          src={aula.video_url}
          className="h-full w-full rounded-xl"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          title={aula.titulo}
        />
      );
    }

    return (
      <video
        ref={videoRef}
        src={aula.video_url}
        controls
        className="h-full w-full rounded-xl bg-black"
        onTimeUpdate={(event) => {
          if (!onProgressSave) return;
          if (debounceRef.current) clearTimeout(debounceRef.current);
          const current = event.currentTarget.currentTime;
          const duration = event.currentTarget.duration || aula.duracao_segundos || 1;
          const completed = current / duration >= 0.9;
          debounceRef.current = setTimeout(() => onProgressSave(Math.floor(current), completed), 5000);
        }}
      />
    );
  }, [aula, onProgressSave]);

  return <div className="aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">{content}</div>;
}
