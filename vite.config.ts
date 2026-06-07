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
      // Use Vite's default chunking algorithm to prevent CJS/ESM interop issues
    },
  },
}));
