import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function listPublishedScrapedPages(limit = 50) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("scraped_pages")
    .select("id, url, canonical_url, title, h1, content_text, is_published, last_seen_at")
    .eq("status", "success")
    .eq("is_published", true)
    .order("last_seen_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Falha ao consultar conteudo publicado: ${error.message}`);
  }

  return data;
}
