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
-- CONTEUDOS (colecoes de conhecimento)
-- =============================================
CREATE TABLE conteudos (
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
  conteudo_id UUID REFERENCES conteudos(id) ON DELETE CASCADE NOT NULL,
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
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conteudos ENABLE ROW LEVEL SECURITY;
ALTER TABLE modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE aulas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario ve proprio perfil" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin ve todos os perfis" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('professor', 'admin'))
);

CREATE POLICY "Usuario autenticado ve conteudos publicados" ON conteudos FOR SELECT USING (
  publicado = TRUE
);
CREATE POLICY "Professor gerencia conteudos" ON conteudos FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('professor', 'admin'))
);

CREATE POLICY "Usuario autenticado ve modulos publicados de conteudos publicados" ON modulos FOR SELECT USING (
  publicado = TRUE
  AND EXISTS (SELECT 1 FROM conteudos c WHERE c.id = modulos.conteudo_id AND c.publicado = TRUE)
);
CREATE POLICY "Professor gerencia modulos" ON modulos FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('professor', 'admin'))
);

CREATE POLICY "Usuario autenticado ve aulas publicadas de modulos publicados" ON aulas FOR SELECT USING (
  publicada = TRUE
  AND EXISTS (
    SELECT 1
    FROM modulos mo
    JOIN conteudos c ON c.id = mo.conteudo_id
    WHERE mo.id = aulas.modulo_id AND mo.publicado = TRUE AND c.publicado = TRUE
  )
);
CREATE POLICY "Professor gerencia aulas" ON aulas FOR ALL USING (
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
