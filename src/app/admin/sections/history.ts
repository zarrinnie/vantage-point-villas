import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminApi, BackupInfo } from '../admin-api.service';
import { AdminStore } from '../admin-store.service';
import { messageOf } from '../media.service';
import { withDefaults } from '../../core/content/default-content';

/** Earlier published versions, newest first, each one restorable. */
@Component({
  selector: 'admin-history',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [DatePipe],
  template: `
    @if (error()) {
      <p class="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{{ error() }}</p>
    }
    @if (notice()) {
      <p class="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{{ notice() }}</p>
    }

    <ul class="adm-card divide-y divide-ink-900/10">
      @for (backup of backups(); track backup.id; let first = $first) {
        <li class="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p class="text-sm text-ink-900">
              Published on {{ backup.savedAt | date: 'd MMMM y, HH:mm' }}
              @if (first) {
                <span class="ml-2 rounded bg-sand-100 px-1.5 py-0.5 text-[0.65rem] text-ink-600">most recent</span>
              }
            </p>
            <p class="text-xs text-ink-500">{{ (backup.size / 1024).toFixed(0) }} KB</p>
          </div>
          <div class="flex gap-2">
            @if (confirming() === backup.id) {
              <span class="self-center text-xs text-ink-600">Make this version live again?</span>
              <button type="button" class="adm-btn-primary py-1.5 text-xs" [disabled]="busy()" (click)="restore(backup.id)">
                Restore
              </button>
              <button type="button" class="adm-btn" (click)="confirming.set(null)">Cancel</button>
            } @else {
              <button type="button" class="adm-btn" [disabled]="busy()" (click)="edit(backup.id)">Open as draft</button>
              <button type="button" class="adm-btn" [disabled]="busy()" (click)="confirming.set(backup.id)">Restore…</button>
            }
          </div>
        </li>
      } @empty {
        <li class="px-4 py-10 text-center text-sm text-ink-500">
          {{ loaded() ? 'No earlier versions yet. One is kept every time you publish.' : 'Loading…' }}
        </li>
      }
    </ul>
  `,
})
export class HistoryComponent {
  private readonly api = inject(AdminApi);
  private readonly store = inject(AdminStore);

  protected readonly backups = signal<BackupInfo[]>([]);
  protected readonly loaded = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);
  protected readonly confirming = signal<string | null>(null);

  constructor() {
    void this.refresh();
  }

  /** Load an old version into the editor without publishing it. */
  protected async edit(id: string): Promise<void> {
    await this.run(async () => {
      // Older versions may predate newer fields; fill those in from the defaults.
      this.store.replaceDraft(withDefaults(await this.api.backup(id)));
      this.notice.set('That version is now your draft. Review it, then publish to make it live.');
    });
  }

  protected async restore(id: string): Promise<void> {
    await this.run(async () => {
      this.store.adopt(await this.api.restore(id));
      this.notice.set('Restored. The live site shows that version again (the one it replaced is still here).');
      this.confirming.set(null);
      await this.refresh();
    });
  }

  private async refresh(): Promise<void> {
    try {
      this.backups.set(await this.api.backups());
    } catch (error) {
      this.error.set(messageOf(error));
    }
    this.loaded.set(true);
  }

  private async run(task: () => Promise<void>): Promise<void> {
    this.busy.set(true);
    this.error.set(null);
    this.notice.set(null);
    try {
      await task();
    } catch (error) {
      this.error.set(messageOf(error));
    } finally {
      this.busy.set(false);
    }
  }
}
