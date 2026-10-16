/*
 * Interface-translation catalog tool (see src/i18n/index.tsx).
 *
 *   node scripts/i18n/extract.js            regenerate src/locales/source.json and report missing fr/de
 *   node scripts/i18n/extract.js --check    exit 1 if fr/de are missing any key (CI / tests)
 *   node scripts/i18n/extract.js --prune    also drop fr/de entries no longer used in the code
 *
 * Keys are the English text. Collects string literals passed to t('…'),
 * tx('…') and tc('context', '…'). source.json maps each key to the files that
 * use it, which gives translators and reviewers the context of each string.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const SRC = path.join(ROOT, 'src');
const LOCALES = path.join(SRC, 'locales');
const LANGS = ['fr', 'de'];

const walk = dir =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return ['locales', 'node_modules', 'i18n'].includes(e.name) ? [] : walk(p); // i18n/ only holds usage examples in comments
    return /\.(tsx?|jsx?)$/.test(e.name) && !/\.test\./.test(e.name) ? [p] : [];
  });

const unescape = (s, quote) =>
  s
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(new RegExp('\\\\' + (quote === '`' ? '`' : quote), 'g'), quote)
    .replace(/\\\\/g, '\\');

// A string literal: '…', "…" or `…` (template literals only without ${…}).
// The function name is NON-capturing so the quote is group 1 and \1 matches the closing quote.
const CALL = new RegExp(String.raw`(?<![\w.$])(?:t|tx)\(\s*(['"\x60])((?:\\.|(?!\1)[^\\])*)\1`, 'g');
const CTX = new RegExp(String.raw`(?<![\w.$])tc\(\s*(['"])((?:\\.|(?!\1)[^\\])*)\1\s*,\s*(['"\x60])((?:\\.|(?!\3)[^\\])*)\3`, 'g');

const extract = () => {
  const keys = {};
  for (const file of walk(SRC)) {
    const text = fs.readFileSync(file, 'utf8');
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    const add = key => {
      if (!key.trim()) return;
      (keys[key] = keys[key] || new Set()).add(rel);
    };
    let m;
    CALL.lastIndex = 0;
    while ((m = CALL.exec(text))) if (!(m[1] === '`' && m[2].includes('${'))) add(unescape(m[2], m[1]));
    CTX.lastIndex = 0;
    while ((m = CTX.exec(text))) add(`${unescape(m[2], m[1])}|${unescape(m[4], m[3])}`);
  }
  return Object.fromEntries(
    Object.keys(keys)
      .sort((a, b) => a.localeCompare(b))
      .map(k => [k, { files: [...keys[k]].sort() }])
  );
};

const readCatalog = lang => {
  const p = path.join(LOCALES, `${lang}.json`);
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
};

const missing = (source, lang) => {
  const cat = readCatalog(lang);
  return Object.keys(source).filter(k => typeof cat[k] !== 'string' || !cat[k].trim());
};

module.exports = { extract, readCatalog, missing, LANGS };

if (require.main === module) {
  const source = extract();
  fs.writeFileSync(path.join(LOCALES, 'source.json'), JSON.stringify(source, null, 2) + '\n');
  console.log(`${Object.keys(source).length} strings → src/locales/source.json`);
  let failed = false;
  for (const lang of LANGS) {
    const miss = missing(source, lang);
    console.log(`${lang}: ${miss.length} missing`);
    if (miss.length) failed = true;
    if (process.argv.includes('--prune')) {
      const cat = readCatalog(lang);
      const kept = Object.fromEntries(Object.keys(cat).filter(k => source[k]).sort((a, b) => a.localeCompare(b)).map(k => [k, cat[k]]));
      fs.writeFileSync(path.join(LOCALES, `${lang}.json`), JSON.stringify(kept, null, 2) + '\n');
    }
  }
  if (process.argv.includes('--check') && failed) process.exit(1);
}
