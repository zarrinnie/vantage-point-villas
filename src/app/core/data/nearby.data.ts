/* ============================================================================
 * THE NEIGHBOURHOOD — distances VERIFIED from the property's public listings.
 * The descriptive sentences are editorial.
 * ========================================================================== */
import { Nearby } from '../models/content.model';

export const NEARBY: readonly Nearby[] = [
  {
    name: 'Ngurah Rai International Airport',
    distance: '5 km · about 20 min by car',
    detail: 'Close enough that a late landing is still an easy first night.',
    verified: true,
  },
  {
    name: 'Nirmala Waterpark',
    distance: '2 km · 5–10 min by car',
    detail: 'The simplest afternoon out with children on the whole peninsula.',
    verified: true,
  },
  {
    name: 'Garuda Wisnu Kencana Cultural Park',
    distance: '2.1 km',
    detail: 'The Bukit landmark — go late in the day, when the heat drops.',
    verified: true,
  },
  {
    name: 'Green Bowl Beach, Ungasan',
    distance: '2.9 km',
    detail: 'Down a long staircase to a cove that empties out at low tide.',
    verified: true,
  },
  {
    name: 'Masjid Agung Palapa',
    distance: '25-minute walk',
    detail: 'The centre of the village, and the shops and warungs around it.',
    verified: true,
  },
  {
    name: 'Uluwatu Temple & the Kecak dance',
    distance: 'about 20 min by car',
    detail: 'Book the sunset performance on the cliff edge a day ahead.',
    verified: false,
  },
];
