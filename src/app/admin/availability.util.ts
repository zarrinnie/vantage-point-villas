import { BlockedRange } from '../core/content/content.model';
import { addDays } from '../core/utils/date.util';

/**
 * Open or close one night for one villa ('' = whole property), keeping the
 * ranges tidy: closing next to an existing range extends it, and opening a
 * night in the middle of a range splits it in two.
 */
export function toggleNight(rules: readonly BlockedRange[], villa: string, iso: string): BlockedRange[] {
  const index = rules.findIndex((r) => r.villa === villa && iso >= r.start && iso <= r.end);

  if (index >= 0) {
    const range = rules[index];
    const pieces: BlockedRange[] = [];
    if (range.start < iso) pieces.push({ ...range, end: addDays(iso, -1) });
    if (range.end > iso) pieces.push({ ...range, start: addDays(iso, 1) });
    return [...rules.slice(0, index), ...pieces, ...rules.slice(index + 1)];
  }

  const before = rules.find((r) => r.villa === villa && r.end === addDays(iso, -1));
  const after = rules.find((r) => r.villa === villa && r.start === addDays(iso, 1));
  const merged: BlockedRange = {
    villa,
    start: before?.start ?? iso,
    end: after?.end ?? iso,
    note: before?.note || after?.note || '',
  };
  return [...rules.filter((r) => r !== before && r !== after), merged].sort((a, b) =>
    a.start.localeCompare(b.start),
  );
}
