import {
  matchesAll,
  matchesAny,
  matchesCategory,
  passesNormalModeFilters,
  passesPwaModeThreshold,
  dedupeByGroupId,
  fuzzySortFilter,
  FILTER_CATEGORY_JOIN_MODE,
  CATEGORY_TO_TAG_FIELD
} from './useAppTableData';

describe('matchesAll (AND within category, exact membership)', () => {
  it('matches when every selected value is present', () => {
    expect(matchesAll(['Anxiety', 'Depression'], ['Anxiety', 'Depression', 'Stress'])).toBe(true);
  });

  it('fails when any selected value is missing', () => {
    expect(matchesAll(['Anxiety', 'Depression'], ['Anxiety'])).toBe(false);
  });

  it('empty selection means no constraint', () => {
    expect(matchesAll([], [])).toBe(true);
    expect(matchesAll([], ['Anything'])).toBe(true);
  });

  it('does NOT substring-match against longer labels (regression)', () => {
    // The old string-join + String.includes approach matched 'Anxiety'
    // against an app whose only label was 'Stress & Anxiety'.
    expect(matchesAll(['Anxiety'], ['Stress & Anxiety'])).toBe(false);
    expect(matchesAll(['Stress & Anxiety'], ['Stress & Anxiety'])).toBe(true);
  });

  it('matches child labels when a parent label is selected (tag hierarchy)', () => {
    expect(matchesAll(['CBT'], ['iCBT or Sleep Therapy'])).toBe(true);
    expect(matchesAll(['Substance Use'], ['Substance Use (Alcohol)'])).toBe(true);
    expect(matchesAll(['Substance Use'], ['Substance Use (Smoking & Tobacco)'])).toBe(true);
    // Selecting the child directly does NOT match a row tagged only with the parent:
    expect(matchesAll(['Substance Use (Alcohol)'], ['Substance Use'])).toBe(false);
    // And hierarchy expansion is explicit, not substring-based:
    expect(matchesAll(['Substance Use'], ['Substance Use Disorder Info'])).toBe(false);
  });

  it('tolerates undefined/null/scalar tag values', () => {
    expect(matchesAll(['Anxiety'], undefined)).toBe(false);
    expect(matchesAll(['Anxiety'], null)).toBe(false);
    expect(matchesAll(['Anxiety'], 'Anxiety')).toBe(true); // scalar coerced to single-element array
    expect(matchesAll([], undefined)).toBe(true);
  });
});

describe('matchesAny (OR within category, exact membership)', () => {
  it('matches when at least one selected value is present', () => {
    expect(matchesAny(['Anxiety', 'Depression'], ['Depression'])).toBe(true);
  });

  it('fails when no selected value is present', () => {
    expect(matchesAny(['Anxiety', 'Depression'], ['Stress'])).toBe(false);
  });

  it('empty selection means no constraint', () => {
    expect(matchesAny([], [])).toBe(true);
    expect(matchesAny([], ['Anything'])).toBe(true);
  });

  it('does NOT substring-match against longer labels (regression)', () => {
    expect(matchesAny(['Anxiety'], ['Stress & Anxiety'])).toBe(false);
  });
});

describe('matchesCategory', () => {
  it('dispatches to AND or OR by join mode', () => {
    expect(matchesCategory('and', ['A', 'B'], ['A'])).toBe(false);
    expect(matchesCategory('or', ['A', 'B'], ['A'])).toBe(true);
  });
});

describe('FILTER_CATEGORY_JOIN_MODE / CATEGORY_TO_TAG_FIELD', () => {
  it('covers the same categories in both tables', () => {
    expect(Object.keys(FILTER_CATEGORY_JOIN_MODE).sort()).toEqual(Object.keys(CATEGORY_TO_TAG_FIELD).sort());
  });

  it('preserves AND for Features in normal/admin mode (product decision)', () => {
    // PWA quiz mode treats Features as OR via its own threshold logic; the
    // normal/admin browse table has always used AND. See the design docs.
    expect(FILTER_CATEGORY_JOIN_MODE.Features).toBe('and');
  });
});

