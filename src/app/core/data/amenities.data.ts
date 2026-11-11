/* ============================================================================
 * AMENITIES — VERIFIED against the property's published facility list.
 * ========================================================================== */
import { Amenity } from '../models/villa.model';

export const AMENITIES: readonly Amenity[] = [
  { id: 'private-pool', label: 'Private pool', icon: 'pool', description: 'Your own pool, enclosed by the villa walls and planting.' },
  { id: 'wifi', label: 'Free WiFi', icon: 'wifi', description: 'Throughout the villa and the grounds.' },
  { id: 'parking', label: 'Free parking', icon: 'parking', description: 'On-site, inside the gate.' },
  { id: 'air', label: 'Air conditioning', icon: 'air', description: 'In every bedroom and living space.' },
  { id: 'kitchen', label: 'Full kitchen', icon: 'kitchen', description: 'Cookware, utensils and everything to cook properly.' },
  { id: 'fridge', label: 'Fridge & dining area', icon: 'fridge' },
  { id: 'tv', label: 'Flatscreen TV', icon: 'tv' },
  { id: 'sofa', label: 'Living room & sofa', icon: 'sofa' },
  { id: 'terrace', label: 'Patio & terrace', icon: 'terrace', description: 'Garden furniture and a sun terrace.' },
  { id: 'garden', label: 'Tropical garden', icon: 'garden' },
  { id: 'breakfast', label: 'Breakfast available', icon: 'breakfast', description: 'Served in the villa, on request.' },
  { id: 'airport-transfer', label: 'Airport transfer', icon: 'car' },
  { id: 'laundry', label: 'Laundry service', icon: 'laundry' },
  { id: 'room-service', label: 'Room service', icon: 'bell' },
  { id: 'express-checkin', label: 'Express check-in / out', icon: 'clock' },
  { id: 'family', label: 'Family friendly', icon: 'family', description: 'One extra bed can be added per villa.' },
  { id: 'nosmoking', label: 'Non-smoking property', icon: 'nosmoking' },
  { id: 'nopets', label: 'No pets', icon: 'nopets' },
];

const BY_ID = new Map(AMENITIES.map((a) => [a.id, a]));

export function amenityById(id: string): Amenity | undefined {
  return BY_ID.get(id);
}

export function amenitiesByIds(ids: readonly string[]): Amenity[] {
  return ids.map((id) => BY_ID.get(id)).filter((a): a is Amenity => !!a);
}
