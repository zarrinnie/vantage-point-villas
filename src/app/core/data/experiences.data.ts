/* ============================================================================
 * EXPERIENCES — the three "things to do" cards on the home page.
 * Copy is editorial; photography is PLACEHOLDER (see images.data.ts).
 * ========================================================================== */
import { img } from './images.data';

export interface Experience {
  title: string;
  description: string;
  image: string;
  alt: string;
}

export const EXPERIENCES: readonly Experience[] = [
  {
    title: 'Surf breaks',
    description:
      'Uluwatu, Padang Padang and Bingin are all a short drive away — dawn sessions before the crowds, or lessons for first-timers.',
    image: img('exp-surf', 1000, 1250),
    alt: 'Open water off the Bukit peninsula',
  },
  {
    title: 'Clifftop sunsets',
    description:
      'Beach clubs, the Kecak dance at Uluwatu Temple, or simply the long staircase down to Green Bowl at golden hour.',
    image: img('exp-sunset', 1000, 1250),
    alt: 'A headland at sunset on the Bukit',
  },
  {
    title: 'Spa & wellness',
    description:
      'In-villa Balinese massage on request, and yoga shalas and day spas all over the peninsula.',
    image: img('exp-spa', 1000, 1250),
    alt: 'Dense tropical foliage in a villa garden',
  },
];
