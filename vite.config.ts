import { defineConfig } from "vite";
import { getViteConfig } from "./vite.shared";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    base: "/barber-shop/",
  });
