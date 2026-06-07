import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { compression } from "vite-plugin-compression2";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Generate .gz and .br compressed assets for CDN / static hosting
    mode === "production" && compression({ algorithm: "gzip", exclude: [/\.(br)$/] }),
    mode === "production" && compression({ algorithm: "brotliCompress", exclude: [/\.(gz)$/] }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      },
      manifest: {
        name: 'Signova Admin',
        short_name: 'Signova',
        description: 'Signova Admin Portal',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
    ],
  },
  build: {
    // Warn when a single chunk exceeds 400 KB
    chunkSizeWarningLimit: 400,
    // Use esbuild for minification (faster than terser, comparable output)
    minify: "esbuild",
    // Inline assets < 4 KB as base64 (avoids extra HTTP requests)
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        // Split vendor code into cacheable chunks by logical group
        manualChunks(id) {
          // React core — changes almost never, highest cache value
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/") || id.includes("node_modules/react-router-dom/") || id.includes("node_modules/scheduler/")) {
            return "vendor-react";
          }
          // Supabase auth client
          if (id.includes("node_modules/@supabase/")) {
            return "vendor-supabase";
          }
          // Recharts + D3 internals — heaviest chart dependency, load only on dashboard
          if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-") || id.includes("node_modules/victory-vendor")) {
            return "vendor-charts";
          }
          // Radix UI primitives — large but stable, cache well together
          if (id.includes("node_modules/@radix-ui/")) {
            return "vendor-radix";
          }
          // Everything else from node_modules
          if (id.includes("node_modules/")) {
            return "vendor-misc";
          }
        },
      },
    },
  },
}));
