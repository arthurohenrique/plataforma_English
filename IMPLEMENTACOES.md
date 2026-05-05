# Documentacao de Implementacoes

## Visao geral
Este documento registra tudo que foi implementado no projeto para permitir continuidade por futuros agentes IA sem perda de contexto.

## Escopo entregue nesta iteracao
- Bootstrap completo do projeto Next.js com App Router.
- Configuracao de TypeScript, Tailwind, lint e scripts NPM.
- Landing page publica completa com identidade visual e animacoes sutis.
- Estrutura de autenticacao e protecao de rotas com Supabase (client/server/middleware).
- MVP funcional da area do aluno com:
  - dashboard;
  - listagem de cursos;
  - pagina de curso;
  - player de aula;
  - sidebar hierarquica curso/modulo/aula;
  - progresso visual e persistencia local em estado.
- Estrutura inicial de rotas admin (fundacao para CRUD).
- Migration SQL inicial com schema completo + RLS + trigger.
- Arquivo de variaveis de ambiente de referencia.

## Estrutura criada

### Base de projeto
- `package.json`
- `next.config.ts`
- `tsconfig.json`
- `next-env.d.ts`
- `postcss.config.js`
- `tailwind.config.ts`
- `.gitignore`
- `.env.example`
- `README.md`

### App Router
- `app/layout.tsx`
- `app/globals.css`
- `app/page.tsx`
- `app/login/page.tsx`
- `app/(auth)/layout.tsx`
- `app/(auth)/dashboard/page.tsx`
- `app/(auth)/curso/page.tsx`
- `app/(auth)/curso/[cursoId]/page.tsx`
- `app/(auth)/curso/[cursoId]/[aulaId]/page.tsx`
- `app/(auth)/(admin)/layout.tsx`
- `app/(auth)/(admin)/admin/page.tsx`
- `app/(auth)/(admin)/admin/cursos/page.tsx`
- `app/(auth)/(admin)/admin/cursos/novo/page.tsx`
- `app/(auth)/(admin)/admin/cursos/[cursoId]/page.tsx`
- `app/(auth)/(admin)/admin/cursos/[cursoId]/modulos/novo/page.tsx`
- `app/(auth)/(admin)/admin/cursos/[cursoId]/modulos/[moduloId]/page.tsx`
- `app/(auth)/(admin)/admin/cursos/[cursoId]/modulos/[moduloId]/aulas/nova/page.tsx`
- `app/(auth)/(admin)/admin/cursos/[cursoId]/modulos/[moduloId]/aulas/[aulaId]/page.tsx`
- `app/(auth)/(admin)/admin/alunos/page.tsx`

### Componentes
- `components/landing/LandingPage.tsx`
- `components/plataforma/Sidebar.tsx`
- `components/plataforma/VideoPlayer.tsx`
- `components/plataforma/AulaInfo.tsx`
- `components/plataforma/ProgressBar.tsx`
- `components/plataforma/AulaWorkspace.tsx`

### Lib
- `lib/config/site.ts`
- `lib/types.ts`
- `lib/mock-data.ts`
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/middleware.ts`

### Seguranca e banco
- `middleware.ts`
- `supabase/migrations/0001_initial_schema.sql`

## Decisoes tecnicas aplicadas

### Identidade visual e UX
- Paleta aplicada via tokens no Tailwind:
  - `brandBlue`, `brandRed`, `brandGold`, `brandLight`, `brandText`, `brandFooter`.
- Fontes Google aplicadas no `app/layout.tsx`:
  - `Playfair Display` (titulos)
  - `Inter` (texto/UI)
- Landing organizada por secoes com navegacao por ancora.
- Animacoes sutis implementadas com Framer Motion:
  - fade-in + slide-up em secoes;
  - hover em cards;
  - pulso no CTA principal do formulario.

### Conteudo e placeholders
- Todos os dados de marca/professor foram centralizados em `lib/config/site.ts`.
- Esta centralizacao foi feita para facilitar troca posterior por dados reais sem refatorar componentes.

### Autenticacao e protecao
- `lib/supabase/client.ts`: client browser para login.
- `lib/supabase/server.ts`: client server-side com cookies.
- `lib/supabase/middleware.ts`: sincroniza sessao no middleware.
- `middleware.ts`:
  - protege `/dashboard`, `/curso`, `/admin`;
  - redireciona nao autenticado para `/login`;
  - redireciona autenticado saindo de `/login` para `/dashboard`;
  - aplica gate de role para `/admin` (via `user_metadata.role`).

### Area do aluno (MVP)
- Sidebar hierarquica:
  - cursos expansivos;
  - modulos expansivos;
  - aulas com destaque da atual;
  - indicador de aula concluida (✓);
  - progresso geral do curso.
- Player:
  - `youtube/vimeo/externo` via iframe;
  - `upload` via `<video>`;
  - debounce de 5s para salvar progresso;
  - regra de conclusao em 90% assistido.
- Informacoes da aula:
  - titulo, descricao, materiais;
  - navegacao anterior/proxima.

### Admin (fundacao)
- Rotas e paginas-base criadas para todo o fluxo solicitado.
- Formularios iniciais de curso/modulo/aula preparados para integrar com Supabase.
- Ainda sem persistencia real (fase seguinte).

### Banco Supabase
- Migration completa com:
  - `profiles`, `cursos`, `modulos`, `aulas`, `progresso`, `matriculas`;
  - politicas RLS;
  - trigger `handle_new_user` para auto-criar `profiles`.

## Como substituir placeholders por dados reais
1. Editar `lib/config/site.ts`.
2. Atualizar:
   - `siteName`
   - `professor.fullName`
   - `professor.university`
   - `professor.specialties`
   - `professor.achievements`
   - `contact.whatsappRaw`, `contact.whatsappLabel`, `contact.email`
3. Revisar `components/landing/LandingPage.tsx` caso deseje trocar textos de prova social.

## Integracao real com Supabase (proxima etapa recomendada)
1. Criar projeto Supabase e preencher `.env.local`.
2. Rodar migration `0001_initial_schema.sql`.
3. Trocar `lib/mock-data.ts` por consultas reais (server actions ou route handlers).
4. Implementar CRUD admin completo:
   - cursos;
   - modulos (com ordenacao `@dnd-kit/core`);
   - aulas (upload e materiais).
5. Armazenar progresso do player na tabela `progresso` em tempo real.

## Checklist de continuidade para futuros agentes
- [ ] Conectar paginas do aluno a dados reais do Supabase.
- [ ] Implementar logout real (`supabase.auth.signOut`).
- [ ] Adicionar toasts e validacao zod/react-hook-form nos formularios.
- [ ] Integrar upload para thumbnails/videos/PDFs no Supabase Storage.
- [ ] Concluir CRUD admin e matriculas de alunos.
- [ ] Criar seeds de desenvolvimento.
- [ ] Ajustar telemetria e logs de erro.
- [ ] Adicionar testes (unitarios e E2E).

## Observacoes
- O projeto foi iniciado manualmente por restricao de nome da pasta com letra maiuscula no `create-next-app`.
- Dependencias instaladas em versoes atuais compativeis com App Router.
