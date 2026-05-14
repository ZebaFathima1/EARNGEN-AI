import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { defineConfig, loadEnv, mergeConfig } from "vite";
import type { PluginOption } from "vite";
import { normalizeSupabaseProjectUrl } from "./src/integrations/supabase/normalizeProjectUrl";

export default defineConfig(({ mode }) => {
  const plugins: PluginOption[] = [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    ...tanstackStart({
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
    }),
    nitro(),
    viteReact(),
  ];

  const envDefine: Record<string, string> = {};
  const loadedEnv = loadEnv(mode, process.cwd(), "VITE_");
  for (const [key, value] of Object.entries(loadedEnv)) {
    // Filled below so we always normalize URL (Vercel often sets only VITE_* or includes /rest/v1).
    if (key === "VITE_SUPABASE_URL" || key === "VITE_SUPABASE_PUBLISHABLE_KEY") continue;
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  const supabaseEnv = loadEnv(mode, process.cwd(), "SUPABASE_");
  const rawUrl = supabaseEnv.SUPABASE_URL ?? loadedEnv.VITE_SUPABASE_URL;
  const rawKey = supabaseEnv.SUPABASE_PUBLISHABLE_KEY ?? loadedEnv.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (rawUrl) {
    envDefine["import.meta.env.VITE_SUPABASE_URL"] = JSON.stringify(normalizeSupabaseProjectUrl(rawUrl));
  }
  if (rawKey) {
    const k = String(rawKey).trim().replace(/^["']|["']$/g, "");
    envDefine["import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY"] = JSON.stringify(k);
  }

  return mergeConfig(
    {
      define: envDefine,
      resolve: {
        alias: { "@": path.resolve(process.cwd(), "src") },
        dedupe: [
          "react",
          "react-dom",
          "react/jsx-runtime",
          "react/jsx-dev-runtime",
          "@tanstack/react-query",
          "@tanstack/query-core",
        ],
      },
      server: { host: "::", port: 8080 },
      plugins,
    },
    {},
  );
});
