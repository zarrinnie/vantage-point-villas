import { toggleNight } from './availability.util';
import { getIn, setIn } from './path.util';
import { newItemFor } from './schema';
import { BlockedRange } from '../core/content/content.model';

describe('toggleNight', () => {
  const villa = 'vantage-suite';

  it('closes a single night', () => {
    expect(toggleNight([], villa, '2027-03-10')).toEqual([
      { villa, start: '2027-03-10', end: '2027-03-10', note: '' },
    ]);
  });

  it('joins a night onto neighbouring closures', () => {
    let rules: BlockedRange[] = toggleNight([], villa, '2027-03-10');
    rules = toggleNight(rules, villa, '2027-03-12');
    rules = toggleNight(rules, villa, '2027-03-11');
    expect(rules).toEqual([{ villa, start: '2027-03-10', end: '2027-03-12', note: '' }]);
  });

  it('splits a range when a night inside it is reopened', () => {
    const rules = [{ villa, start: '2027-03-10', end: '2027-03-14', note: 'repairs' }];
    expect(toggleNight(rules, villa, '2027-03-12')).toEqual([
      { villa, start: '2027-03-10', end: '2027-03-11', note: 'repairs' },
      { villa, start: '2027-03-13', end: '2027-03-14', note: 'repairs' },
    ]);
  });

  it('keeps villas and the whole property apart', () => {
    const rules = toggleNight([], '', '2027-03-10');
    expect(toggleNight(rules, villa, '2027-03-10')).toHaveLength(2);
  });
});

describe('admin paths', () => {
  it('updates only the objects along the path', () => {
    const doc = { a: { b: [{ c: 1 }, { c: 2 }] }, other: { x: 1 } };
    const next = setIn(doc, ['a', 'b', 1, 'c'], 5);
    expect(getIn(next, ['a', 'b', 1, 'c'])).toBe(5);
    expect(doc.a.b[1].c).toBe(2);
    expect(next.other).toBe(doc.other);
    expect(next.a.b[0]).toBe(doc.a.b[0]);
  });

  it('makes blank new items shaped like the defaults', () => {
    const villa = newItemFor(['villas'], []) as Record<string, unknown>;
    expect(villa['name']).toBe('');
    expect(villa['maxGuests']).toBe(2);
    expect(villa['images']).toEqual([]);
    expect(newItemFor(['availability', 'blocked'], [])).toEqual({ villa: '', start: '', end: '', note: '' });
    expect(newItemFor(['villas', 0, 'highlights'], [])).toBe('');
  });
});
