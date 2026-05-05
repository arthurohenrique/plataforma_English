# Plataforma English

Plataforma completa de ensino de ingles com:
- Landing page publica de captacao
- Area privada do aluno com videoaulas
- Base administrativa para professor

## Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth, Postgres, Storage)

## Como rodar
1. Copie `.env.example` para `.env.local`
2. Preencha as variaveis do Supabase
3. Execute:

```bash
npm install
npm run dev
```

## Rotas principais
- `/` Landing page
- `/login` Login
- `/dashboard` Dashboard do aluno
- `/curso` Lista de cursos
- `/curso/[cursoId]/[aulaId]` Player de aula
- `/admin` Dashboard admin

## Banco de dados
Migration inicial em:
- `supabase/migrations/0001_initial_schema.sql`

## Documentacao detalhada
Consulte:
- `IMPLEMENTACOES.md`
