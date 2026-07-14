const taxonomy = require('./taxonomy.json');

/**
 * Zero-cost stand-in for the real model: a keyword matcher over the
 * taxonomy plus a few common synonyms. Lets the frontend chat panel be
 * built and demoed without spending a token or holding an API key.
 * Interface-compatible with the Anthropic client's messages.create for
 * exactly the request shape handler.js sends.
 */
const SYNONYMS = {
  Conditions: {
    depression: 'Mood Disorders',
    depressed: 'Mood Disorders',
    anxiety: 'Stress & Anxiety',
    anxious: 'Stress & Anxiety',
    stress: 'Stress & Anxiety',
    stressed: 'Stress & Anxiety',
    smoking: 'Substance Use (Smoking & Tobacco)',
    vaping: 'Substance Use (Smoking & Tobacco)',
    drinking: 'Substance Use (Alcohol)',
    alcohol: 'Substance Use (Alcohol)',
    insomnia: 'Sleep',
    sleep: 'Sleep',
    adhd: 'ADD/ADHD'
  },
  Platforms: { iphone: 'iOS', ipad: 'iOS', android: 'Android', browser: 'Web' },
  Cost: { free: 'Free to Download' },
  TreatmentApproaches: { meditation: 'Mindfulness', mindfulness: 'Mindfulness', cbt: 'CBT', dbt: 'DBT' },
  Functionalities: { spanish: 'Spanish', french: 'French', offline: 'Offline' },
  Features: { journal: 'Journaling', journaling: 'Journaling', 'mood tracking': 'Track Mood', 'track my mood': 'Track Mood' }
};

function mockFilters(message) {
  const text = message.toLowerCase();
  const filters = {};
  for (const category of Object.keys(taxonomy)) filters[category] = [];
  for (const [category, map] of Object.entries(SYNONYMS)) {
    for (const [keyword, value] of Object.entries(map)) {
      if (text.includes(keyword) && !filters[category].includes(value)) filters[category].push(value);
    }
  }
  // Exact taxonomy value mentions ("PTSD", "OCD", ...)
  for (const [category, values] of Object.entries(taxonomy)) {
    for (const value of values) {
      if (value.length >= 3 && text.includes(value.toLowerCase()) && !filters[category].includes(value)) {
        filters[category].push(value);
      }
    }
  }
  return filters;
}

const mockClient = {
  messages: {
    async create(params) {
      const lastUser = [...params.messages].reverse().find(m => m.role === 'user');
      const text = lastUser ? String(lastUser.content) : '';
      const clearing = /\b(clear|reset|start over|remove all)\b/i.test(text);
      const filters = clearing ? Object.fromEntries(Object.keys(taxonomy).map(c => [c, []])) : mockFilters(text);
      const active = Object.values(filters).filter(v => v.length > 0).length;
      const reply = clearing
        ? '[local mock] Cleared all filters.'
        : active > 0
        ? '[local mock] I set some filters based on keywords in your message.'
        : "[local mock] I couldn't match that to any filters — try mentioning a condition, platform, or feature.";
      // The keyword mock always treats the message as a search, except when it
      // matches nothing at all (then it changes nothing, like a no_change).
      const intent = clearing || active > 0 ? 'apply_filters' : 'no_change';
      return {
        content: [{ type: 'tool_use', name: 'set_search_filters', input: { intent, filters, reply } }]
      };
    }
  }
};

module.exports = { mockClient };
