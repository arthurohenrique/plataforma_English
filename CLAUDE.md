# CLAUDE.md — Contexto completo para futuros agentes IA

Este documento é o briefing que você (próximo agente trabalhando neste repositório) deve ler **primeiro**. Cobre tudo o que existe hoje, por que existe, e onde encostar para não quebrar nada.

> **Aviso Next.js 16**: o repositório também contém [AGENTS.md](AGENTS.md) com a nota de que esta versão do Next.js tem breaking changes em relação a versões mais antigas. Se você for mexer em APIs do framework (route handlers, params, metadata, fonts, middleware), confira `node_modules/next/dist/docs/` antes de assumir comportamento.

---

## 1. O produto, em uma frase

Site institucional de aulas particulares de inglês com **método Oxford** + uma **plataforma de estudos** acoplada (biblioteca de **materiais** para download organizados pelo professor, **aulas gravadas** em cronologia, e **flashcards** com repetição espaçada). O dono é um professor particular; alunos se cadastram com **login real (Supabase Auth — Google ou e-mail/senha)** e consomem o conteúdo que o professor publica. O papel professor/aluno vem de uma allowlist de e-mails no banco (§6.1).

> ⚠️ **Histórico**: até maio/2026 a plataforma tinha um sistema de "áreas de estudo" com **exercícios/desafios interativos** (múltipla escolha e aberta) criados pelo professor. Esse módulo foi **removido por completo** e substituído pela biblioteca de materiais. Se você for migrar dados antigos, os campos `questions`/`attempts` em `localStorage` são silenciosamente ignorados — veja o `useEffect` de hidratação em [PlatformContext.tsx](plataforma/store/PlatformContext.tsx).

---

## 2. Stack

| Camada | Tecnologia | Por quê |
|---|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) | SSR/SSG nativo, route groups, server/client components |
| Linguagem | **TypeScript** strict | Contratos explícitos no módulo da plataforma |
| Estilos | **Tailwind v4** (CSS-first config) | Velocidade + tokens via `@theme inline` |
| Tipografia | **Inter** via `next/font` | Substituto de SF Pro para o visual Apple |
| Backend | **Supabase** (Postgres + Auth + Storage) | Banco real multiusuário; acessado direto do client via `@supabase/supabase-js` |
| Auth | **Supabase Auth** (Google OAuth + e-mail/senha) | Login real; papel (aluno/professor) por allowlist de e-mails |
| Arquivos | **Supabase Storage** (bucket `materials`, privado) | Upload do professor; download do aluno por signed URL |
| Estado | **React Context** (hidratado do Supabase) | Update otimista local + escrita assíncrona; sem libs externas |
| Build/run | `npm` | Lockfile padrão |

Node version: testado com Node 22. Dependência runtime principal além de `next/react/react-dom`: `@supabase/supabase-js`.

