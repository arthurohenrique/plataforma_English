CREATE TABLE IF NOT EXISTS scraped_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES scraped_pages(id) ON DELETE CASCADE,
  asset_url TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('image', 'icon')),
  alt_text TEXT,
  title TEXT,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  ordem INTEGER NOT NULL DEFAULT 0,
  source_pass TEXT NOT NULL DEFAULT 'merged' CHECK (source_pass IN ('visible_dom', 'interactive', 'merged')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (page_id, asset_type, asset_url)
);

CREATE INDEX IF NOT EXISTS idx_scraped_assets_page_id ON scraped_assets(page_id);
CREATE INDEX IF NOT EXISTS idx_scraped_assets_asset_type ON scraped_assets(asset_type);

DROP TRIGGER IF EXISTS trg_scraped_assets_updated_at ON scraped_assets;
CREATE TRIGGER trg_scraped_assets_updated_at
BEFORE UPDATE ON scraped_assets
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

ALTER TABLE scraped_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins gerenciam scraped_assets"
ON scraped_assets
FOR ALL
USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('professor', 'admin'))
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('professor', 'admin'));

CREATE POLICY "Usuarios autenticados veem scraped_assets publicados"
ON scraped_assets
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM scraped_pages
    WHERE scraped_pages.id = scraped_assets.page_id
      AND scraped_pages.is_published = TRUE
      AND scraped_pages.status = 'success'
  )
);
