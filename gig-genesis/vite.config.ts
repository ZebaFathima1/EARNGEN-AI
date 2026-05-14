import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { defineConfig, loadEnv, mergeConfig } from "vite";
import type { PluginOption } from "vite";

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
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  // Expose Supabase URL + anon key to the client from SUPABASE_* only (no duplicate VITE_* in .env).
  const supabaseEnv = loadEnv(mode, process.cwd(), "SUPABASE_");
  if (supabaseEnv.SUPABASE_URL) {
    envDefine["import.meta.env.VITE_SUPABASE_URL"] = JSON.stringify(supabaseEnv.SUPABASE_URL);
  }
  if (supabaseEnv.SUPABASE_PUBLISHABLE_KEY) {
    envDefine["import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY"] = JSON.stringify(
      supabaseEnv.SUPABASE_PUBLISHABLE_KEY,
    );
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
