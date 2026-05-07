CREATE TABLE IF NOT EXISTS scraped_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES scraped_pages(id) ON DELETE CASCADE,
  external_key TEXT,
  titulo TEXT,
  descricao TEXT,
  session_type TEXT NOT NULL DEFAULT 'section',
  ordem INTEGER NOT NULL DEFAULT 0,
  source_pass TEXT NOT NULL DEFAULT 'merged' CHECK (source_pass IN ('visible_dom', 'interactive', 'merged')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (page_id, ordem)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_scraped_sessions_page_external_key
  ON scraped_sessions(page_id, external_key)
  WHERE external_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS scraped_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES scraped_sessions(id) ON DELETE CASCADE,
  external_key TEXT,
  titulo TEXT,
  instrucao TEXT,
  exercise_type TEXT NOT NULL DEFAULT 'generic',
  ordem INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, ordem)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_scraped_exercises_session_external_key
  ON scraped_exercises(session_id, external_key)
  WHERE external_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS scraped_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES scraped_exercises(id) ON DELETE CASCADE,
  external_key TEXT,
  question_type TEXT NOT NULL DEFAULT 'open',
  enunciado_texto TEXT,
  enunciado_html TEXT,
  pontos NUMERIC(6,2),
  ordem INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (exercise_id, ordem)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_scraped_questions_exercise_external_key
  ON scraped_questions(exercise_id, external_key)
  WHERE external_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS scraped_question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES scraped_questions(id) ON DELETE CASCADE,
  external_key TEXT,
  rotulo TEXT,
  option_texto TEXT,
  option_html TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (question_id, ordem)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_scraped_question_options_question_external_key
  ON scraped_question_options(question_id, external_key)
  WHERE external_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS scraped_question_correct_options (
  question_id UUID NOT NULL REFERENCES scraped_questions(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES scraped_question_options(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (question_id, option_id)
);

CREATE TABLE IF NOT EXISTS scraped_question_answer_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL UNIQUE REFERENCES scraped_questions(id) ON DELETE CASCADE,
  answer_type TEXT NOT NULL DEFAULT 'exact',
  value_text TEXT,
  value_texts TEXT[],
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scraped_sessions_page_id ON scraped_sessions(page_id);
CREATE INDEX IF NOT EXISTS idx_scraped_exercises_session_id ON scraped_exercises(session_id);
CREATE INDEX IF NOT EXISTS idx_scraped_questions_exercise_id ON scraped_questions(exercise_id);
CREATE INDEX IF NOT EXISTS idx_scraped_question_options_question_id ON scraped_question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_scraped_question_correct_options_option_id ON scraped_question_correct_options(option_id);
CREATE INDEX IF NOT EXISTS idx_scraped_question_answer_keys_question_id ON scraped_question_answer_keys(question_id);

CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_scraped_sessions_updated_at ON scraped_sessions;
CREATE TRIGGER trg_scraped_sessions_updated_at
BEFORE UPDATE ON scraped_sessions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_scraped_exercises_updated_at ON scraped_exercises;
CREATE TRIGGER trg_scraped_exercises_updated_at
BEFORE UPDATE ON scraped_exercises
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_scraped_questions_updated_at ON scraped_questions;
CREATE TRIGGER trg_scraped_questions_updated_at
BEFORE UPDATE ON scraped_questions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_scraped_question_options_updated_at ON scraped_question_options;
CREATE TRIGGER trg_scraped_question_options_updated_at
BEFORE UPDATE ON scraped_question_options
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_scraped_question_answer_keys_updated_at ON scraped_question_answer_keys;
CREATE TRIGGER trg_scraped_question_answer_keys_updated_at
BEFORE UPDATE ON scraped_question_answer_keys
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

ALTER TABLE scraped_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_question_correct_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_question_answer_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins gerenciam scraped_sessions"
ON scraped_sessions
FOR ALL
USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('professor', 'admin'))
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('professor', 'admin'));

CREATE POLICY "Usuarios autenticados veem scraped_sessions publicas"
ON scraped_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM scraped_pages
    WHERE scraped_pages.id = scraped_sessions.page_id
      AND scraped_pages.is_published = TRUE
      AND scraped_pages.status = 'success'
  )
);

CREATE POLICY "Admins gerenciam scraped_exercises"
ON scraped_exercises
FOR ALL
USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('professor', 'admin'))
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('professor', 'admin'));

CREATE POLICY "Usuarios autenticados veem scraped_exercises publicos"
ON scraped_exercises
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM scraped_sessions ss
    JOIN scraped_pages sp ON sp.id = ss.page_id
    WHERE ss.id = scraped_exercises.session_id
      AND sp.is_published = TRUE
      AND sp.status = 'success'
  )
);

CREATE POLICY "Admins gerenciam scraped_questions"
ON scraped_questions
FOR ALL
USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('professor', 'admin'))
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('professor', 'admin'));

CREATE POLICY "Usuarios autenticados veem scraped_questions publicas"
ON scraped_questions
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM scraped_exercises se
    JOIN scraped_sessions ss ON ss.id = se.session_id
    JOIN scraped_pages sp ON sp.id = ss.page_id
    WHERE se.id = scraped_questions.exercise_id
      AND sp.is_published = TRUE
      AND sp.status = 'success'
  )
);

CREATE POLICY "Admins gerenciam scraped_question_options"
ON scraped_question_options
FOR ALL
USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('professor', 'admin'))
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('professor', 'admin'));

CREATE POLICY "Usuarios autenticados veem scraped_question_options publicas"
ON scraped_question_options
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM scraped_questions sq
    JOIN scraped_exercises se ON se.id = sq.exercise_id
    JOIN scraped_sessions ss ON ss.id = se.session_id
    JOIN scraped_pages sp ON sp.id = ss.page_id
    WHERE sq.id = scraped_question_options.question_id
      AND sp.is_published = TRUE
      AND sp.status = 'success'
  )
);

CREATE POLICY "Admins gerenciam scraped_question_correct_options"
ON scraped_question_correct_options
FOR ALL
USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('professor', 'admin'))
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('professor', 'admin'));

CREATE POLICY "Usuarios autenticados veem scraped_question_correct_options publicas"
ON scraped_question_correct_options
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM scraped_questions sq
    JOIN scraped_exercises se ON se.id = sq.exercise_id
    JOIN scraped_sessions ss ON ss.id = se.session_id
    JOIN scraped_pages sp ON sp.id = ss.page_id
    WHERE sq.id = scraped_question_correct_options.question_id
      AND sp.is_published = TRUE
      AND sp.status = 'success'
  )
);

CREATE POLICY "Admins gerenciam scraped_question_answer_keys"
ON scraped_question_answer_keys
FOR ALL
USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('professor', 'admin'))
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('professor', 'admin'));

CREATE POLICY "Usuarios autenticados veem scraped_question_answer_keys publicas"
ON scraped_question_answer_keys
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM scraped_questions sq
    JOIN scraped_exercises se ON se.id = sq.exercise_id
    JOIN scraped_sessions ss ON ss.id = se.session_id
    JOIN scraped_pages sp ON sp.id = ss.page_id
    WHERE sq.id = scraped_question_answer_keys.question_id
      AND sp.is_published = TRUE
      AND sp.status = 'success'
  )
);
