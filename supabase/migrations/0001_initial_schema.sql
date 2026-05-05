-- =============================================
-- PROFILES (estende auth.users do Supabase)
-- =============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'aluno' CHECK (role IN ('aluno', 'professor', 'admin')),
  avatar_url TEXT,
  whatsapp TEXT,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CURSOS
-- =============================================
CREATE TABLE cursos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  nivel TEXT CHECK (nivel IN ('basico', 'intermediario', 'avancado', 'todos')),
  thumbnail_url TEXT,
  professor_id UUID REFERENCES profiles(id),
  ordem INTEGER DEFAULT 0,
  publicado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- MODULOS / CAPITULOS
-- =============================================
CREATE TABLE modulos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  tema TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  publicado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- AULAS (videoaulas individuais)
-- =============================================
CREATE TABLE aulas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  modulo_id UUID REFERENCES modulos(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  video_url TEXT,
  video_tipo TEXT DEFAULT 'youtube' CHECK (video_tipo IN ('youtube', 'vimeo', 'upload', 'externo')),
  duracao_segundos INTEGER,
  thumbnail_url TEXT,
  materiais_url TEXT[],
  ordem INTEGER NOT NULL DEFAULT 0,
  publicada BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PROGRESSO DO ALUNO
-- =============================================
CREATE TABLE progresso (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  aula_id UUID REFERENCES aulas(id) ON DELETE CASCADE NOT NULL,
  assistida BOOLEAN DEFAULT FALSE,
  posicao_segundos INTEGER DEFAULT 0,
  concluida_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(aluno_id, aula_id)
);

-- =============================================
-- MATRICULAS
-- =============================================
CREATE TABLE matriculas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE NOT NULL,
  ativa BOOLEAN DEFAULT TRUE,
  data_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_fim TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(aluno_id, curso_id)
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE progresso ENABLE ROW LEVEL SECURITY;
ALTER TABLE matriculas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario ve proprio perfil" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin ve todos os perfis" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('professor', 'admin'))
);

CREATE POLICY "Aluno ve cursos publicados em que esta matriculado" ON cursos FOR SELECT USING (
  publicado = TRUE AND EXISTS (
    SELECT 1 FROM matriculas WHERE aluno_id = auth.uid() AND curso_id = cursos.id AND ativa = TRUE
  )
);
CREATE POLICY "Professor gerencia proprios cursos" ON cursos FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('professor', 'admin'))
);

CREATE POLICY "Aluno ve modulos de cursos matriculados" ON modulos FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM cursos c
    JOIN matriculas m ON m.curso_id = c.id
    WHERE c.id = modulos.curso_id AND m.aluno_id = auth.uid() AND m.ativa = TRUE AND c.publicado = TRUE
  )
);
CREATE POLICY "Professor gerencia modulos" ON modulos FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('professor', 'admin'))
);

CREATE POLICY "Aluno ve aulas de cursos matriculados" ON aulas FOR SELECT USING (
  publicada = TRUE AND EXISTS (
    SELECT 1 FROM modulos mo
    JOIN cursos c ON c.id = mo.curso_id
    JOIN matriculas m ON m.curso_id = c.id
    WHERE mo.id = aulas.modulo_id AND m.aluno_id = auth.uid() AND m.ativa = TRUE
  )
);
CREATE POLICY "Professor gerencia aulas" ON aulas FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('professor', 'admin'))
);

CREATE POLICY "Aluno gerencia proprio progresso" ON progresso FOR ALL USING (aluno_id = auth.uid());
CREATE POLICY "Professor ve progresso dos alunos" ON progresso FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('professor', 'admin'))
);

CREATE POLICY "Aluno ve propria matricula" ON matriculas FOR SELECT USING (aluno_id = auth.uid());
CREATE POLICY "Professor gerencia matriculas" ON matriculas FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('professor', 'admin'))
);

-- =============================================
-- TRIGGER: criar profile automaticamente no cadastro
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Aluno'), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
