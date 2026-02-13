/// <reference types="vitest" />
import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          // Inject data-source attribute for AI agent source location
          "./scripts/babel-plugin-jsx-source-location.cjs",
        ],
      },
    }),
    tailwindcss(),
  ],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  base: "./",
  build: { 
    outDir: "dist", 
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        about: path.resolve(__dirname, 'about.html'),
        experience: path.resolve(__dirname, 'experience.html'),
        projects: path.resolve(__dirname, 'projects.html'),
        contact: path.resolve(__dirname, 'contact.html'),
        learning: path.resolve(__dirname, 'learning.html'),
        notfound: path.resolve(__dirname, '404.html'),
      }
    }
  },
  // @ts-ignore - Vitest config not in Vite types
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
