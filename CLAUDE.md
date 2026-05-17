# CLAUDE.md — Contexto completo para futuros agentes IA

Este documento é o briefing que você (próximo agente trabalhando neste repositório) deve ler **primeiro**. Cobre tudo o que existe hoje, por que existe, e onde encostar para não quebrar nada.

> **Aviso Next.js 16**: o repositório também contém [AGENTS.md](AGENTS.md) com a nota de que esta versão do Next.js tem breaking changes em relação a versões mais antigas. Se você for mexer em APIs do framework (route handlers, params, metadata, fonts, middleware), confira `node_modules/next/dist/docs/` antes de assumir comportamento.

---

## 1. O produto, em uma frase

Site institucional de aulas particulares de inglês com **método Oxford** + uma **plataforma de estudos** acoplada (áreas com desafios, aulas gravadas em cronologia, e flashcards com repetição espaçada). O dono é um professor particular; alunos entram via login fake e estudam o conteúdo que o professor publica.

---

## 2. Stack

| Camada | Tecnologia | Por quê |
|---|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) | SSR/SSG nativo, route groups, server/client components |
| Linguagem | **TypeScript** strict | Contratos explícitos no módulo da plataforma |
| Estilos | **Tailwind v4** (CSS-first config) | Velocidade + tokens via `@theme inline` |
| Tipografia | **Inter** via `next/font` | Substituto de SF Pro para o visual Apple |
| Persistência | **`localStorage`** (sem backend) | Demo/protótipo; trocável por API sem mudar UI |
| Estado | **React Context** + reducer manual | Sem libs externas (Zustand/Redux) — escopo pequeno |
| Build/run | `npm` | Lockfile padrão |

