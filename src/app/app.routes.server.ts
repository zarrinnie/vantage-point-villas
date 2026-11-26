import { RenderMode, ServerRoute } from '@angular/ssr';

/*
 * Pages are rendered on the server for every request (not prerendered at build
 * time), so edits saved in the admin are live immediately without a rebuild.
 */
export const serverRoutes: ServerRoute[] = [
  {
    // The booking flow is stateful and reads query parameters, so it renders
    // in the browser rather than on the server.
    path: 'book',
    renderMode: RenderMode.Client,
  },
  {
    // The admin is a private, interactive tool: no server rendering, no SEO.
    path: 'admin',
    renderMode: RenderMode.Client,
  },
  {
    path: 'admin/**',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
