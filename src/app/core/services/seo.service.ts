import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ContentService } from '../content/content.service';

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
  private readonly content = inject(ContentService);

  set({ title, description, image }: PageMeta): void {
    const name = this.content.site().name;
    const fullTitle = !name || title.includes(name) ? title : `${title} — ${name}`;
    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    if (image) {
      this.meta.updateTag({ property: 'og:image', content: image });
    }
  }
}