> **Setup obrigatório do Supabase** (uma vez, fora do código): (1) rodar [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql) no SQL Editor; (2) cadastrar e-mail(s) de professor em `teacher_emails`; (3) no dashboard, ativar provider Google, desligar "Confirm email", e configurar Site URL / Redirect URLs; (4) preencher `.env.local` (ver [.env.local.example](.env.local.example)) com `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable). A **secret key nunca** vai pro client — o app só usa a publishable; RLS é a barreira de segurança.

---

## 3. Layout do repositório

```
.
├── app/                     ← Rotas Next.js (App Router)
│   ├── layout.tsx           ← Root: fonts (Inter), metadata, viewport
│   ├── page.tsx             ← Landing page
│   ├── globals.css          ← Tokens da LANDING (cores, fonts)
│   └── plataforma/          ← Casca das rotas da plataforma
│       ├── layout.tsx       ← Importa PlatformProvider + styles.css scoped
│       ├── page.tsx         ← Login
│       ├── loading.tsx      ← Skeletons de transição (um por rota)
│       ├── aluno/
│       │   ├── page.tsx                          → StudentDashboard
│       │   ├── materiais/page.tsx                → StudentMaterials
│       │   ├── aulas/page.tsx                    → StudentClasses
│       │   └── flashcards/
│       │       ├── page.tsx                      → FlashcardsList (scope=aluno)
│       │       └── [deckId]/
│       │           ├── page.tsx                  → DeckOverview
│       │           ├── study/page.tsx            → DeckStudy
│       │           └── cards/page.tsx            → DeckCards
│       └── professor/      ← Espelho exato da estrutura de aluno
│
├── components/             ← UI da LANDING apenas
│   ├── Navbar.tsx · Hero.tsx · Method.tsx · Benefits.tsx
│   ├── Teacher.tsx · Testimonials.tsx · FAQ.tsx
│   ├── FinalCTA.tsx · Footer.tsx · FloatingWhatsApp.tsx
│   └── ui/
│       ├── Container.tsx
│       └── Button.tsx
│
├── lib/
│   └── site.ts             ← Constantes da landing: WhatsApp, nome, etc
│
├── plataforma/             ← ★ MÓDULO AUTOCONTIDO ★
│   ├── index.ts            ← Barrel: exports públicos (telas, tipos, store)
│   ├── types.ts            ← Todos os tipos do domínio
│   ├── routes.ts           ← Path constants tipadas
│   ├── scheduler.ts        ← Lógica do estudo espaçado (puramente funcional)
│   ├── styles.css          ← Tokens scoped em [data-platform]
│   │
│   ├── store/
│   │   ├── PlatformContext.tsx   ← Provider + auth Supabase + ações (optimista + write())
│   │   ├── storage.ts            ← DEPRECATED (era localStorage; stub vazio)
│   │   └── seeds.ts              ← DEPRECATED (seeds removidos; stub vazio)
│   │
│   ├── supabase/
│   │   ├── client.ts             ← Singleton do browser client (publishable key)
│   │   └── mappers.ts            ← row (snake_case/ISO) ↔ tipo (camelCase/epoch-ms)
│   │
│   ├── components/
│   │   ├── PlatformShell.tsx     ← Sidebar + Topbar + main
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   ├── AuthGuard.tsx         ← Wrapper com role-check + skeleton fallback
│   │   ├── DeckCard.tsx
│   │   ├── CheckpointTimeline.tsx · CheckpointEditor.tsx
│   │   ├── FlashcardReviewer.tsx  · CardEditor.tsx · DeckEditor.tsx
│   │   ├── VideoEmbed.tsx
│   │   ├── skeletons/            ← Login/Dashboard/Materials/Classes skeletons
│   │   └── ui/                   ← Button/Card/Container/Icon/Input/Tag/EmptyState/Skeleton
│   │
│   └── screens/
│       ├── LoginScreen.tsx
│       ├── student/   ← Dashboard, Materials, Classes
│       ├── teacher/   ← Dashboard, Materials, Classes
│       │   └── materialUtils.ts  ← formatBytes (compartilhado com StudentMaterials)
│       └── flashcards/ ← List, DeckOverview, DeckStudy, DeckCards (compartilhadas via prop `scope`)
│
├── supabase/migrations/0001_init.sql  ← Schema + RLS + trigger de papel + bucket (rodar no SQL Editor)
├── .env.local.example                 ← Variáveis + passo a passo de setup do Supabase
└── CLAUDE.md (este arquivo)
```

### Princípio arquitetural #1 — isolamento da plataforma

`plataforma/` é um módulo **completamente autocontido**. Pode ser copiado para outro projeto Next.js (App Router + TS + Tailwind v4) e funciona com:

1. Copiar a pasta `plataforma/`
2. Importar `plataforma/styles.css` no layout que envolve as rotas
3. Envolver as rotas com `<PlatformProvider>` (importado de `@/plataforma`)
4. Criar páginas em `app/...` que importam telas de `@/plataforma` (vide `app/plataforma/**/page.tsx` — uma linha cada)

As páginas em `app/plataforma/` são **shims puros** (1-3 linhas). Toda lógica vive no módulo.

### Princípio arquitetural #2 — cores e tokens não conflitam

A landing usa tokens em `:root` ([app/globals.css](app/globals.css)).
A plataforma usa tokens scoped em `[data-platform]` ([plataforma/styles.css](plataforma/styles.css)).
O wrapper `<div data-platform>` em [app/plataforma/layout.tsx](app/plataforma/layout.tsx) ativa o segundo conjunto sem vazar para a landing.

---

## 4. Design system

### 4.1 Paleta (idêntica entre landing e plataforma, scoped diferente)

| Token | Hex | Uso |
|---|---|---|
| `--p-fg` / `--foreground` | `#0A2540` | Texto principal (azul Oxford) |
| `--p-fg-soft` | `#1D1D1F` | Texto secundário denso |
| `--p-muted` | `#6E6E73` | Apple gray — textos auxiliares |
| `--p-accent` / `--accent` | `#C8102E` | CTAs primários, links de destaque |
| `--p-accent-soft` | `#FDE8EB` | Tags accent, hover de danger button |
| `--p-gold` / `--gold` | `#D4A017` | Eyebrow do CTA escuro, detalhes Oxford |
| `--p-bg` | `#FFFFFF` | Fundo padrão |
| `--p-surface` | `#F5F5F7` | Cinza Apple (sidebar, hover) |
| `--p-hairline` | `rgba(10,37,64,0.08)` | Bordas finas estilo Apple |
| `--p-success` | `#1E9E63` | Sucesso (verde) |
| `--p-warning` | `#D4A017` | Atenção |

### 4.2 Tipografia

