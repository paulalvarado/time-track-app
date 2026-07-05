import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["icons/*.png"],
        manifest: {
          name: "Time Track",
          short_name: "TimeTrack",
          description: "Time tracking app with Odoo integration",
          theme_color: "#1e293b",
          icons: [
            { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
            { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          ],
        },
      }),
    ],
    server: {
      port: Number(env.VITE_DEV_PORT) || 5173,
      proxy: {
        "/api": env.VITE_API_URL || "http://localhost:3000",
      },
    },
  };
});
