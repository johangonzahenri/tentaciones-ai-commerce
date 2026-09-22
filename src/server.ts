import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TentacionesCommerceEngine } from "./engine/commerce-engine.js";
import { TentacionesPlatformAdapter } from "./adapter/tentaciones-platform-adapter.js";
import { PlatformClient } from "./adapter/platform-client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, "../../public");

const PORT = Number(process.env.PORT || 4000);
const PLATFORM_URL = process.env.PLATFORM_API_BASE_URL || "http://127.0.0.1:3000/api/v1";
const APPLICATION_ID = process.env.PLATFORM_APPLICATION_ID || "tentaciones-commerce";
const TENANT_ID = process.env.PLATFORM_TENANT_ID || "tenant-tentaciones";

// Initialize Engine and Platform Adapter
const engine = new TentacionesCommerceEngine();
let platformClient: PlatformClient | undefined = undefined;

try {
  platformClient = new PlatformClient({
    baseUrl: PLATFORM_URL,
    applicationId: APPLICATION_ID,
    tenantId: TENANT_ID,
  });
} catch {
  // Silent fallback to local engine
}

const adapter = new TentacionesPlatformAdapter({
  client: platformClient,
  localEngine: engine,
});

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

export function createServer(): http.Server {
  return http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const pathname = parsedUrl.pathname;

    // Security headers
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-Application-Id", APPLICATION_ID);
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;");

    // --- API Endpoints ---
    if (pathname.startsWith("/api/")) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");

      if (req.method === "GET" && pathname === "/api/health") {
        const health = await adapter.checkPlatformHealth();
        res.writeHead(200);
        res.end(JSON.stringify({ status: "OK", platform: health, applicationId: APPLICATION_ID, tenantId: TENANT_ID }));
        return;
      }

      if (req.method === "GET" && pathname === "/api/products") {
        const category = parsedUrl.searchParams.get("category") as any;
        const products = engine.listProducts({ category: category || undefined });
        res.writeHead(200);
        res.end(JSON.stringify(products));
        return;
      }

      if (req.method === "GET" && pathname.startsWith("/api/products/")) {
        const id = pathname.replace("/api/products/", "");
        const product = engine.getProductById(id) || engine.getProductBySlug(id);
        if (product) {
          res.writeHead(200);
          res.end(JSON.stringify(product));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ error: "Product not found" }));
        }
        return;
      }

      if (req.method === "POST" && pathname === "/api/search") {
        let body = "";
        req.on("data", (chunk) => { body += chunk; });
        req.on("end", async () => {
          try {
            const data = JSON.parse(body || "{}");
            const result = await adapter.discoverProducts(data.query || "");
            res.writeHead(200);
            res.end(JSON.stringify(result));
          } catch {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Invalid search payload" }));
          }
        });
        return;
      }

      if (req.method === "POST" && pathname === "/api/checkout") {
        let body = "";
        req.on("data", (chunk) => { body += chunk; });
        req.on("end", () => {
          try {
            const data = JSON.parse(body || "{}");
            const result = engine.processCheckout(data.cartId, data.customer, data.shippingAddress);
            res.writeHead(result.success ? 200 : 400);
            res.end(JSON.stringify(result));
          } catch {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Invalid checkout payload" }));
          }
        });
        return;
      }

      res.writeHead(404);
      res.end(JSON.stringify({ error: "API endpoint not found" }));
      return;
    }

    // --- Static File Serving ---
    let filePath = path.join(PUBLIC_DIR, pathname === "/" ? "index.html" : pathname);
    const ext = path.extname(filePath).toLowerCase();

    // Prevent directory traversal
    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        // Fallback to index.html for SPA routing
        fs.readFile(path.join(PUBLIC_DIR, "index.html"), (err2, data2) => {
          if (err2) {
            res.writeHead(404);
            res.end("Not Found");
          } else {
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.end(data2);
          }
        });
      } else {
        const contentType = MIME_TYPES[ext] || "application/octet-stream";
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
      }
    });
  });
}

// Start standalone server when executed directly
if (process.argv[1] && process.argv[1].endsWith("server.js")) {
  const server = createServer();
  server.listen(PORT, () => {
    console.log(`============================================================`);
    console.log(`  🛍️  Tentaciones AI Commerce Storefront`);
    console.log(`  Local URL:        http://127.0.0.1:${PORT}`);
    console.log(`  Parent Platform:  ${PLATFORM_URL}`);
    console.log(`  Application ID:   ${APPLICATION_ID}`);
    console.log(`============================================================`);
  });
}