- **Fonte**: Inter (`var(--font-sans-display)`).
- **Headlines**: `tracking-[-0.03em]` ou `tracking-[-0.035em]` + `leading-[1.02]` ou `[1.05]`.
- **Tipografia fluida**: usar `clamp()` nos headlines de seção. Padrão estabelecido:
  - Hero h1: `text-[clamp(2.25rem,9vw,5rem)]`
  - Seção h2 (landing): `text-[clamp(1.875rem,5.5vw,3.25rem)]`
  - Dashboard h1 (plataforma): `text-[clamp(1.75rem,5.5vw,2.75rem)]`
  - Login h1: `text-[clamp(2rem,7vw,3rem)]`
  - CTA dark h2: `text-[clamp(2rem,7vw,4rem)]`

### 4.3 Componentes visuais recorrentes

- **Pill button**: `rounded-full`, altura `h-9/h-10/h-12` (sm/md/lg), `tracking-tight`, transição com `hover:-translate-y-[1px]`.
- **Hairline card**: `rounded-2xl sm:rounded-3xl`, `border border-hairline`, `bg-white`, hover `shadow-[0_20px_40px_-20px_rgba(10,37,64,0.18)]`.
- **Sidebar/Topbar**: `backdrop-blur-xl bg-white/70`.
- **Sem emojis**: TODA iconografia usa `<Icon name="...">` ([plataforma/components/ui/Icon.tsx](plataforma/components/ui/Icon.tsx)). Stroke 1.6, line-cap rounded, 23+ ícones. Para adicionar um novo, adicione o nome em `IconName` e o case correspondente no switch.

### 4.4 Animações

- `fade-in` (landing) e `p-fade-in` (plataforma): fade + 6-8px translate up, 0.45-0.7s.
- `p-skel` + `pShimmer` keyframe: gradiente translúcido deslizando para a esquerda (1.4s ease-in-out), usado em todos os skeletons.
- Hover em cards: `-translate-y-[1px]` ou `[2px]` + sombra suave.
- Reveal de flashcard: animação de grid com `grid-rows-[0fr] → [1fr]` + opacity (smooth reveal sem 3D).

---

## 5. Responsividade — convenções

Breakpoints Tailwind padrão: `sm=640, md=768, lg=1024, xl=1280, 2xl=1536`. Plataforma testada de **320px até 1920px+**.

**Regras estabelecidas:**

