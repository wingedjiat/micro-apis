// Minimal zero-dependency HTTP server for local runs and simple hosting
// (Render, Fly, Railway, a VM). For Vercel, use the handlers in /api instead.
import http from "node:http";
import { parseMalaysianIC, isValidMalaysianIC } from "./src/ic/index.js";

const PORT = process.env.PORT || 3000;

function json(res, status, body) {
  const payload = JSON.stringify(body, null, 2);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
  });
  res.end(payload);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const ic = url.searchParams.get("ic");

  if (url.pathname === "/health") return json(res, 200, { status: "ok" });

  if (url.pathname === "/ic/parse") {
    if (!ic) return json(res, 400, { error: 'Missing required query parameter "ic".' });
    return json(res, 200, parseMalaysianIC(ic));
  }

  if (url.pathname === "/ic/validate") {
    if (!ic) return json(res, 400, { error: 'Missing required query parameter "ic".' });
    return json(res, 200, { ic, valid: isValidMalaysianIC(ic) });
  }

  if (url.pathname === "/") {
    return json(res, 200, {
      name: "micro-apis",
      endpoints: {
        "GET /ic/parse?ic=YYMMDD-PB-####": "Parse a Malaysian IC into its parts.",
        "GET /ic/validate?ic=YYMMDD-PB-####": "Validate a Malaysian IC (boolean).",
        "GET /health": "Liveness check.",
      },
    });
  }

  return json(res, 404, { error: "Not found." });
});

server.listen(PORT, () => {
  console.log(`micro-apis listening on http://localhost:${PORT}`);
});
