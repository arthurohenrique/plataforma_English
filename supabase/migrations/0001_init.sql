-- =====================================================================
-- Plataforma de Inglês — schema inicial (Supabase / Postgres)
-- ---------------------------------------------------------------------
-- COMO USAR:
--   1. Abra o SQL Editor do seu projeto Supabase (Dashboard → SQL Editor).
--   2. Cole este arquivo inteiro e clique em "Run".
--   3. Cadastre o(s) e-mail(s) de professor na tabela teacher_emails
--      (veja o bloco no final do arquivo).
--
-- O script é idempotente: pode ser rodado mais de uma vez sem erro.
-- =====================================================================

create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- =====================================================================
-- teacher_emails — allowlist de quem entra como PROFESSOR
-- Lida apenas pelo trigger (security definer). Sem acesso via API.
-- =====================================================================
create table if not exists public.teacher_emails (
  email text primary key
);
alter table public.teacher_emails enable row level security;

-- =====================================================================
-- profiles — 1:1 com auth.users, guarda papel (aluno/professor) + nome
-- =====================================================================
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role         text not null default 'aluno' check (role in ('aluno','professor')),
  created_at   timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- Helper: o usuário atual é professor? (security definer → ignora RLS,
-- evitando recursão na policy de profiles)
create or replace function public.is_professor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'professor'
  );
$$;

-- Cria o profile automaticamente quando um usuário se registra.
-- Papel = 'professor' se o e-mail estiver em teacher_emails, senão 'aluno'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_name text;
begin
  if exists (
    select 1 from public.teacher_emails
    where lower(email) = lower(new.email)
  ) then
    v_role := 'professor';
  else
    v_role := 'aluno';
  end if;

  v_name := coalesce(
    nullif(new.raw_user_meta_data->>'name', ''),
    nullif(new.raw_user_meta_data->>'full_name', ''),
    split_part(coalesce(new.email, 'aluno'), '@', 1)
  );

  insert into public.profiles (id, display_name, role)
  values (new.id, v_name, v_role)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop policy if exists "profiles_select_own_or_professor" on public.profiles;
create policy "profiles_select_own_or_professor" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_professor());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- =====================================================================
-- Conteúdo do professor (global): checkpoints, seções e materiais
-- Leitura: qualquer autenticado.  Escrita: só professor.
-- =====================================================================
create table if not exists public.checkpoints (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text not null default '',
  video_url    text not null default '',
  video_path   text not null default '',
  duration_min int,
  "order"      int not null default 0,
  created_at   timestamptz not null default now()
);
alter table public.checkpoints enable row level security;

drop policy if exists "checkpoints_select_all" on public.checkpoints;
create policy "checkpoints_select_all" on public.checkpoints
  for select to authenticated using (true);

drop policy if exists "checkpoints_write_professor" on public.checkpoints;
create policy "checkpoints_write_professor" on public.checkpoints
  for all to authenticated
  using (public.is_professor())
  with check (public.is_professor());

create table if not exists public.material_sections (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null default '',
  "order"     int not null default 0,
  created_at  timestamptz not null default now()
);
alter table public.material_sections enable row level security;

drop policy if exists "material_sections_select_all" on public.material_sections;
create policy "material_sections_select_all" on public.material_sections
  for select to authenticated using (true);

drop policy if exists "material_sections_write_professor" on public.material_sections;
create policy "material_sections_write_professor" on public.material_sections
  for all to authenticated
  using (public.is_professor())
  with check (public.is_professor());

create table if not exists public.materials (
  id           uuid primary key default gen_random_uuid(),
  section_id   uuid not null references public.material_sections(id) on delete cascade,
  display_name text not null,
  file_name    text not null,
  mime         text not null default 'application/octet-stream',
  size         bigint not null default 0,
  storage_path text not null,
  "order"      int not null default 0,
  created_at   timestamptz not null default now()
);
alter table public.materials enable row level security;
create index if not exists materials_section_id_idx on public.materials(section_id);

drop policy if exists "materials_select_all" on public.materials;
create policy "materials_select_all" on public.materials
  for select to authenticated using (true);

