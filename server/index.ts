import "dotenv/config";
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { parse as parseCookie } from "cookie";
import { jwtVerify } from "jose";
import { appRouter } from "./routers";
import scriptApi from "./scriptApi";
import { getAdminUserById } from "./db";
import type { TrpcContext } from "./trpc";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const COOKIE_NAME = "app_session";

function getCookieSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-change-this");
}

async function createContext({ req, res }: { req: express.Request; res: express.Response }): Promise<TrpcContext> {
  let user = null;
  try {
    const cookies = parseCookie(req.headers.cookie || "");
    const token = cookies[COOKIE_NAME];
    if (token) {
      const { payload } = await jwtVerify(token, getCookieSecret(), { algorithms: ["HS256"] });
      if (payload.adminId) {
        user = await getAdminUserById(payload.adminId as number);
      }
    }
  } catch (e) {}
  return { req, res, user };
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  
  // Script API
  app.use("/api/script", scriptApi);
  
  // tRPC API
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));
  
  // Serve static files in production
  if (process.env.NODE_ENV === "production") {
    const publicPath = path.join(__dirname, "public");
    app.use(express.static(publicPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(publicPath, "index.html"));
    });
  } else {
    // Development: proxy to Vite
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: path.join(__dirname, "..", "client"),
    });
    app.use(vite.middlewares);
  }

  const port = parseInt(process.env.PORT || "3000");
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
