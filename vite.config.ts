import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    // Raise warning limit slightly — pdfjs core is legitimately large
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // pdfjs core — largest chunk, split so it can be cached independently
          if (id.includes("pdfjs-dist")) return "vendor-pdfjs";
          // jszip — only needed after conversion
          if (id.includes("jszip")) return "vendor-jszip";
          // framer-motion — animation library, not needed for first paint
          if (id.includes("framer-motion")) return "vendor-framer";
          // react + react-dom
          if (id.includes("node_modules/react")) return "vendor-react";
        },
      },
    },
  },
});

