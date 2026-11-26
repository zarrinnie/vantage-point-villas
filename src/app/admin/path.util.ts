/** A location inside the content document, e.g. `['villas', 2, 'images', 0, 'url']`. */
export type Path = readonly (string | number)[];

export function getIn(root: unknown, path: Path): unknown {
  let node: unknown = root;
  for (const key of path) {
    if (node === null || typeof node !== 'object') return undefined;
    node = (node as Record<string | number, unknown>)[key];
  }
  return node;
}

/** Copy-on-write update: only the objects along `path` are replaced. */
export function setIn<T>(root: T, path: Path, value: unknown): T {
  if (path.length === 0) return value as T;
  const [head, ...rest] = path;
  const node = (root ?? (typeof head === 'number' ? [] : {})) as Record<string | number, unknown>;
  const copy = (Array.isArray(node) ? [...node] : { ...node }) as Record<string | number, unknown>;
  copy[head] = setIn(node[head], rest, value);
  return copy as T;
}

/** An empty value of the same shape: '' for text, 0 for numbers, and so on. */
export function blankLike(value: unknown): unknown {
  if (Array.isArray(value)) return [];
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, blankLike(v)]));
  }
  if (typeof value === 'number') return 0;
  if (typeof value === 'boolean') return false;
  return '';
}

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** `heroImage` → `Hero image`, `minNights` → `Min nights` */
export function humanize(key: string | number): string {
  if (typeof key === 'number') return `${key + 1}`;
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}
