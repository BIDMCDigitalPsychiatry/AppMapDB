/**
 * Usage metrics — COUNTS ONLY. No message text, no reply text, no filter
 * values, ever. This exists so the team can answer "how many people use the
 * assistant, how long are their conversations, how long are their messages"
 * without retaining anything sensitive about what anyone asked.
 *
 * What is written per message:
 *   conversationId  random per-chat id from the client (reset on New chat)
 *   ts              timestamp
 *   turn            1-based message number within the conversation
 *   userWords       word count of the user's message   (NOT the message)
 *   userChars       char count of the user's message   (NOT the message)
 *   replyWords      word count of the assistant's reply (NOT the reply)
 *   filterCategoriesUsed  the CATEGORY NAMES that got filters (e.g.
 *                   "Conditions"), never the VALUES ("PTSD"). A category name
 *                   is not sensitive; the value would be.
 *   filterCount     how many filter values were applied
 *   userIdHash      the same pseudonym sent to Anthropic, so conversations can
 *                   be counted per visitor without identifying anyone
 *
 * NOT recorded, deliberately: anything about the crisis path. The handler does
 * not call this function at all when the crisis short-circuit fires, so there
 * is no row, no flag, and no trace that a person in distress used the tool.
 * Do not add one: "this pseudonymous visitor was in crisis" is precisely the
 * sensitive fact we have chosen not to retain.
 *
 * DESIGN NOTE — this is the one AWS permission the assistant has. The Lambda's
 * IAM role grants dynamodb:PutItem on THIS TABLE ONLY. It has no read access
 * to anything, and no access of any kind to the `applications` table. The
 * values written are computed by this file from fixed numeric fields; nothing
 * the model outputs is ever used as a key or a value here, so there is no path
 * from a jailbreak to a write it controls.
 *
 * Fail-open: a metrics failure must never break someone's search. All errors
 * are swallowed (logged, not thrown).
 */

const TABLE = process.env.METRICS_TABLE; // unset (e.g. local dev) → metrics disabled

const countWords = text => (typeof text === 'string' ? text.trim().split(/\s+/).filter(Boolean).length : 0);

let client;
const getClient = () => {
  if (!client) {
    // Lazy require: the AWS SDK ships in the Lambda runtime but isn't a
    // dependency of this package, so local dev/test must not need it.
    const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
    client = new DynamoDBClient({});
  }
  return client;
};

async function recordUsage({ conversationId, turn, message, reply, filters, userIdHash }) {
  if (!TABLE) return;
  try {
    const { PutItemCommand } = require('@aws-sdk/client-dynamodb');
    const categories = Object.keys(filters || {});
    const filterCount = Object.values(filters || {}).reduce((n, v) => n + v.length, 0);

    const item = {
      conversationId: { S: String(conversationId || 'unknown').slice(0, 64) },
      ts: { N: String(Date.now()) },
      source: { S: 'assistant' }, // vs 'manual' — see recordFilterUsage
      turn: { N: String(Number(turn) || 0) },
      userWords: { N: String(countWords(message)) },
      userChars: { N: String(typeof message === 'string' ? message.length : 0) },
      replyWords: { N: String(countWords(reply)) },
      filterCount: { N: String(filterCount) }
    };
    if (categories.length > 0) item.filterCategoriesUsed = { SS: categories };
    if (userIdHash) item.userIdHash = { S: userIdHash };

    await getClient().send(new PutItemCommand({ TableName: TABLE, Item: item }));
  } catch (err) {
    // Never let analytics break the product.
    console.error('metrics write failed (non-fatal):', err.message);
  }
}

/**
 * Records a manual filter interaction (the drawer / checkboxes), so the
 * assistant can be compared against the way people already search. Same
 * privacy line as recordUsage: CATEGORY NAMES ONLY, never the values. We
 * learn that someone filtered on "Conditions", never that it was "Self-Harm".
 *
 * Written server-side rather than from the browser on purpose: the site's
 * DynamoDB credentials are the PUBLIC unauthenticated Cognito role, so a
 * browser-side write would mean letting anyone forge or spam rows into the
 * research data.
 *
 * `source` distinguishes 'manual' (drawer) from 'assistant' rows, which is
 * the entire point of collecting this.
 */
async function recordFilterUsage({ conversationId, filters, resultCount, userIdHash }) {
  if (!TABLE) return;
  try {
    const { PutItemCommand } = require('@aws-sdk/client-dynamodb');
    const categories = Object.keys(filters || {});
    const filterCount = Object.values(filters || {}).reduce((n, v) => n + (Array.isArray(v) ? v.length : 0), 0);

    const item = {
      conversationId: { S: String(conversationId || 'manual').slice(0, 64) },
      ts: { N: String(Date.now()) },
      source: { S: 'manual' },
      filterCount: { N: String(filterCount) },
      resultCount: { N: String(Number.isFinite(resultCount) ? Math.max(0, Math.trunc(resultCount)) : -1) }
    };
    if (categories.length > 0) item.filterCategoriesUsed = { SS: categories };
    if (userIdHash) item.userIdHash = { S: userIdHash };

    await getClient().send(new PutItemCommand({ TableName: TABLE, Item: item }));
  } catch (err) {
    console.error('filter metrics write failed (non-fatal):', err.message);
  }
}

module.exports = { recordUsage, recordFilterUsage, countWords };
