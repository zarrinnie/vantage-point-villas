import { RenderMode, ServerRoute } from '@angular/ssr';
import { VILLA_SLUGS } from './core/data/villas.data';

export const serverRoutes: ServerRoute[] = [
  {
    // Every villa page is prerendered from the villa data file.
    path: 'villas/:slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return VILLA_SLUGS.map((slug) => ({ slug }));
    },
  },
  {
    // The booking flow is stateful and reads query parameters, so it renders
    // in the browser rather than being prerendered.
    path: 'book',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
