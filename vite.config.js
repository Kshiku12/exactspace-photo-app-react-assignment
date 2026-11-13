import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Vite server middleware + proxy for https://picsum.photos/v2/list?page=N
 * Solves any browser CORS or redirect issue as noted in reactjs_photo_gallery_assignment.md
 * with a strict 900ms timeout so ISP-blocked connections fail fast and never stall the UI.
 */
function picsumFeedProxyPlugin() {
  return {
    name: "picsum-feed-proxy",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith("/api/picsum")) {
          return next();
        }
        try {
          const urlObj = new URL(req.url, "http://localhost:5174");
          const page = urlObj.searchParams.get("page") || "1";
          const limit = urlObj.searchParams.get("limit") || "12";
          const target = `https://picsum.photos/v2/list?page=${encodeURIComponent(
            page
          )}&limit=${encodeURIComponent(limit)}`;

          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 900);
          const upstream = await fetch(target, {
            headers: { Accept: "application/json" },
            signal: controller.signal,
          });
          clearTimeout(timer);

          if (!upstream.ok) {
            res.statusCode = upstream.status;
            res.end(JSON.stringify([]));
            return;
          }
          const data = await upstream.json();
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.end(JSON.stringify(data));
        } catch (err) {
          res.statusCode = 502;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), picsumFeedProxyPlugin()],
  server: {
    port: 5174,
    proxy: {
      "/v2": {
        target: "https://picsum.photos",
        changeOrigin: true,
        secure: true,
        timeout: 900,
      },
      "/id": {
        target: "https://picsum.photos",
        changeOrigin: true,
        secure: true,
        timeout: 900,
      },
    },
  },
});
