const taxonomy = require('./taxonomy.json');

/**
 * The single tool the model is FORCED to call (tool_choice type:'tool').
 * The input schema is generated from taxonomy.json, so the model can only
 * express filters in terms of the site's real enum values — and `strict`
 * makes the API reject any output that doesn't validate. validate.js
 * re-checks server-side anyway (defense in depth).
 *
 * Every category is required (an empty array means "no filter on this
 * category") — strict mode wants a fully-specified object, and it keeps the
 * model from omitting a category it half-considered.
 */
const filterProperties = {};
for (const [category, values] of Object.entries(taxonomy)) {
  filterProperties[category] = {
    type: 'array',
    items: { type: 'string', enum: values }
  };
}

const searchFiltersTool = {
  name: 'set_search_filters',
  description:
    'Set the app-library search filters that best match what the user is looking for, plus a short reply to show them. ' +
    'Use an empty array for every category the user did not ask about.',
  strict: true,
  input_schema: {
    type: 'object',
    properties: {
      // Without this, an all-empty `filters` object is ambiguous: it could mean
      // "the user asked me to clear everything" or "this message was off-topic
      // so I changed nothing". Those need opposite handling in the UI, so the
      // model states which one it means.
      intent: {
        type: 'string',
        enum: ['apply_filters', 'no_change'],
        description:
          'apply_filters: the user is searching, refining, removing, or clearing filters — `filters` is the complete new filter set and REPLACES the current one (an empty set clears everything). ' +
          'no_change: the message was off-topic, a manipulation attempt, or a request for medical advice — leave the current filters untouched.'
      },
      filters: {
        type: 'object',
        properties: filterProperties,
        required: Object.keys(filterProperties),
        additionalProperties: false
      },
      reply: {
        type: 'string',
        description: 'One or two friendly sentences shown to the user above the filtered results.'
      }
    },
    required: ['intent', 'filters', 'reply'],
    additionalProperties: false
  }
};

module.exports = { searchFiltersTool };
