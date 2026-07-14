/**
 * Offline test suite — no API key, no tokens. Verifies everything
 * deterministic: crisis short-circuit, request validation, filter
 * whitelisting, tool schema shape, and the full handler flow against the
 * mock client. Run with: npm test
 */
const assert = require('assert');
const fs = require('fs');
const { handleChat } = require('../handler');
const { mockClient } = require('../mock');
const { isTier1Crisis, isTier2Sensitive } = require('../crisis');
const { validateFilters, validateRequest, hashUserId } = require('../validate');
const { searchFiltersTool } = require('../toolSchema');
const taxonomy = require('../taxonomy.json');

let passed = 0;
const test = (name, fn) => {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      passed++;
      console.log(`  ok - ${name}`);
    })
    .catch(err => {
      console.error(`  FAIL - ${name}\n    ${err.message}`);
      process.exitCode = 1;
    });
};

(async () => {
  await test('tier-1 crisis phrases detected', () => {
    for (const msg of ['I want to kill myself', "i'm suicidal", 'I am going to hurt myself tonight', 'thinking about ending my life']) {
      assert(isTier1Crisis(msg), `should detect: ${msg}`);
    }
  });

  await test('topic searches are NOT tier-1 crisis', () => {
    for (const msg of ['apps to help with self-harm urges', 'suicide prevention apps', 'my patient struggles with self-harm']) {
      assert(!isTier1Crisis(msg), `should not short-circuit: ${msg}`);
      assert(isTier2Sensitive(msg), `should flag as sensitive: ${msg}`);
    }
  });

  await test('handler short-circuits crisis without any client', async () => {
    const result = await handleChat({ message: 'I want to kill myself' }, { client: null });
    assert.strictEqual(result.type, 'crisis');
    assert(result.reply.includes('988'));
  });

  await test('request validation rejects garbage', () => {
    assert(validateRequest(null).error);
    assert(validateRequest({}).error);
    assert(validateRequest({ message: '' }).error);
    assert(validateRequest({ message: 'x'.repeat(501) }).error);
  });

  await test('history is capped and coerced', () => {
    const history = Array.from({ length: 30 }, (_, i) => ({ role: 'weird', content: `turn ${i}` }));
    const { history: clean } = validateRequest({ message: 'hi', history });
    assert.strictEqual(clean.length, 8);
    assert(clean.every(h => h.role === 'user' || h.role === 'assistant'));
  });

  await test('filter whitelist drops invented categories and values', () => {
    const clean = validateFilters({
      Conditions: ['Sleep', 'Made Up Condition'],
      NotACategory: ['x'],
      Platforms: 'iOS', // wrong type
      Cost: ['Totally Free', 'Totally Free'] // dupe
    });
    assert.deepStrictEqual(clean, { Conditions: ['Sleep'], Cost: ['Totally Free'] });
  });

  await test('degenerate value bursts drop the whole category', () => {
    const clean = validateFilters({
      Conditions: ['Sleep', 'Pain', 'Phobias', 'PTSD', 'OCD'], // 5 ANDed conditions = guaranteed zero results
      Platforms: ['iOS']
    });
    assert.deepStrictEqual(clean, { Platforms: ['iOS'] });
  });

  await test('hedged free tags collapse to Free to Download', () => {
    const clean = validateFilters({ Cost: ['Totally Free', 'Free to Download'] });
    assert.deepStrictEqual(clean, { Cost: ['Free to Download'] });
  });

  await test('tool schema covers exactly the 13 taxonomy categories', () => {
    const props = searchFiltersTool.input_schema.properties.filters.properties;
    assert.deepStrictEqual(Object.keys(props).sort(), Object.keys(taxonomy).sort());
    assert.strictEqual(searchFiltersTool.strict, true);
    for (const [cat, schema] of Object.entries(props)) {
      assert.deepStrictEqual(schema.items.enum, taxonomy[cat], `enum mismatch for ${cat}`);
    }
  });

  await test('full flow against mock client sets filters', async () => {
    const result = await handleChat({ message: 'free CBT app for anxiety on my iphone' }, { client: mockClient });
    assert.strictEqual(result.type, 'filters');
    assert.strictEqual(result.apply, true);
    assert.deepStrictEqual(result.filters.Platforms, ['iOS']);
    assert.deepStrictEqual(result.filters.Cost, ['Free to Download']);
    assert.deepStrictEqual(result.filters.TreatmentApproaches, ['CBT']);
    assert.deepStrictEqual(result.filters.Conditions, ['Stress & Anxiety']);
  });

  await test('clear request applies an empty filter set', async () => {
    const result = await handleChat({ message: 'clear all the filters', currentFilters: { Platforms: ['iOS'] } }, { client: mockClient });
    assert.strictEqual(result.apply, true, 'an intentional clear must be applied');
    assert.deepStrictEqual(result.filters, {}, 'clearing yields an empty filter set');
  });

  await test('no_change leaves filters alone rather than wiping them', async () => {
    // The mock returns no_change when nothing matched — an empty filter set
    // here must NOT clear the user's existing search.
    const result = await handleChat({ message: 'zzzz nonsense qqq' }, { client: mockClient });
    assert.strictEqual(result.apply, false);
  });

  await test('crisis path records NO usage metrics at all', () => {
    // Guard against reintroducing a crisis marker: the handler must not call
    // recordUsage on the crisis short-circuit, and metrics.js must have no
    // crisis field. "This visitor was in crisis" is not a fact we retain.
    const handlerSrc = fs.readFileSync(require.resolve('../handler.js'), 'utf8');
    const crisisBranch = handlerSrc.slice(handlerSrc.indexOf('isTier1Crisis(message)'), handlerSrc.indexOf('const client ='));
    assert(!/recordUsage/.test(crisisBranch), 'crisis short-circuit must not record usage');
    const metricsSrc = fs.readFileSync(require.resolve('../metrics.js'), 'utf8');
    assert(!/crisis:\s*\{/.test(metricsSrc), 'metrics item must have no crisis attribute');
  });

  await test('clientId is hashed, never forwarded raw', async () => {
    const raw = 'user@example.com'; // worst case: client sends something PII-ish
    const hashed = hashUserId(raw);
    assert(hashed && /^[0-9a-f]{40}$/.test(hashed), 'must be opaque fixed-length hex');
    assert(!hashed.includes(raw));
    assert.strictEqual(hashUserId(raw), hashed, 'must be stable for the same client');
    assert.notStrictEqual(hashUserId('someone-else'), hashed);
    assert.strictEqual(hashUserId(undefined), undefined, 'absent id is fine — metadata is then omitted');

    let seen;
    const spy = { messages: { create: async params => ((seen = params), mockClient.messages.create(params)) } };
    await handleChat({ message: 'sleep apps', clientId: raw }, { client: spy });
    assert.strictEqual(seen.metadata.user_id, hashed);
    assert(!JSON.stringify(seen).includes(raw), 'raw client id must never reach the API payload');
  });

  await test('current filters are rendered into the user turn for the model', async () => {
    let seen;
    const spy = { messages: { create: async params => ((seen = params.messages), mockClient.messages.create(params)) } };
    await handleChat({ message: 'drop the iphone filter', currentFilters: { Platforms: ['iOS'], Conditions: ['Sleep'] } }, { client: spy });
    const lastTurn = seen[seen.length - 1].content;
    assert(lastTurn.includes('Currently applied filters:'), 'user turn should carry live filter state');
    assert(lastTurn.includes('Platforms = iOS'));
    assert(lastTurn.includes('Conditions = Sleep'));
  });

  await test('filter-event metrics store category names, never values', async () => {
    // Behavioral, not source-scraping: capture what would actually be written
    // to DynamoDB and assert the sensitive value never appears in it.
    process.env.METRICS_TABLE = 'test-table';
    const sent = [];
    // The AWS SDK ships in the Lambda runtime and is not installed locally, so
    // intercept the require rather than resolving a module that isn't here.
    const Module = require('module');
    const realLoad = Module._load;
    Module._load = function (request, ...rest) {
      if (request === '@aws-sdk/client-dynamodb') {
        return {
          DynamoDBClient: class {
            async send(cmd) {
              sent.push(cmd.input);
            }
          },
          PutItemCommand: class {
            constructor(input) {
              this.input = input;
            }
          }
        };
      }
      return realLoad.call(this, request, ...rest);
    };
    delete require.cache[require.resolve('../metrics.js')];
    const { recordFilterUsage, recordUsage } = require('../metrics.js');

    await recordFilterUsage({ conversationId: 'c1', filters: { Conditions: ['Self-Harm'], Cost: ['Totally Free'] }, resultCount: 12, clientId: 'x' });
    await recordUsage({ conversationId: 'c2', turn: 1, message: 'help me', reply: 'ok', filters: { Conditions: ['PTSD'] } });

    assert.strictEqual(sent.length, 2);
    for (const { Item } of sent) {
      const blob = JSON.stringify(Item);
      assert(!blob.includes('Self-Harm') && !blob.includes('PTSD') && !blob.includes('Totally Free'), 'filter VALUES must never be written');
      assert(!blob.includes('help me'), 'message text must never be written');
    }
    assert.deepStrictEqual(sent[0].Item.filterCategoriesUsed.SS, ['Conditions', 'Cost'], 'category names are kept');
    assert.strictEqual(sent[0].Item.source.S, 'manual');
    assert.strictEqual(sent[1].Item.source.S, 'assistant');

    Module._load = realLoad;
    delete process.env.METRICS_TABLE;
    delete require.cache[require.resolve('../metrics.js')];
  });

  await test('sensitive topic gets resources footer appended', async () => {
    const result = await handleChat({ message: 'apps to help with self-harm urges' }, { client: mockClient });
    assert.strictEqual(result.type, 'filters');
    assert(result.reply.includes('988'), 'reply should include crisis resources footer');
  });

  console.log(`\n${passed} tests passed${process.exitCode ? ' (with failures)' : ''}`);
})();
