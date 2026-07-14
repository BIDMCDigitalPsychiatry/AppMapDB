/**
 * Deterministic crisis-language check. Runs BEFORE any LLM call so a person
 * in crisis gets resources immediately, deterministically, and for free.
 *
 * Two tiers, because "self-harm" and "suicide" are also legitimate search
 * topics on this site (Self-Harm is a Conditions tag):
 *  - Tier 1 (first-person crisis statements): short-circuit the LLM entirely
 *    and return only the resources message.
 *  - Tier 2 (crisis-adjacent topics): let the search proceed, but the
 *    handler appends the resources footer to whatever reply comes back.
 */

const TIER1_PATTERNS = [
  /\bkill(ing)?\s+myself\b/i,
  /\bend(ing)?\s+my\s+(own\s+)?life\b/i,
  /\bwant(ed)?\s+to\s+die\b/i,
  /\bdon'?t\s+want\s+to\s+(be\s+alive|live)\b/i,
  /\b(i'?m|i\s+am|feeling)\s+suicidal\b/i,
  /\bcommit(ting)?\s+suicide\b/i,
  /\bhurt(ing)?\s+myself\s+(right\s+now|tonight|today)\b/i,
  /\b(going|planning|about)\s+to\s+(hurt|kill)\s+(myself|me)\b/i,
  /\btake\s+my\s+(own\s+)?life\b/i,
  /\boverdos(e|ing)\s+(on|tonight|right\s+now)\b/i
];

const TIER2_PATTERNS = [/\bsuicid/i, /\bself.?harm/i, /\bcrisis\b/i, /\boverdose\b/i, /\bhurt(ing)?\s+myself\b/i];

const CRISIS_MESSAGE =
  'It sounds like you might be going through something serious right now. This site catalogs apps and cannot provide crisis support, but help is available immediately:\n\n' +
  '• 988 Suicide & Crisis Lifeline — call or text 988 (US, 24/7)\n' +
  '• Crisis Text Line — text HOME to 741741\n' +
  '• If you are in immediate danger, call 911 or go to the nearest emergency room.\n\n' +
  'You deserve support from a real person, and these services connect you to one right away.';

const RESOURCES_FOOTER =
  '\n\nIf you or someone you know is in crisis: call or text 988 (Suicide & Crisis Lifeline) or text HOME to 741741 (Crisis Text Line).';

const isTier1Crisis = text => typeof text === 'string' && TIER1_PATTERNS.some(re => re.test(text));
const isTier2Sensitive = text => typeof text === 'string' && TIER2_PATTERNS.some(re => re.test(text));

module.exports = { isTier1Crisis, isTier2Sensitive, CRISIS_MESSAGE, RESOURCES_FOOTER };
