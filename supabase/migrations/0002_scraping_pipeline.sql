CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS scrape_runs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source_name TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMP WITH TIME ZONE,
  seed_count INTEGER NOT NULL DEFAULT 0,
  ok_count INTEGER NOT NULL DEFAULT 0,
  blocked_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  changed_count INTEGER NOT NULL DEFAULT 0,
  unchanged_count INTEGER NOT NULL DEFAULT 0,
  ignored_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS scraped_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id BIGINT NOT NULL REFERENCES scrape_runs(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  url_normalized TEXT NOT NULL,
  canonical_url TEXT,
  title TEXT,
  h1 TEXT,
  content_text TEXT,
  content_html TEXT,
  content_hash TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'blocked', 'error')),
  error_message TEXT,
  http_status INTEGER,
  first_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scraped_links (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES scraped_pages(id) ON DELETE CASCADE,
  href TEXT NOT NULL,
  link_text TEXT NOT NULL DEFAULT '',
  is_internal BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (page_id, href)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_scraped_pages_unique_success_version
  ON scraped_pages (url_normalized, content_hash)
  WHERE status = 'success' AND content_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_scraped_pages_run_id ON scraped_pages(run_id);
CREATE INDEX IF NOT EXISTS idx_scraped_pages_status ON scraped_pages(status);
CREATE INDEX IF NOT EXISTS idx_scraped_pages_url_normalized ON scraped_pages(url_normalized);
CREATE INDEX IF NOT EXISTS idx_scraped_links_page_id ON scraped_links(page_id);

CREATE OR REPLACE FUNCTION public.set_scraped_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_scraped_pages_updated_at ON scraped_pages;
CREATE TRIGGER trg_scraped_pages_updated_at
BEFORE UPDATE ON scraped_pages
FOR EACH ROW
EXECUTE FUNCTION public.set_scraped_pages_updated_at();

ALTER TABLE scrape_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins gerenciam scrape_runs"
ON scrape_runs
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('professor', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('professor', 'admin')
  )
);

CREATE POLICY "Usuarios autenticados veem runs finalizadas"
ON scrape_runs
FOR SELECT
USING (finished_at IS NOT NULL);

CREATE POLICY "Admins gerenciam scraped_pages"
ON scraped_pages
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('professor', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('professor', 'admin')
  )
);

CREATE POLICY "Usuarios autenticados veem paginas publicadas"
ON scraped_pages
FOR SELECT
USING (is_published = TRUE AND status = 'success');

CREATE POLICY "Admins gerenciam scraped_links"
ON scraped_links
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('professor', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('professor', 'admin')
  )
);

CREATE POLICY "Usuarios autenticados veem links de paginas publicadas"
ON scraped_links
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM scraped_pages
    WHERE scraped_pages.id = scraped_links.page_id
      AND scraped_pages.is_published = TRUE
      AND scraped_pages.status = 'success'
  )
);