1. **Container**: padding `px-4 sm:px-6 lg:px-8` (4 = 16px no mobile, 6 = 24px no tablet, 8 = 32px no desktop).
2. **Headlines** sempre via `clamp()` (não escalonamento discreto).
3. **Cards**: padding `p-5 sm:p-7 lg:p-8` (em vez de `p-7 sm:p-8`).
4. **Section vertical**: `py-16 sm:py-24 lg:py-32` (landing) ou `py-6 sm:py-8 lg:py-10` (plataforma).
5. **Sidebar**: `hidden lg:flex` — substituída por pílulas horizontais no Topbar em mobile.
6. **Botões**: na plataforma, em forms ficam `w-full sm:w-auto` (full-width no mobile).
7. **Grids**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` é o padrão; stats 3-up usam `grid-cols-3` direto com fonts fluidas.
8. **Safe area**: `env(safe-area-inset-*)` em FloatingWhatsApp, Footer, Topbar, Sidebar e LoginScreen (notch iOS, gesture bar Android). Layout root tem `viewport.viewportFit: "cover"`.
9. **Order swap em mobile**: CheckpointTimeline põe o player primeiro (`order-1 lg:order-2`) e a lista depois, evitando rolagem longa.
10. **Truncate / break-words**: nomes de usuário, títulos longos e URLs sempre com `truncate` ou `break-words` em containers `min-w-0`.

Para adicionar tela nova: comece com `min-w-0` em flex children e adicione `text-[clamp(...)]` no h1 da página.

---

## 6. Estado da plataforma — modelo de dados

Tudo vive em `ContentState` em [plataforma/types.ts](plataforma/types.ts):

```ts
type ContentState = {
  checkpoints: Checkpoint[];           // aulas gravadas (ordem)
  watchedCheckpointIds: string[];      // ids assistidos
  materialSections: MaterialSection[]; // seções da biblioteca (ordem definida pelo professor)
  materials: Material[];               // arquivos anexados às seções (cada um com order próprio)
  decks: Deck[];                       // decks de flashcards (com ownerScope)
  flashcards: Flashcard[];             // cartas (scheduling SM-2 simples)
};
```

**Onde vive agora**: cada campo de `ContentState` mapeia para uma tabela no Postgres do Supabase (`checkpoints`, `material_sections`, `materials`, `watched_checkpoints`, `decks`, `flashcards`). O [PlatformContext.tsx](plataforma/store/PlatformContext.tsx) carrega tudo via `@supabase/supabase-js` quando a sessão autentica, monta o `ContentState` (mappers em [plataforma/supabase/mappers.ts](plataforma/supabase/mappers.ts) convertem snake_case/timestamptz ↔ camelCase/epoch-ms) e mantém um estado React. **`localStorage` não é mais usado** para conteúdo/auth (o supabase-js guarda só a sessão de auth). O schema completo (tabelas + RLS + trigger + bucket) está em [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql).

**Padrão de escrita**: as ações do contexto (`upsert*`, `remove*`, `reorder*`, `review*`, etc.) fazem **update otimista** no estado local e disparam a escrita assíncrona no Supabase via helper `write()`; se a escrita falhar, `reload()` ressincroniza a entidade do servidor. IDs são UUIDs gerados no client (`uid()` → `crypto.randomUUID()`), então o insert otimista já usa o id final.

### 6.1 Auth real (Supabase Auth)

Login por **e-mail/senha** ou **Google OAuth** (PKCE, redirect de volta para `/plataforma` — sem route handler dedicado; o client detecta a sessão na URL). O `PlatformContext` assina `onAuthStateChange`, busca o `profiles` do usuário e monta `AuthState = { userId, username, role }`.

**Papel (aluno/professor)** é definido no banco: um trigger `on_auth_user_created` cria o `profiles` no signup com `role = 'professor'` se o e-mail estiver na tabela `teacher_emails`, senão `'aluno'`. **A tela de login não escolhe perfil** — o aluno não consegue se tornar professor sozinho. Para autorizar um professor, insira o e-mail em `teacher_emails` (SQL).

Ações expostas: `signInWithPassword`, `signUpWithPassword`, `signInWithGoogle`, `logout`. A confirmação de e-mail está desligada no dashboard (signup entra direto).

### 6.2 Separação aluno × professor

- Decks têm `ownerScope: "aluno" | "professor"` e `ownerId` (id do usuário dono). **São privados por usuário**: cada aluno vê só os seus decks; o professor vê só os dele (RLS no banco: `owner_id = auth.uid()`). **Não há overlap por design** (requisito do usuário).
- `decksByScope(scope)` filtra o estado já carregado (que vem só com os decks do usuário logado).
- Telas de Flashcards são compartilhadas: `<FlashcardsList scope="aluno" />` vs `scope="professor"` — apenas a prop muda.
- Materiais/Aulas: o professor cria, o aluno consome (compartilhado entre roles). Apenas decks de flashcards são privados por scope.

### 6.3 Materiais — modelo, ações e limites

A biblioteca de materiais é um arranjo simples de **seções ordenadas** (`MaterialSection`) com **arquivos ordenados** dentro (`Material`). Tipos:

```ts
type MaterialSection = {
  id: string;
  title: string;
  description: string;
  order: number;      // ordem que o aluno vê
  createdAt: number;
};

