"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Singleton do browser client. Usa apenas a chave PUBLISHABLE (segura no
// front-end desde que as policies de RLS estejam corretas — ver
// supabase/migrations/0001_init.sql).

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local (veja .env.local.example).",
    );
  }
  client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  });
  return client;
}

/** true quando as variáveis de ambiente do Supabase estão presentes. */
export const isSupabaseConfigured = Boolean(url && anonKey);
