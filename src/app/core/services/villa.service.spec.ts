import { TestBed } from '@angular/core/testing';
import { VillaService } from './villa.service';
import { VILLAS } from '../data/villas.data';

describe('VillaService', () => {
  let service: VillaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VillaService);
  });

  it('exposes every villa', () => {
    expect(service.villas().length).toBe(VILLAS.length);
  });

  it('finds a villa by slug and returns null for anything else', () => {
    expect(service.bySlug('vantage-suite')?.name).toBe('The Vantage Suite');
    expect(service.bySlug('not-a-villa')).toBeNull();
    expect(service.bySlug(null)).toBeNull();
    expect(service.bySlug(undefined)).toBeNull();
  });

  it('filters by party size', () => {
    expect(service.fitsGuests(2).length).toBe(VILLAS.length);
    expect(service.fitsGuests(7).map((v) => v.slug)).toEqual(['family-pool-villa']);
    expect(service.fitsGuests(12)).toEqual([]);
  });

  it('reports the lowest nightly rate', () => {
    expect(service.lowestRate()).toBe(Math.min(...VILLAS.map((v) => v.nightlyRate)));
  });

  it('lists the featured villas only', () => {
    expect(service.featured().every((v) => v.isFeatured)).toBe(true);
    expect(service.featured().length).toBeGreaterThan(0);
  });

  it('suggests two other villas, never the current one', () => {
    for (const villa of VILLAS) {
      const siblings = service.siblingsOf(villa.slug);
      expect(siblings.length).toBe(2);
      expect(siblings.map((s) => s.slug)).not.toContain(villa.slug);
    }
  });

  it('resolves a villa’s amenities to real amenity records', () => {
    const villa = VILLAS[0];
    const amenities = service.amenitiesFor(villa);
    expect(amenities.length).toBe(villa.amenityIds.length);
    expect(amenities.map((a) => a.id)).toContain('private-pool');
    expect(amenities.every((a) => !!a.label && !!a.icon)).toBe(true);
  });

  it('keeps every villa on a plot of 200–300 sqm, as published', () => {
    for (const villa of VILLAS) {
      expect(villa.landSize).toBeGreaterThanOrEqual(200);
      expect(villa.landSize).toBeLessThanOrEqual(300);
    }
  });
});
