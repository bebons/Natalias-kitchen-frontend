import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: "dist", // Ovdje se postavlja izlazni direktorijum
  },
  plugins: [react()],
});