Node version: testado com Node 22. Sem `package.json` exótico — tudo é `next/react/react-dom` + tipos.

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
│       │   ├── area/[areaId]/page.tsx            → StudentArea
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
│   ├── areas.ts            ← Áreas de estudo predefinidas (5)
│   ├── scheduler.ts        ← Lógica do estudo espaçado (puramente funcional)
│   ├── styles.css          ← Tokens scoped em [data-platform]
│   │
│   ├── store/
│   │   ├── PlatformContext.tsx   ← Provider + reducer + ações
│   │   ├── storage.ts            ← Helpers de localStorage
│   │   └── seeds.ts              ← Dados de exemplo iniciais
│   │
│   ├── components/
│   │   ├── PlatformShell.tsx     ← Sidebar + Topbar + main
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   ├── AuthGuard.tsx         ← Wrapper com role-check + skeleton fallback
│   │   ├── AreaCard.tsx
│   │   ├── DeckCard.tsx
│   │   ├── ExerciseRunner.tsx    · ExerciseEditor.tsx
│   │   ├── CheckpointTimeline.tsx · CheckpointEditor.tsx
│   │   ├── FlashcardReviewer.tsx  · CardEditor.tsx · DeckEditor.tsx
│   │   ├── VideoEmbed.tsx
│   │   ├── skeletons/            ← Login/Dashboard/Area/Classes skeletons
│   │   └── ui/                   ← Button/Card/Container/Icon/Input/Tag/EmptyState/Skeleton
│   │
│   └── screens/
│       ├── LoginScreen.tsx
│       ├── student/   ← Dashboard, Area, Classes
│       ├── teacher/   ← Dashboard, Area, Classes
│       └── flashcards/ ← List, DeckOverview, DeckStudy, DeckCards (compartilhadas via prop `scope`)
│
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
  questions: Question[];          // exercícios criados pelo professor
  checkpoints: Checkpoint[];      // aulas gravadas (ordem)
  attempts: Attempt[];            // tentativas do aluno em exercícios
  watchedCheckpointIds: string[]; // ids assistidos
  decks: Deck[];                  // decks de flashcards (com ownerScope)
  flashcards: Flashcard[];        // cartas (scheduling SM-2 simples)
};
```

Persistido em `localStorage` sob a chave `platform.content.v1`. Auth em `platform.auth.v1`.

**Forward-compatibility**: ao hidratar de versões antigas, fields faltantes recebem seed defaults — veja `useEffect` em [PlatformContext.tsx](plataforma/store/PlatformContext.tsx).

### 6.1 Auth fake

Tela de login aceita **qualquer caractere** como username, mais um `role: "aluno" | "professor"`. Não há senha. Auth é só `{ username, role }` em localStorage.

Para adicionar auth real: substituir `login/logout` no `PlatformContext` por chamadas HTTP. UI não precisa mudar.

### 6.2 Separação aluno × professor

- Decks têm `ownerScope: "aluno" | "professor"`.
- `decksByScope(scope)` filtra: aluno só vê decks de aluno; professor só vê decks de professor. **Não há overlap por design** (requisito do usuário).
- Telas de Flashcards são compartilhadas: `<FlashcardsList scope="aluno" />` vs `scope="professor"` — apenas a prop muda.
- Áreas/Aulas: o professor cria, o aluno consome (compartilhado entre roles). Apenas decks de flashcards são privados por scope.

### 6.3 Spaced repetition — algoritmo

Implementado em [plataforma/scheduler.ts](plataforma/scheduler.ts). É uma **simplificação do SM-2** com 3 botões:

| Grade | O que faz |
|---|---|
| `again` (Errei) | `interval = 0`, repetições resetam; carta volta hoje |
| `good` (Acertei) | Tabela `[1, 3, 7, 14, 30]` dias para as primeiras reps; após, × 2.2 |
| `easy` (Fácil) | Tabela `[3, 7, 21]` dias para as primeiras reps; após, × 2.8 |

Carta é "due" quando `dueAt <= Date.now()`. `dueAt` é alinhado ao `startOfDay`. Funções utilitárias: `isDue`, `countDue`, `dueCards`, `previewNextInterval`.

Para mudar o algoritmo: edite só `scheduler.ts`. As ações do store (`reviewFlashcard`) delegam para `reschedule`.

### 6.4 Reset

`resetAllContent()` restaura o `SEED_CONTENT` — acessível via botão "Restaurar seeds" no painel do professor.

---

## 7. Roteamento

Todas as rotas em uma tabela:

| Path | Componente | Notas |
|---|---|---|
| `/` | landing | Hero + Method + Benefits + Teacher + Testimonials + FAQ + FinalCTA + Footer + FloatingWA |
| `/plataforma` | `LoginScreen` | Redireciona se já autenticado |
| `/plataforma/aluno` | `StudentDashboard` | Áreas + flashcards + aulas |
| `/plataforma/aluno/area/[areaId]` | `StudentArea` | Resolve exercícios da área |
| `/plataforma/aluno/aulas` | `StudentClasses` | Timeline + player |
| `/plataforma/aluno/flashcards` | `FlashcardsList scope="aluno"` | Lista decks do aluno |
| `/plataforma/aluno/flashcards/[deckId]` | `DeckOverview` | Visão geral do deck + atalhos |
| `/plataforma/aluno/flashcards/[deckId]/study` | `DeckStudy` | Sessão de estudo (cartas devidas) |
| `/plataforma/aluno/flashcards/[deckId]/cards` | `DeckCards` | CRUD de cartas |
| `/plataforma/professor/*` | espelho | Mesmas telas com `scope="professor"` |

Todas as rotas com `[deckId]` ou `[areaId]` têm `loading.tsx` correspondente que renderiza o skeleton apropriado durante navegação.

Path constants vivem em [plataforma/routes.ts](plataforma/routes.ts). **Sempre use `platformRoutes.X` em vez de strings**: facilita refactor de URLs.

---

## 8. Skeleton loading — padrão

1. **Hidratação inicial do contexto** (antes de ler localStorage):
   - `AuthGuard` aceita prop `fallback: ReactNode` e renderiza ela enquanto `ready === false` ou `auth.role !== role`.
   - Cada tela passa o skeleton apropriado: `<DashboardSkeleton title="..." />`, `<AreaSkeleton />`, `<ClassesSkeleton />`.
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

### 11.5 Adicionar uma nova área de estudo

1. Adicione objeto `Area` em [plataforma/areas.ts](plataforma/areas.ts) com `id` único, `icon` válido (vide IconName), `accent` hex.
2. Nada mais. A área aparece em ambos os dashboards e ganha rotas `/area/[areaId]` automaticamente.

### 11.6 Plugar backend real

Substitua [plataforma/store/storage.ts](plataforma/store/storage.ts) para retornar `Promise<T>` e chamar API. Atualize o `useEffect` em [PlatformContext.tsx](plataforma/store/PlatformContext.tsx) para `await`. A UI permanece inalterada.

### 11.7 NÃO fazer

- **Não adicione emojis** em UI (decisão explícita do dono). Sempre `<Icon>`.
- **Não adicione textos como "demo", "modo teste", "exemplo"** na UI visível. Tudo deve parecer produção.
- **Não acople a plataforma à landing**: o módulo `plataforma/` não importa de `components/` ou `lib/` da landing. Mantenha a barreira.
- **Não use libs UI (Radix/shadcn/MUI/Headless)** sem checar com o dono. Tudo aqui é vanilla por design.
- **Não introduza CSS-in-JS** ou frameworks de estado. Tailwind + React Context são suficientes.

---

## 12. Pontos de atenção / dívidas conhecidas

- **`window.location.href` para navegação em DeckOverview** (após remover deck) — funcional mas full reload. Trocar por `router.push` se causar problemas.
- **Sem testes automatizados.** Build é a única gate.
- **Login persiste no navegador** — em produção troque para cookies HTTP-only assinados, refresh tokens.
- **Sem i18n** — strings hardcoded em PT-BR. Se for internacionalizar, considerar `next-intl`.
- **Sem analytics, sem PWA, sem SEO sitemap** — fora do escopo atual.
- **Não há paginação** em listas de questões/cartas — assume volume baixo (dezenas). Para centenas+, considerar virtualização.
- **Sem upload de mídia** — vídeos são por URL (YouTube/Vimeo/mp4). Cartas só têm texto.

---

## 13. Cheat-sheet para tarefas comuns

| Quero... | Onde editar |
|---|---|
| Mudar o número de WhatsApp | [lib/site.ts](lib/site.ts) |
| Adicionar seção na landing | Criar em [components/](components/), incluir em [app/page.tsx](app/page.tsx) |
| Adicionar área de estudo | [plataforma/areas.ts](plataforma/areas.ts) |
| Mudar algoritmo de repetição | [plataforma/scheduler.ts](plataforma/scheduler.ts) |
| Adicionar nav item na sidebar | `getNav()` em [plataforma/components/Sidebar.tsx](plataforma/components/Sidebar.tsx) + `<PillLink>` em [Topbar.tsx](plataforma/components/Topbar.tsx) |
| Adicionar campo num formulário | Editor correspondente em [plataforma/components/](plataforma/components/) — adicionar state, Field, validar em `save()` |
| Adicionar nova role além de aluno/professor | Expandir `Role` em [types.ts](plataforma/types.ts), tratar em `login()`, `AuthGuard`, `Sidebar.getNav`, criar pasta de rotas paralela |
| Mudar tokens de cor | `:root` em [app/globals.css](app/globals.css) (landing) ou `[data-platform]` em [plataforma/styles.css](plataforma/styles.css) |
| Trocar fonte | [app/layout.tsx](app/layout.tsx) — `next/font/google` |
| Adicionar tipo de exercício novo | Estender `QuestionKind` em [types.ts](plataforma/types.ts), tratar em [ExerciseEditor](plataforma/components/ExerciseEditor.tsx) + [ExerciseRunner](plataforma/components/ExerciseRunner.tsx) |

---

## 14. Glossário rápido

- **Área**: agrupamento temático (Vocabulário, Pronúncia, etc) que contém questões.
- **Questão / Desafio**: exercício individual (múltipla escolha ou aberta), criado pelo professor.
- **Checkpoint**: aula gravada na cronologia. Tem ordem, vídeo, descrição.
- **Deck**: coleção de flashcards. Tem dono (aluno OU professor).
- **Flashcard / Carta**: par frente/verso com scheduling.
- **Due / Devida**: carta cujo `dueAt <= now`. Aparece na sessão de estudo.
- **Grade**: nota dada pelo aluno na carta (`again | good | easy`).

---

## 15. Como verificar visualmente

1. `npx next dev`
2. Abrir [http://localhost:3000](http://localhost:3000) — landing
3. Clicar "Entrar" no navbar — `/plataforma`
4. Logar como **Professor** com qualquer nome
5. Criar uma questão em "Vocabulário"
6. Criar um deck em "Flashcards"
7. Adicionar 3-4 cartas no deck
8. Sair e logar como **Aluno** (mesmo navegador)
9. Conferir que **só o aluno** vê os decks do aluno (decks do professor não aparecem)
10. Estudar o deck: clicar nas 3 grades (Errei/Acertei/Fácil) e ver que carta volta apropriadamente
11. Recarregar a página → estado persiste (localStorage)

Para testar mobile: use DevTools → device mode com 320px, 375px, 414px, 768px, 1024px.

---

Última atualização: 2026-05-17. Ao mexer no sistema, **atualize este arquivo** se mudar algo arquitetural.
