// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: {
    preset: "netlify",
  },
  vite: {
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        manifest: {
          name: "KidVolt",
          short_name: "KidVolt",
          description: "KidVolt - Fun Financial App for Kids",
          theme_color: "#6366f1",
          background_color: "#0f172a",
          display: "standalone",
          icons: [
            {
              src: "kidvolt-logo.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "kidvolt-logo.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
      }),
    ],
  },
});
