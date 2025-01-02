import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom", "axios"], // Odvojeni chunk-ovi za veće biblioteke
        },
      },
    },
  },
  plugins: [react()],
});
