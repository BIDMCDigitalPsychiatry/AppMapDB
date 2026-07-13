/*
 * Parent -> child relationships between filter tag labels.
 *
 * Some filter labels are generalizations of more specific labels in the
 * taxonomy. Selecting the parent should also match apps tagged only with a
 * child label (e.g. filtering on 'Substance Use' should include apps tagged
 * 'Substance Use (Alcohol)'). Matching is expanded here explicitly, per
 * label — never by substring, which is how unrelated labels used to collide.
 *
 * Selecting a child label directly still matches only that child.
 */
export const PARENT_TAG_EXPANSIONS: Record<string, string[]> = {
  CBT: ['iCBT or Sleep Therapy'],
  'Substance Use': ['Substance Use (Smoking & Tobacco)', 'Substance Use (Alcohol)']
};

// True when a tag value satisfies a selected filter term: either the term
// itself, or one of the term's child labels.
export const termMatchesTag = (term: string, tag: string): boolean => tag === term || (PARENT_TAG_EXPANSIONS[term] || []).includes(tag);
