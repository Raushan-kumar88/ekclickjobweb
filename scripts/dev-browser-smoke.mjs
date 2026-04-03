#!/usr/bin/env node
/**
 * Smoke-test routes while `npm run dev` is running — no production build.
 *
 *   npm run smoke:dev
 *
 * Or: BASE_URL=http://127.0.0.1:3001 npm run smoke:dev
 */
const BASE = process.env.BASE_URL || "http://127.0.0.1:3000";
const TIMEOUT_MS = 20000;

const ROUTES = [
  // Public
  ["/", 200],
  ["/jobs", 200],
  ["/companies", 200],
  ["/blog", 200],
  ["/trends", 200],
  ["/pricing", 200],
  ["/about", 200],
  ["/contact", 200],
  ["/login", 200],
  ["/register", 200],
  ["/privacy", 200],
  ["/terms", 200],
  ["/robots.txt", 200],
  ["/sitemap.xml", 200],
  ["/companies/compare", 200],
  ["/blog/how-to-write-a-resume-that-gets-noticed-2026", 200],
  ["/jobs?fresher=true", 200],
  // Protected — unauthenticated should redirect to login
  ["/seeker/dashboard", 307],
  ["/employer/dashboard", 307],
];

async function check(path, expect) {
  const url = `${BASE}${path.startsWith("/") ? path : "/" + path}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      redirect: "manual",
      signal: ctrl.signal,
      headers: { Accept: "text/html,application/xml,*/*" },
    });
    clearTimeout(t);
    const status = res.status;
    const ok =
      status === expect ||
      (expect === 307 && (status === 302 || status === 307 || status === 308));
    return { path, status, expect, ok };
  } catch (e) {
    clearTimeout(t);
    return { path, status: "ERR", expect, ok: false, error: e.name === "AbortError" ? "timeout" : String(e.message) };
  }
}

async function main() {
  console.log(`EkClickJob dev smoke test → ${BASE}\n`);
  let failed = 0;
  for (const [path, expect] of ROUTES) {
    const r = await check(path, expect);
    const tag = r.ok ? "OK  " : "FAIL";
    const extra = r.error ? ` (${r.error})` : !r.ok ? ` (wanted ${expect})` : "";
    console.log(`${tag} ${path.padEnd(52)} ${r.status}${extra}`);
    if (!r.ok) failed++;
  }
  console.log(failed ? `\n${failed} failed — fix errors above.` : "\nAll checks passed.");
  process.exit(failed ? 1 : 0);
}

main();
