/**
 * Vercel Function entry point.
 *
 * `src/server.ts` builds the Express app (the /api routes, the uploads and the
 * Angular SSR handler) and exports it as a Node request handler. Vercel has no
 * way to find that by itself, so this file is the one thing it invokes, and
 * `vercel.json` rewrites every request to it.
 *
 * The build output is pulled in dynamically so the module is only loaded once
 * the function is actually invoked; `functions.includeFiles` in vercel.json is
 * what puts `dist/` inside the bundle.
 */
let handler;

export default async function (req, res) {
  handler ??= (await import('../dist/vantage-point-villas/server/server.mjs')).reqHandler;

  // A rewrite should hand the function the original path. Log it once so a
  // deployment that behaves differently is obvious in the function log rather
  // than showing up as a mysterious 404.
  if (process.env['VPV_LOG_PATHS']) console.log('[vercel]', req.method, req.url);

  return handler(req, res);
}
