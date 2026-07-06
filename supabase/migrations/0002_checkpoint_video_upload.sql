-- =====================================================================
-- 0002 — Upload de vídeo nas aulas gravadas (checkpoints)
-- ---------------------------------------------------------------------
-- Roda em bancos que já aplicaram o 0001. Idempotente.
--
-- COMO USAR: SQL Editor → cole este arquivo → Run.
--
-- O que faz:
--   1. Adiciona a coluna checkpoints.video_path (caminho do vídeo LEGADO
--      enviado ao bucket "materials" no plano pago). Mantida para não quebrar
--      aulas antigas; no plano FREE o vídeo novo é link externo (§6.6).
--
-- OBS: o limite do bucket é fixado em 50MB pela migração 0003 (teto do plano
-- FREE). Este arquivo não mexe mais no file_size_limit.
-- =====================================================================

alter table public.checkpoints
  add column if not exists video_path text not null default '';
