import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SITE } from '../data/site.data';

export interface PageMeta {
  title: string;
  description: string;
  image?: string;
}

/** Sets the document title and the handful of meta tags that matter per page. */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  set({ title, description, image }: PageMeta): void {
    const fullTitle = title.includes(SITE.name) ? title : `${title} — ${SITE.name}`;
    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    if (image) {
      this.meta.updateTag({ property: 'og:image', content: image });
    }
  }
}
