import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * A single line-art icon set, drawn as stroked paths on a 24×24 grid so every
 * icon shares one weight. Add a key here and it becomes available everywhere.
 */
const PATHS: Record<string, readonly string[]> = {
  // ---- Amenities --------------------------------------------------------
  pool: [
    'M3 15.5c2-2 4-2 6 0s4 2 6 0 4-2 6 0',
    'M3 19.5c2-2 4-2 6 0s4 2 6 0 4-2 6 0',
    'M8 14V6a2 2 0 0 1 4 0v8',
    'M8 9.5h4',
  ],
  wifi: ['M4.5 12.5a10.5 10.5 0 0 1 15 0', 'M8 16a6 6 0 0 1 8 0', 'M12 19.5h.01'],
  parking: ['M4 4h16v16H4z', 'M10 16.5V8h3a2.5 2.5 0 0 1 0 5h-3'],
  air: [
    'M3 4.5h18v6H3z',
    'M6 15c1 1.6 2 1.6 3 0s2-1.6 3 0',
    'M14 15c1 1.6 2 1.6 3 0',
    'M6.5 7.5h11',
  ],
  kitchen: ['M4 10h16v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z', 'M9 7c0-1.2 1-1.2 1-2.5', 'M14 7c0-1.2 1-1.2 1-2.5'],
  fridge: ['M6 3h12v18H6z', 'M6 10h12', 'M9 6v2', 'M9 13v2.5'],
  tv: ['M3 5h18v11H3z', 'M9 20h6'],
  sofa: ['M4 11V8a2 2 0 0 1 4 0v3', 'M16 11V8a2 2 0 0 1 4 0v3', 'M3 11h18v6H3z', 'M6 17v2', 'M18 17v2'],
  terrace: ['M3 10.5a9 9 0 0 1 18 0z', 'M12 10.5V21', 'M8 21h8'],
  garden: ['M4 20C4 11 11 4 20 4c0 9-7 16-16 16z', 'M4.5 19.5c4-4 8-7 12-9'],
  breakfast: ['M4 8h12v5a6 6 0 0 1-12 0z', 'M16 9h2a2 2 0 0 1 0 5h-2', 'M3 21h16'],
  car: [
    'M3 18v-3l2-6a2 2 0 0 1 2-1.4h10A2 2 0 0 1 19 9l2 6v3z',
    'M3 15h18',
    'M8 18.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0',
    'M19 18.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0',
  ],
  laundry: ['M5 3h14v18H5z', 'M12 9a4 4 0 1 0 0 8 4 4 0 0 0 0-8', 'M8 6h.01', 'M11 6h.01'],
  bell: ['M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2.5h-15z', 'M10 19.5a2 2 0 0 0 4 0'],
  clock: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18', 'M12 7.5V12l3 2'],
  family: [
    'M7 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4',
    'M4 20v-5a3 3 0 0 1 6 0v5',
    'M16.5 7a2 2 0 1 1 0 4 2 2 0 0 1 0-4',
    'M13.5 20v-4a3 3 0 0 1 6 0v4',
  ],
  nosmoking: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18', 'M6 6l12 12', 'M7 12.5h6.5', 'M16 12.5h1'],
  nopets: [
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',
    'M6 6l12 12',
    'M9.5 10.5h.01',
    'M14.5 10.5h.01',
    'M12 13.5h.01',
  ],
  bed: ['M3 18.5v-7.5h12a4 4 0 0 1 4 4v3.5', 'M3 11V7', 'M7 11V9h5v2', 'M3 18.5h16'],
  bath: ['M4 11h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z', 'M7 11V6a2 2 0 0 1 4 0', 'M7 18v2', 'M17 18v2'],
  guests: ['M12 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6', 'M5 20v-1a7 7 0 0 1 14 0v1'],
  area: ['M4 4h16v16H4z', 'M4 9.5V4h5.5', 'M20 14.5V20h-5.5'],
  spa: [
    'M12 20.5c-4 0-7-3-7-6.5 3 0 5.5 1 7 3 1.5-2 4-3 7-3 0 3.5-3 6.5-7 6.5z',
    'M12 17.5c-2-2.5-3-5-3-7.5 0-2.5 1-4.5 3-6.5 2 2 3 4 3 6.5 0 2.5-1 5-3 7.5z',
  ],
  surf: ['M5 19.5C9 5.5 15 3.5 19 3.5c0 4-2 14-14 16z', 'M3 21.5c3-1 5.5-2.5 7.5-4.5'],
  leaf: ['M4 20C4 11 11 4 20 4c0 9-7 16-16 16z', 'M4.5 19.5c4-4 8-7 12-9'],
  pin: ['M12 21.5s7-6.5 7-11.5a7 7 0 1 0-14 0c0 5 7 11.5 7 11.5z', 'M12 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5'],
  phone: [
    'M7 3h3l2 5-2.2 1.2a9.5 9.5 0 0 0 4.8 4.8L16 12l5 2v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.2A2 2 0 0 1 6.5 3z',
  ],
  mail: ['M3 6h18v12H3z', 'M3 7l9 6 9-6'],
  whatsapp: [
    'M12 3a9 9 0 0 0-7.6 13.8L3 21l4.4-1.3A9 9 0 1 0 12 3z',
    'M9 9.2c0 3 2.8 5.8 5.8 5.8.9 0 1.4-1 .9-1.5l-1.4-1-1 .9c-1-.5-1.9-1.4-2.4-2.4l.9-1-1-1.4c-.5-.5-1.8 0-1.8.6z',
  ],

  // ---- Interface --------------------------------------------------------
  'arrow-right': ['M4 12h15', 'M13 6l6 6-6 6'],
  'arrow-left': ['M20 12H5', 'M11 6l-6 6 6 6'],
  'arrow-down': ['M12 4v15', 'M6 13l6 6 6-6'],
  check: ['M5 13l4 4 10-10'],
  close: ['M6 6l12 12', 'M18 6L6 18'],
  'chevron-left': ['M15 5l-7 7 7 7'],
  'chevron-right': ['M9 5l7 7-7 7'],
  'chevron-down': ['M5 9l7 7 7-7'],
  menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
  plus: ['M12 5v14', 'M5 12h14'],
  'arrow-up': ['M12 20V5', 'M6 11l6-6 6 6'],
  'chevron-up': ['M5 15l7-7 7 7'],
  trash: ['M4 7h16', 'M9 7V4h6v3', 'M6 7l1 13h10l1-13', 'M10 11v6', 'M14 11v6'],
  copy: ['M8 8h12v12H8z', 'M16 8V4H4v12h4'],
  external: ['M14 4h6v6', 'M20 4l-9 9', 'M18 14v6H4V6h6'],
  logout: ['M9 4H4v16h5', 'M16 8l4 4-4 4', 'M20 12H9'],
  undo: ['M9 7L4 12l5 5', 'M4 12h11a5 5 0 0 1 0 10h-2'],
  minus: ['M5 12h14'],
  star: ['M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-3-5.2 3 1-5.9-4.3-4.1 5.9-.8z'],
  calendar: ['M4 6h16v15H4z', 'M4 10.5h16', 'M8 3v4', 'M16 3v4'],
  sparkle: ['M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z', 'M18 16l.8 2.2L21 19l-2.2.8L18 22l-.8-2.2L15 19l2.2-.8z'],
  quote: ['M9 6c-3 1.5-4.5 4-4.5 7.5A3.5 3.5 0 0 0 8 17a3 3 0 0 0 0-6c-.6 0-1 .1-1.4.3C7 9.5 8 8 10 7z', 'M19 6c-3 1.5-4.5 4-4.5 7.5A3.5 3.5 0 0 0 18 17a3 3 0 0 0 0-6c-.6 0-1 .1-1.4.3C17 9.5 18 8 20 7z'],
  info: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18', 'M12 11v5', 'M12 8h.01'],
  warning: ['M12 4l9 16H3z', 'M12 10v4', 'M12 17h.01'],

  // ---- Social -----------------------------------------------------------
  instagram: [
    'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z',
    'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7',
    'M17 6.9h.01',
  ],
  facebook: ['M15 3h-2a4 4 0 0 0-4 4v3H6v4h3v7h4v-7h3l.8-4H13V8a1 1 0 0 1 1-1h1z'],
  tripadvisor: [
    'M8 9a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7',
    'M16 9a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7',
    'M8 12.4h.01',
    'M16 12.4h.01',
    'M9.5 7h5',
  ],
};

/** Every icon name, for pickers such as the admin's. */
export const ICON_NAMES: readonly string[] = Object.keys(PATHS);

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex shrink-0' },
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      [attr.fill]="filled() ? 'currentColor' : 'none'"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      @for (d of paths(); track $index) {
        <path [attr.d]="d" />
      }
    </svg>
  `,
})
export class IconComponent {
  readonly name = input.required<string>();
  readonly size = input(20);
  readonly filled = input(false);
  readonly strokeWidth = input(1.5);

  protected readonly paths = computed(() => PATHS[this.name()] ?? PATHS['info']);
}
