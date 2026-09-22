import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveOperationalMode } from "./contracts/operational-mode.js";
import { createExperienceService } from "./adapter/tentaciones-service-factory.js";
import { sanitizeErrorMessage } from "./security/demo-guardrails.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, "../../public");

const PORT = Number(process.env.PORT || 4000);
const modeConfig = resolveOperationalMode(process.env);
const service = createExperienceService(modeConfig);

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

    // Security headers (Zero trust, strict defense in depth)
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-Application-Id", "tentaciones-commerce");
    res.setHeader("X-Operational-Mode", service.operationalMode);
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;");

    // --- API Endpoints ---
    if (pathname.startsWith("/api/")) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");

      try {
        if (req.method === "GET" && pathname === "/api/health") {
          const health = await service.checkHealth();
          res.writeHead(200);
          res.end(JSON.stringify(health));
          return;
        }

        if (req.method === "GET" && pathname === "/api/metrics") {
          const metrics = await service.getCommercialMetrics();
          res.writeHead(200);
          res.end(JSON.stringify(metrics));
          return;
        }

        if (req.method === "GET" && pathname === "/api/products") {
          const category = parsedUrl.searchParams.get("category") as any;
          const products = await service.listCatalog({ category: category || undefined });
          res.writeHead(200);
          res.end(JSON.stringify(products));
          return;
        }

        if (req.method === "GET" && pathname.startsWith("/api/products/")) {
          const id = pathname.replace("/api/products/", "");
          const product = await service.getProduct(id);
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
              const result = await service.searchNaturalLanguage(data.query || "");
              res.writeHead(200);
              res.end(JSON.stringify(result));
            } catch (err) {
              res.writeHead(400);
              res.end(JSON.stringify({ error: sanitizeErrorMessage(err) }));
            }
          });
          return;
        }

        if (req.method === "POST" && pathname === "/api/cart/assist") {
          let body = "";
          req.on("data", (chunk) => { body += chunk; });
          req.on("end", async () => {
            try {
              const data = JSON.parse(body || "{}");
              const result = await service.assistCart(data.cartId || "cart-001", data.query || "");
              res.writeHead(200);
              res.end(JSON.stringify(result));
            } catch (err) {
              res.writeHead(400);
              res.end(JSON.stringify({ error: sanitizeErrorMessage(err) }));
            }
          });
          return;
        }

        if (req.method === "POST" && pathname === "/api/checkout") {
          let body = "";
          req.on("data", (chunk) => { body += chunk; });
          req.on("end", async () => {
            try {
              const data = JSON.parse(body || "{}");
              const result = await service.processCheckout(data.cartId, data.customer, data.shippingAddress);
              res.writeHead(result.success ? 200 : 400);
              res.end(JSON.stringify(result));
            } catch (err) {
              res.writeHead(400);
              res.end(JSON.stringify({ error: sanitizeErrorMessage(err) }));
            }
          });
          return;
        }

        res.writeHead(404);
        res.end(JSON.stringify({ error: "API endpoint not found" }));
        return;
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: sanitizeErrorMessage(err) }));
        return;
      }
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
    console.log(`  Operational Mode: ${service.operationalMode}`);
    console.log(`  Local URL:        http://127.0.0.1:${PORT}`);
    console.log(`============================================================`);
  });
}
