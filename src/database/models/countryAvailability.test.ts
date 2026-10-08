import { getAppCountries, syncLegacyCanadaUse, migrateLegacyFilters, LegacyCanadaUse, VisibleUses, VisibleUseQuestions } from './Application';
import { passesNormalModeFilters, FILTER_CATEGORY_JOIN_MODE } from '../../components/pages/useAppTableData';

describe('getAppCountries', () => {
  it('falls back to Canada for legacy-tagged apps with no countries answer', () => {
    expect(getAppCountries({ uses: ['Self Help', LegacyCanadaUse] })).toEqual(['Canada']);
  });

  it('returns nothing for unanswered apps without the legacy value', () => {
    expect(getAppCountries({ uses: ['Self Help'] })).toEqual([]);
    expect(getAppCountries({})).toEqual([]);
  });

  it('prefers an explicit countries answer, even an empty one', () => {
    expect(getAppCountries({ countries: ['UK'], uses: [LegacyCanadaUse] })).toEqual(['UK']);
    expect(getAppCountries({ countries: [], uses: [LegacyCanadaUse] })).toEqual([]);
  });
});

describe('syncLegacyCanadaUse', () => {
  it('adds the legacy value when Canada is answered yes', () => {
    expect(syncLegacyCanadaUse({ countries: ['Canada', 'UK'], uses: ['Hybrid'] }).uses).toEqual(['Hybrid', LegacyCanadaUse]);
  });

  it('removes the legacy value when Canada is answered no', () => {
    expect(syncLegacyCanadaUse({ countries: ['UK'], uses: ['Hybrid', LegacyCanadaUse] }).uses).toEqual(['Hybrid']);
  });

  it('does not duplicate the legacy value', () => {
    expect(syncLegacyCanadaUse({ countries: ['Canada'], uses: [LegacyCanadaUse] }).uses).toEqual([LegacyCanadaUse]);
  });

  it('leaves records without a countries answer untouched', () => {
    const app = { uses: [LegacyCanadaUse] };
    expect(syncLegacyCanadaUse(app)).toBe(app);
  });
});

describe('migrateLegacyFilters', () => {
  it('moves a legacy Canada selection to the Canada country', () => {
    expect(migrateLegacyFilters({ Uses: ['Hybrid', LegacyCanadaUse], Countries: ['UK'] })).toEqual({ Uses: ['Hybrid'], Countries: ['UK', 'Canada'] });
  });

  it('does not duplicate Canada', () => {
    expect(migrateLegacyFilters({ Uses: [LegacyCanadaUse], Countries: ['Canada'] })).toEqual({ Uses: [], Countries: ['Canada'] });
  });

  it('returns filters without the legacy value as-is', () => {
    const filters = { Uses: ['Hybrid'] };
    expect(migrateLegacyFilters(filters)).toBe(filters);
    expect(migrateLegacyFilters({})).toEqual({});
  });
});

describe('Country Availability filter', () => {
  it('ORs within the category', () => {
    expect(FILTER_CATEGORY_JOIN_MODE.Countries).toBe('or');
    expect(passesNormalModeFilters({ countries: ['UK'] }, { Countries: ['Canada', 'UK'] })).toBe(true);
    expect(passesNormalModeFilters({ countries: ['France'] }, { Countries: ['Canada', 'UK'] })).toBe(false);
  });

  it('hides the legacy Canada use from the visible Uses', () => {
    expect(VisibleUses).not.toContain(LegacyCanadaUse);
    expect(VisibleUseQuestions.map(q => q.value)).not.toContain(LegacyCanadaUse);
  });
});
