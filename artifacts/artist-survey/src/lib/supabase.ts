import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** Hostnames that are almost always a mistaken “API URL” in env. */
const LIKELY_STATIC_SITE_HOSTS = [
  "azurestaticapps.net",
  "azurewebsites.net",
  "netlify.app",
  "github.io",
  "pages.dev",
  "vercel.app",
];

function assertProjectUrlLooksLikeSupabase(rawUrl: string): void {
  let host: string;
  try {
    host = new URL(rawUrl).hostname.toLowerCase();
  } catch {
    throw new Error("VITE_SUPABASE_URL is not a valid URL.");
  }

  for (const suffix of LIKELY_STATIC_SITE_HOSTS) {
    if (host === suffix || host.endsWith(`.${suffix}`)) {
      throw new Error(
        `VITE_SUPABASE_URL points at "${host}" (a static/site host), not Supabase. ` +
          "Use Project URL from Supabase → Settings → API (typically https://<ref>.supabase.co). " +
          "It must be available when the app is built (e.g. GitHub Actions env), not only at runtime on Azure.",
      );
    }
  }
}

export function getSupabase(): SupabaseClient {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url?.trim() || !key?.trim()) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }

  const trimmedUrl = url.trim();
  assertProjectUrlLooksLikeSupabase(trimmedUrl);

  if (!client) {
    client = createClient(trimmedUrl, key.trim(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}
