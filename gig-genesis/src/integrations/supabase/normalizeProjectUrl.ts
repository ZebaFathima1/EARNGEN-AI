/**
 * @supabase/supabase-js resolves `new URL('auth/v1', base)`. If `base` ends with `/rest/v1/`,
 * auth becomes `…/rest/v1/auth/v1` (invalid on hosted Supabase → "Invalid path specified in request URL").
 * Only the project root (https://<ref>.supabase.co) may be used.
 */
export function normalizeSupabaseProjectUrl(url: string): string {
  let u = url.trim();
  if ((u.startsWith('"') && u.endsWith('"')) || (u.startsWith("'") && u.endsWith("'"))) {
    u = u.slice(1, -1).trim();
  }
  while (/\/rest\/v1\/?$/i.test(u)) {
    u = u.replace(/\/rest\/v1\/?$/i, "");
  }
  u = u.replace(/\/+$/, "");
  try {
    const parsed = new URL(u);
    if (!parsed.hostname.endsWith(".supabase.co")) return u;
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return u;
  }
}
