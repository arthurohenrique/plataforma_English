# Scraping autorizado OUP -> Supabase

Este guia cobre o fluxo para coletar paginas autorizadas do OUP (`englishfile/intermediate3`) e salvar no Supabase.

## 1) Pre-requisitos

- Variaveis de ambiente configuradas:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Dependencias instaladas (`npm install`)
- Migracao aplicada no Supabase:
  - `supabase/migrations/0002_scraping_pipeline.sql`
  - `supabase/migrations/0004_scraped_learning_structure.sql`

## 2) Estrutura criada

- Seed/whitelist: `scripts/scraper/seeds/oup-intermediate3.json`
- Crawler: `scripts/scraper/crawl-ouppages.ts`
- Extracao: `scripts/scraper/extract-content.ts`
- Persistencia Supabase: `scripts/scraper/supabase-ingest.ts`
- Leitura para o site: `lib/supabase/scraped-content.ts`

## 3) Login manual e sessao persistida

Primeira execucao (ou quando a sessao expirar):

```bash
npm run scrape:oup:login
```

Fluxo:
- O navegador abre em modo visual.
- Voce faz login/valida o desafio anti-bot manualmente.
- Volta ao terminal e pressiona Enter.
- O script salva a sessao em `scripts/scraper/.auth/oup-storage-state.json`.

## 4) Coleta normal

Com sessao valida:

```bash
npm run scrape:oup
```

Opcional:

```bash
npm run scrape:oup -- --headful
```

## 5) Escopo de scraping

A coleta e restrita por whitelist no arquivo seed:
- dominio permitido (`allowedDomains`)
- prefixos de rota (`allowedPathPrefixes`)
- profundidade (`maxDepth`)
- limite maximo de paginas (`maxPages`)

URLs fora do escopo sao ignoradas.

## 6) Estrategia de extracao (duas passagens)

Para cada pagina o extrator roda em duas etapas:
- **Passagem A (visible_dom):** captura estado inicial do DOM.
- **Passagem B (interactive):** clica em controles (tabs/accordions/botoes de resposta) e captura estado expandido.

Depois disso, os blocos sao consolidados em estrutura didatica.

## 7) Como os dados sao salvos

- `scrape_runs`: resumo de cada execucao
- `scraped_pages`: pagina tecnica (conteudo bruto, hash, status)
- `scraped_sessions`: sessoes de estudo por pagina
- `scraped_exercises`: atividades/exercicios por sessao
- `scraped_questions`: perguntas/enunciados por exercicio
- `scraped_question_options`: opcoes de resposta
- `scraped_question_correct_options`: vinculos de opcoes corretas
- `scraped_question_answer_keys`: gabaritos textuais

Deduplicacao:
- quando `url_normalized + content_hash` ja existe (status `success`), nao cria nova versao
- apenas atualiza `last_seen_at`, `run_id` e reconstroi a arvore didatica da pagina

## 8) Status de pagina

- `success`: pagina coletada e extraida
- `blocked`: pagina bloqueada por anti-bot/desafio JS
- `error`: falha de execucao/rede/extracao

## 9) Publicacao no site

Por padrao, `is_published = false`.
Seu site deve exibir apenas paginas publicadas (`status = success` e `is_published = true`).

Repositorio utilitario:
- `getStudentBiblioteca()` em `lib/supabase/student-biblioteca.ts`

## 10) Troubleshooting

- **Bloqueio recorrente no anti-bot**
  - Renove a sessao: `npm run scrape:oup:login`
  - Reduza `maxPages` e mantenha `requestDelayMs` alto

- **Erro de permissao no Supabase**
  - Confirme `SUPABASE_SERVICE_ROLE_KEY`
  - Confirme se as migrations `0002` e `0004` foram aplicadas

- **Estrutura didatica vazia na UI**
  - Verifique se `is_published = true` nas linhas de `scraped_pages`
  - Verifique se existem registros em `scraped_sessions` para os `page_id` publicados

- **Nenhuma pagina nova**
  - Verifique se a whitelist esta restritiva demais
  - Confira se os links da pagina alvo estao dentro do prefixo permitido
