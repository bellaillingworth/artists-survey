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

/**
 * GitHub Actions / .env often introduce wrapping quotes or trailing newlines
 * in secrets; those break fetch() and cause "TypeError: Failed to fetch".
 */
export function sanitizeViteSecret(raw: string | undefined): string {
  if (raw == null) return "";
  let s = raw.trim();
  // Strip one layer of ASCII quotes often pasted with secret values
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  s = s.replace(/^\uFEFF/, "");
  return s.trim();
}

function normalizeSupabaseUrl(raw: string): string {
  let url = sanitizeViteSecret(raw);
  if (!url) return url;
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  try {
    const u = new URL(url);
    // createClient expects project origin only, not /rest/v1 paths
    return u.origin;
  } catch {
    return url.replace(/\/+$/, "");
  }
}

function assertProjectUrlLooksLikeSupabase(rawUrl: string): void {
  let host: string;
  try {
    host = new URL(rawUrl).hostname.toLowerCase();
  } catch {
    throw new Error("VITE_SUPABASE_URL is not a valid URL.");
  }

  if (/^db\.[a-z0-9-]+\.supabase\.co$/i.test(host)) {
    throw new Error(
      "VITE_SUPABASE_URL looks like the Postgres host (db.*.supabase.co). " +
        "Use the REST Project URL from Supabase → Settings → API instead: https://<project-ref>.supabase.co",
    );
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
  const urlRaw = import.meta.env.VITE_SUPABASE_URL;
  const keyRaw = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const url = normalizeSupabaseUrl(urlRaw);
  const key = sanitizeViteSecret(keyRaw);

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }

  assertProjectUrlLooksLikeSupabase(url);

  if (!client) {
    client = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}