drop policy if exists "materials_write_professor" on public.materials;
create policy "materials_write_professor" on public.materials
  for all to authenticated
  using (public.is_professor())
  with check (public.is_professor());

-- =====================================================================
-- Flashcards — decks privados por usuário (sem overlap entre alunos)
-- =====================================================================
create table if not exists public.decks (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  owner_scope text not null check (owner_scope in ('aluno','professor')),
  name        text not null,
  description text not null default '',
  accent      text not null default '#C8102E',
  created_at  timestamptz not null default now()
);
alter table public.decks enable row level security;
create index if not exists decks_owner_id_idx on public.decks(owner_id);

drop policy if exists "decks_owner_all" on public.decks;
create policy "decks_owner_all" on public.decks
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create table if not exists public.flashcards (
  id               uuid primary key default gen_random_uuid(),
  deck_id          uuid not null references public.decks(id) on delete cascade,
  front            text not null,
  back             text not null,
  interval         int not null default 0,
  repetitions      int not null default 0,
  due_at           timestamptz not null default now(),
  last_reviewed_at timestamptz,
  created_at       timestamptz not null default now()
);
alter table public.flashcards enable row level security;
create index if not exists flashcards_deck_id_idx on public.flashcards(deck_id);

drop policy if exists "flashcards_owner_all" on public.flashcards;
create policy "flashcards_owner_all" on public.flashcards
  for all to authenticated
  using (exists (
    select 1 from public.decks d
    where d.id = deck_id and d.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.decks d
    where d.id = deck_id and d.owner_id = auth.uid()
  ));

-- =====================================================================
-- Progresso do aluno — quais aulas (checkpoints) já assistiu
-- =====================================================================
create table if not exists public.watched_checkpoints (
  user_id       uuid not null references auth.users(id) on delete cascade,
  checkpoint_id uuid not null references public.checkpoints(id) on delete cascade,
  watched_at    timestamptz not null default now(),
  primary key (user_id, checkpoint_id)
);
alter table public.watched_checkpoints enable row level security;

drop policy if exists "watched_owner_all" on public.watched_checkpoints;
create policy "watched_owner_all" on public.watched_checkpoints
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- =====================================================================
-- Storage — bucket privado "materials"
-- Leitura: qualquer autenticado (download por signed URL).
-- Escrita: só professor.
-- =====================================================================
-- file_size_limit: 500MB — comporta vídeos de aulas gravadas além de PDFs/áudios.
-- (No plano free do Supabase o teto global de upload é 50MB; em planos pagos
--  este limite por bucket vale até 50GB.)
insert into storage.buckets (id, name, public, file_size_limit)
values ('materials', 'materials', false, 524288000)
on conflict (id) do nothing;

update storage.buckets
  set file_size_limit = 524288000
  where id = 'materials' and coalesce(file_size_limit, 0) < 524288000;

drop policy if exists "materials_read_authenticated" on storage.objects;
create policy "materials_read_authenticated" on storage.objects
  for select to authenticated
  using (bucket_id = 'materials');

drop policy if exists "materials_insert_professor" on storage.objects;
create policy "materials_insert_professor" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'materials' and public.is_professor());

drop policy if exists "materials_update_professor" on storage.objects;
create policy "materials_update_professor" on storage.objects
  for update to authenticated
  using (bucket_id = 'materials' and public.is_professor())
  with check (bucket_id = 'materials' and public.is_professor());

drop policy if exists "materials_delete_professor" on storage.objects;
create policy "materials_delete_professor" on storage.objects
  for delete to authenticated
  using (bucket_id = 'materials' and public.is_professor());

-- =====================================================================
-- >>> CADASTRE AQUI OS PROFESSORES <<<
-- Troque o e-mail abaixo pelo(s) seu(s). Quem não estiver aqui entra
-- como ALUNO. Pode rodar este insert quantas vezes quiser.
-- =====================================================================
-- insert into public.teacher_emails (email) values
--   ('professor@exemplo.com')
-- on conflict (email) do nothing;
