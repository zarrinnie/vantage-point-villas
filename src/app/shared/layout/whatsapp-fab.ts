import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IconComponent } from '../ui/icon';
import { ContentService } from '../../core/content/content.service';

/** Floating WhatsApp button, as on most Bali villa sites. */
@Component({
  selector: 'app-whatsapp-fab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <a
      [href]="content.links().whatsapp"
      target="_blank"
      rel="noopener"
      class="group fixed right-4 bottom-4 z-40 flex items-center gap-3 rounded-full bg-palm-700 py-3 pr-5 pl-4 text-sand-50 shadow-xl shadow-ink-900/25 transition-colors duration-500 hover:bg-palm-800 md:right-6 md:bottom-6"
    >
      <app-icon name="whatsapp" [size]="20" />
      <span class="text-[0.65rem] font-medium tracking-[0.18em] uppercase">
        {{ content.pages().shared.whatsappButton }}
      </span>
      <span class="sr-only">(opens WhatsApp in a new tab)</span>
    </a>
  `,
})
export class WhatsappFabComponent {
  protected readonly content = inject(ContentService);
}
