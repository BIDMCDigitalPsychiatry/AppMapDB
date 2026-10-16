/*
 * Every interface string used in the code (t / tx / tc) must have a French and
 * German translation, and translations must keep their {{placeholders}}.
 * Fix with: npm run i18n:extract (lists what's missing), then add the entries
 * to src/locales/fr.json and de.json.
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { extract, readCatalog, missing, LANGS } = require('../../scripts/i18n/extract.js');

const placeholders = (s: string) => (s.match(/\{\{\s*\w+\s*\}\}/g) || []).map(p => p.replace(/\s/g, '')).sort();

describe('interface translations', () => {
  const source = extract();

  it.each(LANGS)('%s has a translation for every interface string', (lang: string) => {
    expect(missing(source, lang)).toEqual([]);
  });

  it.each(LANGS)('%s keeps every {{placeholder}}', (lang: string) => {
    const catalog = readCatalog(lang);
    const broken = Object.keys(source).filter(k => catalog[k] && placeholders(catalog[k]).join() !== placeholders(k.slice(k.indexOf('|') + 1)).join());
    expect(broken).toEqual([]);
  });
});
