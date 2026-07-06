-- =====================================================================
-- 0003 — Adaptação ao plano FREE do Supabase
-- ---------------------------------------------------------------------
-- Roda em bancos que já aplicaram 0001 + 0002. Idempotente.
--
-- COMO USAR: SQL Editor → cole este arquivo → Run.
--
-- Contexto: o projeto foi configurado no plano PRO (vídeo de aula até 500MB
-- no Storage). No plano FREE isso é inviável:
--   • upload por arquivo:  teto GLOBAL de 50MB (o file_size_limit do bucket
--                          não vale acima disso, independente do que estiver lá)
--   • storage total:       1GB
--   • egress (saída):      5GB/mês  → streaming de vídeo esgota rápido
--   • inatividade:         projeto PAUSA após ~7 dias sem uso (só reativa manual)
--
-- Decisão: vídeo das aulas passa a ser LINK EXTERNO (YouTube não listado /
-- Vimeo) — hospedagem grátis e ilimitada, zero storage/egress do Supabase.
-- O Storage guarda só materiais (PDF/áudio/imagem), todos < 50MB.
--
-- O que este arquivo faz:
--   1. Baixa o file_size_limit do bucket "materials" para 50MB (deixa o teto
--      do bucket coerente com o teto real do plano — erro de upload mais claro).
--
-- OBS: a coluna checkpoints.video_path é MANTIDA (aulas antigas com vídeo no
-- Storage continuam tocando até o professor removê-las e colar um link).
-- =====================================================================

update storage.buckets
  set file_size_limit = 52428800   -- 50MB (teto do plano free)
  where id = 'materials';