type Material = {
  id: string;
  sectionId: string;
  displayName: string; // nome que o aluno vê (editável pelo professor)
  fileName: string;    // nome do arquivo original do upload
  mime: string;
  size: number;        // bytes
  storagePath: string; // caminho no bucket "materials" do Supabase Storage
  order: number;       // ordem dentro da seção
  createdAt: number;
};
```

Ações expostas pelo `PlatformContext`:

| Ação | O que faz |
|---|---|
| `upsertMaterialSection(s)` | Cria (sem `id`) ou atualiza; normaliza `order` ao final |
| `removeMaterialSection(id)` | Remove a seção **e todos os arquivos dentro dela**; renumera o resto |
| `reorderMaterialSection(id, dir)` | Sobe/desce uma posição (swap clássico) |
| `addMaterial(sectionId, file)` | Adiciona arquivo ao final da seção (`order = items.length`) |
| `renameMaterial(id, name)` | Altera só o `displayName` (não toca `fileName`) |
| `removeMaterial(id)` | Remove e renumera `order` dentro da seção |
| `reorderMaterial(id, dir)` | Sobe/desce uma posição dentro da seção |
| `materialsBySection(sectionId)` | Helper memoizado: retorna arquivos da seção ordenados por `order` |

**Onde os bytes ficam**: o conteúdo do arquivo vai para o **Supabase Storage** (bucket privado `materials`); o banco guarda só `storage_path` + metadados. O upload é feito na tela [TeacherMaterials.tsx](plataforma/screens/teacher/TeacherMaterials.tsx) (`supabase.storage.from('materials').upload(...)`, caminho `<sectionId>/<uuid>-<nome>`) **antes** de chamar `addMaterial`. Remover seção/arquivo apaga também o objeto no Storage (`.remove(paths)`).

- **Limite por arquivo**: `MAX_FILE_BYTES = 50MB` em [TeacherMaterials.tsx](plataforma/screens/teacher/TeacherMaterials.tsx) (erro inline se ultrapassar). Storage suporta bem mais — ajuste à vontade.
- **Sem limite de localStorage** — o gargalo de ~5MB desapareceu.

**Download no aluno**: gera uma **signed URL** na hora (`createSignedUrl(storagePath, 60, { download: displayName })`) e dispara o download via `<a>` temporário (bucket é privado; só autenticados leem). O nome salvo no disco é o `displayName`.

**Helpers**: `formatBytes` (escala B/KB/MB/GB) vive em [plataforma/screens/teacher/materialUtils.ts](plataforma/screens/teacher/materialUtils.ts) e é reaproveitado pela tela do aluno.

### 6.4 Spaced repetition — algoritmo

Implementado em [plataforma/scheduler.ts](plataforma/scheduler.ts). É uma **simplificação do SM-2** com 3 botões:

| Grade | O que faz |
|---|---|
| `again` (Errei) | `interval = 0`, repetições resetam; carta volta hoje |
| `good` (Acertei) | Tabela `[1, 3, 7, 14, 30]` dias para as primeiras reps; após, × 2.2 |
| `easy` (Fácil) | Tabela `[3, 7, 21]` dias para as primeiras reps; após, × 2.8 |

Carta é "due" quando `dueAt <= Date.now()`. `dueAt` é alinhado ao `startOfDay`. Funções utilitárias: `isDue`, `countDue`, `dueCards`, `previewNextInterval`.

Para mudar o algoritmo: edite só `scheduler.ts`. As ações do store (`reviewFlashcard`) delegam para `reschedule`.

### 6.5 Reset

Removido. Com banco real e multiusuário, não há mais "restaurar seeds" — cada usuário começa vazio e cria o próprio conteúdo, persistido no Supabase. Os arquivos `seeds.ts`/`storage.ts` viraram stubs deprecados (mantidos só para não quebrar imports históricos).

---

## 7. Roteamento

Todas as rotas em uma tabela:

| Path | Componente | Notas |
|---|---|---|
| `/` | landing | Hero + Method + Benefits + Teacher + Testimonials + FAQ + FinalCTA + Footer + FloatingWA |
| `/plataforma` | `LoginScreen` | Redireciona se já autenticado |
| `/plataforma/aluno` | `StudentDashboard` | Atalhos: materiais + flashcards + aulas |
| `/plataforma/aluno/materiais` | `StudentMaterials` | Seções ordenadas com arquivos para download |
| `/plataforma/aluno/aulas` | `StudentClasses` | Timeline + player |
| `/plataforma/aluno/flashcards` | `FlashcardsList scope="aluno"` | Lista decks do aluno |
| `/plataforma/aluno/flashcards/[deckId]` | `DeckOverview` | Visão geral do deck + atalhos |
| `/plataforma/aluno/flashcards/[deckId]/study` | `DeckStudy` | Sessão de estudo (cartas devidas) |
| `/plataforma/aluno/flashcards/[deckId]/cards` | `DeckCards` | CRUD de cartas |
| `/plataforma/professor/*` | espelho | Mesmas telas; `/professor/materiais` é o editor (CRUD seções e arquivos) |

Todas as rotas com `[deckId]` têm `loading.tsx` correspondente que renderiza o skeleton apropriado durante navegação.

Path constants vivem em [plataforma/routes.ts](plataforma/routes.ts). **Sempre use `platformRoutes.X` em vez de strings**: facilita refactor de URLs.

---

## 8. Skeleton loading — padrão

1. **Hidratação inicial do contexto** (antes de ler localStorage):
   - `AuthGuard` aceita prop `fallback: ReactNode` e renderiza ela enquanto `ready === false` ou `auth.role !== role`.
   - Cada tela passa o skeleton apropriado: `<DashboardSkeleton title="..." />`, `<MaterialsSkeleton />`, `<ClassesSkeleton />`. (Telas de deck também reaproveitam `MaterialsSkeleton` — layout vertical de cards casa bem.)
2. **Transição de rotas Next.js** (Suspense):
   - Arquivos `loading.tsx` em cada nível de pasta de rota. Renderizam o mesmo skeleton.
3. **Login**: enquanto `!ready || auth`, mostra `<LoginSkeleton />` para evitar flash do formulário.

Os skeletons espelham o layout real (header → stats → grid de cards) para que a transição não "salte". Animação `p-skel` é universal — qualquer `<Skeleton>` ou subclasse herda o shimmer.

Para criar um novo skeleton: importe `<Skeleton />`, `<SkeletonText />` e `<SkeletonCard />` de [plataforma/components/ui/Skeleton.tsx](plataforma/components/ui/Skeleton.tsx) e monte o esqueleto da tela.

---

## 9. Como rodar / verificar

```bash
npm install            # primeira vez
npx next dev -p 3000   # dev server
npx next build         # production build (também valida TypeScript)
```

**Sempre rode `npx next build` antes de declarar a feature pronta** — ele falha em type errors, missing imports, e roteamento mal definido. O log no final mostra todas as rotas e marca `○ Static` vs `ƒ Dynamic`.

Não tem testes hoje. Validação é via:
1. Build (TS + bundle)
2. Smoke teste manual no dev (login → fluxo aluno → fluxo professor)

---

## 10. Checkpoints da evolução (o que foi feito, em ordem)

1. **Landing inicial** — Hero/Method/Benefits/Teacher/Testimonials/FAQ/FinalCTA + Navbar/Footer/FloatingWhatsApp. Visual Apple, cores Oxford.
2. **Plataforma — módulo separado** — Login fake, dashboards por role, áreas com exercícios criáveis, cronologia de aulas gravadas com checkpoints + vídeo.
3. **Remoção de emojis + textos de demo + skeleton loading** — Sistema `<Icon>` com 23+ SVGs outline, remoção de "Modo de demonstração", skeletons cinematográficos com shimmer.
4. **Responsividade** — `clamp()` em todos os headlines, container padding ajustado, Topbar mobile reorganizado, CheckpointTimeline com player-first em mobile, safe-area-inset, viewport.
5. **Flashcards / spaced repetition** — Decks separados por ownerScope (aluno/professor), scheduler SM-2 simplificado (3 botões), telas List/Overview/Study/Cards compartilhadas via prop `scope`, integração nos dashboards e nav.
6. **Materiais substituem áreas/exercícios (mai/2026)** — Removido o módulo inteiro de "áreas de estudo com desafios" (tipos `Question`/`Attempt`/`Area`, componentes `ExerciseRunner`/`ExerciseEditor`/`AreaCard`/`AreaSkeleton`, telas `StudentArea`/`TeacherArea`, lista predefinida `AREAS`, rotas `/area/[areaId]`). Em troca: **biblioteca de materiais** — o professor cria seções (com nome, descrição e ordem definida por ele) e anexa arquivos (PDF/áudio/imagem/planilha/etc.) que o aluno baixa direto. Novas telas `StudentMaterials`/`TeacherMaterials`, novo skeleton `MaterialsSkeleton`, novos ícones `folder`/`download`/`upload`/`trash`, novas rotas `/materiais` em ambos os scopes.

7. **Backend real: Supabase (jun/2026)** — Trocada toda a camada de persistência de `localStorage` por **Supabase** (Postgres + Auth + Storage), mantendo a interface do `PlatformContext` (telas quase intactas). O que entrou:
   - **Auth real**: Google OAuth + e-mail/senha. `LoginScreen` reescrita (sem mais seletor de perfil). Papel definido por trigger via `teacher_emails` (§6.1). Confirmação de e-mail desligada no dashboard.
   - **Dados no Postgres**: tabelas `profiles`, `checkpoints`, `material_sections`, `materials`, `decks`, `flashcards`, `watched_checkpoints` com RLS. Schema em [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql). Novos arquivos [plataforma/supabase/client.ts](plataforma/supabase/client.ts) e [mappers.ts](plataforma/supabase/mappers.ts).
   - **Arquivos no Storage** (bucket privado `materials`): upload pelo professor, download por signed URL no aluno. `Material.dataUrl` (base64) virou `Material.storagePath`. Limite subiu p/ 50MB.
   - **Progresso por usuário**: aulas assistidas e scheduling dos flashcards persistidos por usuário. `Deck.ownerUsername` virou `ownerId`; decks privados por usuário via RLS. Removido o "Restaurar seeds" (não faz sentido multiusuário); `seeds.ts`/`storage.ts` viraram stubs.
   - **Padrão de escrita**: optimista local + `write()` assíncrono; reload da entidade em erro. IDs são UUID client-side (`uid()`).
   - **Correções na mesma leva**: navegação interna toda via `<Link>` (atalhos do dashboard faziam full reload); restauração de sessão semeada por `getSession()` ignorando o `INITIAL_SESSION` null (que chutava o usuário pro login); `FlashcardReviewer` agora congela a fila no início da sessão (antes pulava cartas ao acertar/fácil); mappers deixaram de reenviar `created_at` nos upserts (evita drift do timestamp); `logout` reseta o id carregado.
   - **Gotcha operacional (Google OAuth)**: o "Authorized redirect URI" no Google Cloud Console deve ser `https://<project-ref>.supabase.co/auth/v1/callback` (o callback do Supabase, **não** `/api/auth/...`); a URL do app (`/plataforma`) vai nas Redirect URLs do Supabase. Setup completo no topo de [.env.local.example](.env.local.example).

---

## 11. Convenções de código — coisas que importam

### 11.1 Imports relativos vs `@/*`

- Dentro de `plataforma/`: **imports relativos** (`../store/...`). Mantém o módulo portável.
- Em `app/` e `components/` (landing): **imports `@/*`**. Mais limpos.

### 11.2 `'use client'`

Marque client components apenas onde necessário (hooks, eventos, state). Páginas em `app/plataforma/**/page.tsx` são **server components puros** que renderizam a screen client. Server-side render → fallback de loading.tsx → cliente hidrata e mostra real.

### 11.3 Async params no Next 16

Em screens dinâmicas, use **`useParams()` de `next/navigation`** (client). Evita lidar com `Promise<params>` em server components.

### 11.4 Adicionar UI nova

1. Use os primitivos em `plataforma/components/ui/` (Button, Card, Container, Input, Tag, EmptyState, Icon, Skeleton).
2. Para um novo ícone: edite [Icon.tsx](plataforma/components/ui/Icon.tsx), adicione case no switch, exporta o nome no type `IconName`.
3. Para uma nova cor de acento (deck): adicione hex em `ACCENTS` em [DeckEditor.tsx](plataforma/components/DeckEditor.tsx).
4. Para novos tokens globais: edite `:root` em `globals.css` (landing) ou `[data-platform]` em `styles.css` (plataforma).

### 11.5 Adicionar uma nova seção de materiais

Não há lista hardcoded — é tudo runtime. Como professor: vá em `/plataforma/professor/materiais`, "Nova seção", preencha título e descrição. A ordem é definida com setas ↑/↓; o aluno vê na mesma ordem.

Não há mais "Restaurar seeds" (removido na migração p/ Supabase). Cada usuário começa vazio e cria o próprio conteúdo. `seeds.ts` é um stub deprecado.

### 11.6 Backend (Supabase) — já plugado

O backend real **já está integrado** (§6, §6.1, §6.3). Pontos de extensão:
- **Schema**: edite [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql) e rode no SQL Editor. Os tipos do app estão em [types.ts](plataforma/types.ts); o mapeamento row↔tipo em [plataforma/supabase/mappers.ts](plataforma/supabase/mappers.ts).
- **Nova entidade**: crie a tabela + RLS no SQL, adicione o tipo, mappers `rowToX`/`xToRow` (lembre: **não** envie `created_at` nos upserts), e ações no [PlatformContext.tsx](plataforma/store/PlatformContext.tsx) seguindo o padrão optimista + `write()`.
- **Autorizar professor**: `insert into teacher_emails (email) values ('...')` no SQL Editor.
- **Config local**: `.env.local` (ou `.env`) com `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`. O app **só** usa a publishable key; a secret key nunca entra no front (RLS é a barreira).

### 11.7 NÃO fazer

- **Não adicione emojis** em UI (decisão explícita do dono). Sempre `<Icon>`.
- **Não adicione textos como "demo", "modo teste", "exemplo"** na UI visível. Tudo deve parecer produção.
- **Não acople a plataforma à landing**: o módulo `plataforma/` não importa de `components/` ou `lib/` da landing. Mantenha a barreira.
- **Não use libs UI (Radix/shadcn/MUI/Headless)** sem checar com o dono. Tudo aqui é vanilla por design.
- **Não introduza CSS-in-JS** ou frameworks de estado. Tailwind + React Context são suficientes.

---

## 12. Pontos de atenção / dívidas conhecidas

- **Sem testes automatizados.** Build (`npx next build`) é a única gate de CI. (Os fluxos de dados/RLS foram validados manualmente via REST API contra o Supabase.)
- **Sessão no client (supabase-js)** — guardada em localStorage pelo próprio supabase-js. Para hardening, considerar cookies SSR (`@supabase/ssr`) + middleware; hoje é tudo client-side.
- **Escrita optimista sem realtime** — em erro de rede, `write()` recarrega a entidade do servidor; não há sync entre abas/dispositivos em tempo real. Suficiente p/ 1 professor + poucos alunos.
- **Limpeza de Storage depende do app** — remover seção/arquivo apaga o objeto via `.remove()` no `PlatformContext`; se uma escrita falhar no meio, pode sobrar objeto órfão no bucket (sem GC automático).
- **Sem i18n** — strings hardcoded em PT-BR. Se for internacionalizar, considerar `next-intl`.
- **Sem analytics, sem PWA, sem SEO sitemap** — fora do escopo atual.
- **Não há paginação** em listas de materiais/cartas — assume volume baixo (dezenas). Para centenas+, considerar virtualização.
- **Vídeos das aulas gravadas por URL** (YouTube/Vimeo/mp4); cartas continuam sendo só texto.
- **Renomear arquivo usa `window.prompt`** em [TeacherMaterials.tsx](plataforma/screens/teacher/TeacherMaterials.tsx) — funcional, mas mobile dá UX ruim em alguns browsers. Considerar modal próprio se virar dor.

---

## 13. Cheat-sheet para tarefas comuns

| Quero... | Onde editar |
|---|---|
| Mudar o número de WhatsApp | [lib/site.ts](lib/site.ts) |
| Adicionar seção na landing | Criar em [components/](components/), incluir em [app/page.tsx](app/page.tsx) |
| Autorizar um e-mail como professor | `insert into teacher_emails ...` no SQL Editor do Supabase |
| Mudar/alterar o schema do banco | [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql) (rodar no SQL Editor) + mappers em [plataforma/supabase/mappers.ts](plataforma/supabase/mappers.ts) |
| Aumentar/diminuir limite de upload | `MAX_FILE_BYTES` em [plataforma/screens/teacher/TeacherMaterials.tsx](plataforma/screens/teacher/TeacherMaterials.tsx) |
| Mudar algoritmo de repetição | [plataforma/scheduler.ts](plataforma/scheduler.ts) |
| Adicionar nav item na sidebar | `getNav()` em [plataforma/components/Sidebar.tsx](plataforma/components/Sidebar.tsx) + `<PillLink>` em [Topbar.tsx](plataforma/components/Topbar.tsx) |
| Adicionar campo num formulário | Editor correspondente em [plataforma/components/](plataforma/components/) — adicionar state, Field, validar em `save()` |
| Adicionar nova role além de aluno/professor | Expandir `Role` em [types.ts](plataforma/types.ts), ajustar o trigger `handle_new_user` no SQL, tratar em `AuthGuard`, `Sidebar.getNav`, criar pasta de rotas paralela |
| Mudar tokens de cor | `:root` em [app/globals.css](app/globals.css) (landing) ou `[data-platform]` em [plataforma/styles.css](plataforma/styles.css) |
| Trocar fonte | [app/layout.tsx](app/layout.tsx) — `next/font/google` |
| Adicionar ícone novo | [Icon.tsx](plataforma/components/ui/Icon.tsx) — adicionar nome em `IconName` e case correspondente no switch |

---

## 14. Glossário rápido

- **Seção de materiais (`MaterialSection`)**: agrupamento ordenado de arquivos, criado e nomeado pelo professor (ex.: "Boas-vindas", "Vocabulário essencial"). Substituiu o conceito antigo de "Área de estudo".
- **Material (`Material`)**: arquivo anexado a uma seção (PDF, áudio, imagem, planilha…). Tem `displayName` (apelido editável) separado do `fileName` (nome original do upload), `mime`, `size` e `storagePath` (caminho no bucket `materials` do Supabase Storage).
- **Checkpoint**: aula gravada na cronologia. Tem ordem, vídeo, descrição.
- **Deck**: coleção de flashcards. Tem dono (aluno OU professor).
- **Flashcard / Carta**: par frente/verso com scheduling.
- **Due / Devida**: carta cujo `dueAt <= now`. Aparece na sessão de estudo.
- **Grade**: nota dada pelo aluno na carta (`again | good | easy`).

---

## 15. Como verificar visualmente

**Pré-requisito**: Supabase configurado (§2: rodar `0001_init.sql`, cadastrar seu e-mail em `teacher_emails`, ativar Google + desligar confirm email, preencher `.env.local`/`.env`).

1. `npx next dev`
2. Abrir [http://localhost:3000](http://localhost:3000) — landing → "Entrar" → `/plataforma`
3. **Criar conta com o e-mail que você pôs em `teacher_emails`** → deve cair no painel **professor** (sem seletor de perfil; o papel vem do banco)
4. Ir em **Materiais** → criar uma seção, anexar 2 arquivos (qualquer formato até 50MB), renomear um, reordenar com as setas; criar uma 2ª seção e reordenar as seções
5. Navegar entre **Painel / Materiais / Aulas / Flashcards** (e apertar F5 em cada) → **não** deve cair no login (regressão da corrida de sessão)
6. **Aulas** → criar checkpoint (com URL de vídeo), reordenar
7. **Flashcards** → criar deck + 3-4 cartas; estudar e dar **Acertei** em todas → deve passar por **todas** sem pular (regressão do `FlashcardReviewer`)
8. Sair; **criar conta com um e-mail fora da allowlist** → deve cair como **aluno**
9. Em **Materiais**, conferir mesma ordem; baixar um arquivo → download começa com o `displayName` (via signed URL)
10. Marcar uma aula como assistida; estudar flashcards do aluno (decks do professor **não** aparecem — isolamento por usuário)
11. **Abrir em outro navegador / aba anônima** e logar com a mesma conta → o conteúdo aparece (prova de que persiste no Supabase, não no localStorage do device)
12. Tentar subir arquivo > 50MB → erro inline, sem quebrar
13. **Google**: clicar "Continuar com Google" → consentimento → volta logado (exige o redirect URI do Supabase no Google Console, §10 chk 7)

Para testar mobile: use DevTools → device mode com 320px, 375px, 414px, 768px, 1024px.

---

Última atualização: 2026-06-18. Ao mexer no sistema, **atualize este arquivo** se mudar algo arquitetural.
