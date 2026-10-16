import { describe, expect, it } from 'vitest';
import { appDisplayName, appPath, appSlug, matchesShortId, parseAppPath, shortAppId, slugify } from './appUrl';

const app = {
  _id: '3fbcc00961264af2931dfbc1b86c1a6a',
  groupId: 'c8ffa1dd98ba428a87eff2eab7889f11',
  androidStore: { title: 'Headspace: Meditation & Sleep' },
  appleStore: { title: 'Headspace: Sleep & Meditation' }
};

describe('slugify', () => {
  it('lowercases, joins words with hyphens and spells out &', () => {
    expect(slugify('Headspace: Meditation & Sleep')).toBe('headspace-meditation-and-sleep');
  });

  it('drops accents and odd punctuation', () => {
    expect(slugify('Petit BamBou – Méditation')).toBe('petit-bambou-meditation');
    expect(slugify('Slumber－Calm Stories for Sleep')).toBe('slumber-calm-stories-for-sleep');
    expect(slugify('Blood Pressure Tracker •')).toBe('blood-pressure-tracker');
  });

  it('keeps at most six words', () => {
    expect(slugify('one two three four five six seven eight')).toBe('one-two-three-four-five-six');
  });

  it('returns an empty string when nothing Latin is left', () => {
    expect(slugify('瞑想')).toBe('');
    expect(slugify(undefined as any)).toBe('');
  });
});

describe('appSlug / appPath', () => {
  it('uses the library name precedence (name, then Google Play, then App Store)', () => {
    expect(appDisplayName(app)).toBe('Headspace: Meditation & Sleep');
    expect(appDisplayName({ ...app, name: 'Headspace' })).toBe('Headspace');
    expect(appDisplayName({ appleStore: { title: 'Only Apple' } })).toBe('Only Apple');
  });

  it('ends with the first 8 characters of the groupId', () => {
    expect(shortAppId(app)).toBe('c8ffa1dd');
    expect(appSlug(app)).toBe('headspace-meditation-and-sleep-c8ffa1dd');
  });

  it('falls back to the record id when there is no groupId, and to "app" when there is no usable name', () => {
    expect(appSlug({ _id: 'ABCDEF1234567890abcdef1234567890' })).toBe('app-abcdef12');
  });

  it('prefixes French and German addresses', () => {
    expect(appPath(app)).toBe('/apps/headspace-meditation-and-sleep-c8ffa1dd');
    expect(appPath(app, 'fr')).toBe('/fr/apps/headspace-meditation-and-sleep-c8ffa1dd');
    expect(appPath(app, 'de')).toBe('/de/apps/headspace-meditation-and-sleep-c8ffa1dd');
  });
});

describe('parseAppPath', () => {
  it('round-trips every language', () => {
    for (const lang of ['en', 'fr', 'de'] as const) {
      const parsed = parseAppPath(appPath(app, lang));
      expect(parsed).toEqual({ lang, slug: 'headspace-meditation-and-sleep-c8ffa1dd', shortId: 'c8ffa1dd' });
      expect(matchesShortId(app, parsed!.shortId)).toBe(true);
    }
  });

  it('ignores the name part, so renamed apps still resolve', () => {
    expect(parseAppPath('/apps/some-old-name-c8ffa1dd')?.shortId).toBe('c8ffa1dd');
    expect(parseAppPath('/apps/c8ffa1dd')?.shortId).toBe('c8ffa1dd');
  });

  it('tolerates a trailing slash and upper case', () => {
    expect(parseAppPath('/Apps/Headspace-C8FFA1DD/')?.shortId).toBe('c8ffa1dd');
  });

  it('rejects anything that is not an app address', () => {
    expect(parseAppPath('/Apps')).toBeNull();
    expect(parseAppPath('/apps/headspace')).toBeNull();
    expect(parseAppPath('/es/apps/headspace-c8ffa1dd')).toBeNull();
    expect(parseAppPath('/apps/headspace-c8ffa1dd/extra')).toBeNull();
  });
});
