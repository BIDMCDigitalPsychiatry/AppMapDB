/**
 * Regenerates cloud_functions/mind-search-assistant/taxonomy.json from the
 * canonical filter enums in src/database/models/Application.tsx, so the
 * chatbot's allowed filter values can never drift from the site's real
 * taxonomy. Run after any change to Application.tsx's enum arrays:
 *
 *   npm run export-taxonomy
 *
 * Works by transpiling Application.tsx with the repo's own TypeScript
 * compiler and evaluating it with its two imports stubbed (they contribute
 * only types / one comparator).
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ts = require('typescript');

const SRC = path.join(__dirname, '..', 'src', 'database', 'models', 'Application.tsx');
const OUT = path.join(__dirname, '..', 'cloud_functions', 'mind-search-assistant', 'taxonomy.json');

const source = fs.readFileSync(SRC, 'utf8');
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019, jsx: ts.JsxEmit.React }
}).outputText;

// Mirrors src/helpers.tsx sortAscendingToLower — the only value import.
function sortAscendingToLower(a = '', b = '') {
  if (a.toLowerCase() < b.toLowerCase()) return -1;
  if (a.toLowerCase() > b.toLowerCase()) return 1;
  return 0;
}

const sandbox = {
  exports: {},
  module: { exports: {} },
  require: id => (id.endsWith('helpers') ? { sortAscendingToLower } : {})
};
sandbox.exports = sandbox.module.exports;
vm.runInNewContext(js, sandbox, { filename: 'Application.tsx' });
const m = sandbox.module.exports;

// Keys are the Redux filter-category names used by state.table[...].filters
// and useAppTableData's CATEGORY_TO_TAG_FIELD (note: 'Cost' and 'Privacy'
// are singular there).
const taxonomy = {
  Platforms: m.Platforms,
  Cost: m.Costs,
  DeveloperTypes: m.DeveloperTypes,
  Conditions: m.Conditions,
  TreatmentApproaches: m.TreatmentApproaches,
  Features: m.Features,
  Functionalities: m.Functionalities,
  Engagements: m.Engagements,
  Inputs: m.Inputs,
  Outputs: m.Outputs,
  Privacy: m.Privacies,
  Uses: m.Uses,
  ClinicalFoundations: m.ClinicalFoundations
};

for (const [key, values] of Object.entries(taxonomy)) {
  if (!Array.isArray(values) || values.length === 0 || values.some(v => typeof v !== 'string')) {
    throw new Error(`Taxonomy category ${key} did not evaluate to a non-empty string array`);
  }
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(taxonomy, null, 2) + '\n');
console.log(`Wrote ${OUT}`);
for (const [key, values] of Object.entries(taxonomy)) console.log(`  ${key}: ${values.length} values`);