describe('passesNormalModeFilters', () => {
  const tags = {
    platforms: ['iOS', 'Android'],
    conditions: ['Anxiety', 'Depression'],
    features: ['Journaling'],
    costs: ['Totally Free'],
    functionalities: [],
    engagements: [],
    inputs: [],
    outputs: [],
    privacies: [],
    uses: [],
    treatmentApproaches: [],
    clinicalFoundations: ['Patient Facing'],
    developerTypes: ['For Profit Company']
  };

  it('passes with no filters selected', () => {
    expect(passesNormalModeFilters(tags, {})).toBe(true);
  });

  it('ANDs across categories', () => {
    expect(passesNormalModeFilters(tags, { Platforms: ['iOS'], Conditions: ['Anxiety'] })).toBe(true);
    expect(passesNormalModeFilters(tags, { Platforms: ['iOS'], Conditions: ['PTSD'] })).toBe(false);
  });

  it('ANDs within a category per the join-mode table', () => {
    expect(passesNormalModeFilters(tags, { Conditions: ['Anxiety', 'Depression'] })).toBe(true);
    expect(passesNormalModeFilters(tags, { Conditions: ['Anxiety', 'PTSD'] })).toBe(false);
    // Features is AND in normal mode:
    expect(passesNormalModeFilters(tags, { Features: ['Journaling', 'Mood Tracking'] })).toBe(false);
  });

  it('uses exact membership, not substrings (regression)', () => {
    const t = { ...tags, conditions: ['Stress & Anxiety'] };
    expect(passesNormalModeFilters(t, { Conditions: ['Anxiety'] })).toBe(false);
  });

  it('maps the Privacy category to the privacies tag field', () => {
    const t = { ...tags, privacies: ['Has Privacy Policy'] };
    expect(passesNormalModeFilters(t, { Privacy: ['Has Privacy Policy'] })).toBe(true);
    expect(passesNormalModeFilters(t, { Privacy: ['Data Stored on Device'] })).toBe(false);
  });
});

describe('passesPwaModeThreshold', () => {
  it('passes everything when nothing is selected', () => {
    expect(passesPwaModeThreshold(0, 0)).toBe(true);
  });

  it('requires at least half the selected criteria to match', () => {
    expect(passesPwaModeThreshold(2, 4)).toBe(true);
    expect(passesPwaModeThreshold(1, 4)).toBe(false);
    expect(passesPwaModeThreshold(3, 5)).toBe(true);
    expect(passesPwaModeThreshold(2, 5)).toBe(false);
  });

  it('no longer has the exact-match cliff at 4 selected criteria (regression)', () => {
    // Old rule: <=4 selected required ALL to match; a 5th selection silently
    // relaxed the rule to "more than half". Same proportional rule applies on
    // both sides of that boundary now.
    expect(passesPwaModeThreshold(2, 3)).toBe(true); // old rule: false (needed 3/3)
    expect(passesPwaModeThreshold(2, 4)).toBe(true); // old rule: false (needed 4/4)
    expect(passesPwaModeThreshold(3, 5)).toBe(true); // unchanged either way
  });
});

describe('dedupeByGroupId', () => {
  const row = (groupId: string, created: number, approved?: boolean) => ({ groupId, created, approved });

  it('keeps the newest approved row per group even when a newer unapproved row exists', () => {
    const rows = [row('g1', 1, true), row('g1', 3, false), row('g1', 2, true)];
    expect(dedupeByGroupId(rows)).toEqual([row('g1', 2, true)]);
  });

  it('falls back to the newest row of any status when a group has no approved rows (admin mode)', () => {
    const rows = [row('g1', 1, false), row('g1', 3, false), row('g1', 2, false)];
    expect(dedupeByGroupId(rows)).toEqual([row('g1', 3, false)]);
  });

  it('handles multiple groups independently', () => {
    const rows = [row('g1', 1, true), row('g2', 5, false), row('g1', 2, false), row('g2', 4, true)];
    const result = dedupeByGroupId(rows);
    expect(result).toHaveLength(2);
    expect(result).toContainEqual(row('g1', 1, true));
    expect(result).toContainEqual(row('g2', 4, true));
  });

  it('returns one row per group for single-row groups', () => {
    const rows = [row('g1', 1, true), row('g2', 1, false)];
    expect(dedupeByGroupId(rows)).toHaveLength(2);
  });

  it('returns empty for empty input', () => {
    expect(dedupeByGroupId([])).toEqual([]);
  });
});

describe('fuzzySortFilter', () => {
  const mk = (_id: string, name: string) => ({ _id, name });
  const data = [mk('1', 'Calm'), mk('2', 'Headspace'), mk('3', 'Calmaria')];

  it('returns filtered unchanged when there are already 10+ exact matches', () => {
    const filtered = Array.from({ length: 10 }, (_, i) => mk(String(i), `App ${i}`));
    expect(fuzzySortFilter(data, filtered, 'calm')).toBe(filtered);
  });

  it('appends fuzzy name matches not already present', () => {
    const filtered = [mk('1', 'Calm')];
    const result = fuzzySortFilter(data, filtered, 'calm');
    expect(result.map(r => r._id)).toContain('3'); // Calmaria via fuzzy
    expect(result.filter(r => r._id === '1')).toHaveLength(1); // no duplicate
  });

  it('respects the custom filter for fuzzy additions', () => {
    const result = fuzzySortFilter(data, [], 'calm', row => row._id !== '3');
    expect(result.map(r => r._id)).not.toContain('3');
  });

  it('calls customFilter with exactly one argument (regression)', () => {
    // The old call site passed (row, searchtext) while every actual
    // customFilter accepted only (row); JS silently dropped the extra arg.
    const seen: number[] = [];
    const spy = function () {
      seen.push(arguments.length);
      return true;
    };
    fuzzySortFilter(data, [], 'calm', spy as any);
    expect(seen.length).toBeGreaterThan(0);
    seen.forEach(argCount => expect(argCount).toBe(1));
  });
});
