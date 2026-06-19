-- =====================================================================
-- 0002 — Upload de vídeo nas aulas gravadas (checkpoints)
-- ---------------------------------------------------------------------
-- Roda em bancos que já aplicaram o 0001. Idempotente.
--
-- COMO USAR: SQL Editor → cole este arquivo → Run.
--
-- O que faz:
--   1. Adiciona a coluna checkpoints.video_path (caminho do vídeo enviado
--      pelo professor no bucket "materials" do Storage).
--   2. Sobe o limite de tamanho do bucket "materials" para 500MB, para
--      comportar vídeos de aula (além de PDFs/áudios).
--
-- OBS: no plano FREE do Supabase o teto global de upload é 50MB e este
-- limite por bucket não tem efeito acima disso; em planos pagos vale até 50GB.
-- =====================================================================

alter table public.checkpoints
  add column if not exists video_path text not null default '';

update storage.buckets
  set file_size_limit = 524288000   -- 500MB
  where id = 'materials' and coalesce(file_size_limit, 0) < 524288000;
