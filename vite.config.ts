import path from "node:path";
import fs from "node:fs";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";

/**
 * 개발 서버(`npm run dev`)에서 api/*.ts를 Vercel Serverless Function과 동일한 방식으로 실행한다.
 * 프로덕션에서는 Vercel이 api/ 디렉토리를 자동으로 서버리스 함수로 배포하므로 이 플러그인은 사용되지 않는다.
 */
function apiDevPlugin(): Plugin {
  return {
    name: "api-dev-middleware",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/api", async (req, res, next) => {
        try {
          const url = new URL(req.url ?? "/", "http://localhost");
          const routeName = url.pathname.replace(/^\/+/, "").split("/")[0];
          if (!routeName) {
            next();
            return;
          }
          const modulePath = path.resolve(
            import.meta.dirname,
            `api/${routeName}.ts`
          );
          if (!fs.existsSync(modulePath)) {
            next();
            return;
          }

          const mod = await server.ssrLoadModule(`/api/${routeName}.ts`);
          const handler = mod.default;

          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(chunk as Buffer);
          }
          const raw = Buffer.concat(chunks).toString("utf-8");
          (req as typeof req & { body?: unknown }).body = raw
            ? JSON.parse(raw)
            : {};

          const resWithHelpers = res as typeof res & {
            status: (code: number) => typeof res;
            json: (body: unknown) => void;
          };
          resWithHelpers.status = (code: number) => {
            res.statusCode = code;
            return res;
          };
          resWithHelpers.json = (body: unknown) => {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(body));
          };

          await handler(req, resWithHelpers);
        } catch (err) {
          console.error("[api-dev-middleware]", err);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "internal_error" }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), apiDevPlugin()],
});
