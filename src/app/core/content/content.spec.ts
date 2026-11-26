import { createDefaultContent, mergeContent, withDefaults } from './default-content';
import { validateContent } from './content.validate';
import { emphasise, fill, telHref, whatsappHref } from './content.util';

describe('content defaults & merging', () => {
  it('fills keys a stored document is missing', () => {
    const merged = withDefaults({ site: { name: 'Renamed' } });
    expect(merged.site.name).toBe('Renamed');
    expect(merged.site.address.street).toBe('Jalan Toya Ning I');
    expect(merged.pages.home.hero.title).toContain('quiet');
    expect(merged.villas.length).toBeGreaterThan(0);
  });

  it('takes stored lists whole and ignores values of the wrong type', () => {
    const merged = mergeContent(
      { list: [1, 2, 3], n: 5, s: 'a' },
      { list: [9], n: 'five', s: 'b' },
    ) as Record<string, unknown>;
    expect(merged['list']).toEqual([9]);
    expect(merged['n']).toBe(5);
    expect(merged['s']).toBe('b');
  });

  it('keeps optional fields the defaults do not know about', () => {
    const merged = mergeContent({ a: 1 }, { a: 2, notes: 'x' }) as Record<string, unknown>;
    expect(merged['notes']).toBe('x');
  });
});

describe('validateContent', () => {
  it('accepts the defaults', () => {
    expect(validateContent(createDefaultContent())).toEqual({ ok: true, errors: [] });
  });

  it('rejects things that would break the site, in plain words', () => {
    const content = createDefaultContent();
    content.villas[0] = { ...content.villas[0], slug: 'Bad Slug!', images: [] };
    content.villas[1] = { ...content.villas[1], slug: content.villas[2].slug };
    content.offers[0] = { ...content.offers[0], image: 'javascript:alert(1)' };
    content.availability.blocked = [{ villa: '', start: '2027-02-10', end: '2027-02-01', note: 'oops' }];
    content.pricing.taxPercent = 150;

    const { ok, errors } = validateContent(content);
    expect(ok).toBe(false);
    const text = errors.join('\n');
    expect(text).toContain('lower-case letters');
    expect(text).toContain('at least one photograph');
    expect(text).toContain('used twice');
    expect(text).toContain('must start with https://');
    expect(text).toContain('end date is before the start date');
    expect(text).toContain('Tax must be between');
  });

  it('reports a field of the wrong kind', () => {
    const content = createDefaultContent() as unknown as { villas: Record<string, unknown>[] };
    content.villas[0]['nightlyRate'] = 'expensive';
    const { ok, errors } = validateContent(content);
    expect(ok).toBe(false);
    expect(errors[0]).toBe('villas › 1 › nightlyRate should be a number.');
  });

  it('rejects closures for a villa that no longer exists', () => {
    const content = createDefaultContent();
    content.availability.blocked = [{ villa: 'gone', start: '2027-01-01', end: '2027-01-02', note: '' }];
    expect(validateContent(content).errors.join()).toContain('no longer exists');
  });
});

describe('copy helpers', () => {
  it('fills tokens and leaves unknown ones visible', () => {
    expect(fill('From {lowestRate} a night', { lowestRate: '$95' })).toBe('From $95 a night');
    expect(fill('Hello {nobody}', {})).toBe('Hello {nobody}');
  });

  it('turns *asterisks* into italics without letting markup through', () => {
    expect(emphasise('The *quiet* side')).toBe('The <em>quiet</em> side');
    expect(emphasise('<img src=x onerror=alert(1)>')).toBe('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('builds dialling links from the displayed numbers', () => {
    expect(telHref('+62 361 000 0000')).toBe('tel:+623610000000');
    expect(whatsappHref('+62 812-0000-0000')).toBe('https://wa.me/6281200000000');
  });
});
