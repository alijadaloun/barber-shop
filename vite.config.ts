import { defineConfig } from "vite";
import { getViteConfig } from "./vite.shared";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    base: "/barber-shop/",
  });
