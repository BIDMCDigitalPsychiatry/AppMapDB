import * as React from 'react';
import { useApplications } from '../../../../database/useApplications';
import {
  dedupeByGroupId,
  matchesCategory,
  FILTER_CATEGORY_JOIN_MODE,
  CATEGORY_TO_TAG_FIELD
} from '../../../pages/useAppTableData';
import { useTableFilterValues } from '../../GenericTable/store';
import { isEmpty } from '../../../../helpers';

const CATEGORIES = Object.keys(FILTER_CATEGORY_JOIN_MODE);

/*
 * Faceted option counts for the public filter drawer: for an option, the
 * number of apps the library would show AFTER clicking it — i.e. with all
 * currently-active filters applied, plus (or minus, if already selected)
 * that option. Uses the same matching semantics as the live filter
 * (exact tags, per-category join modes, parent-label expansion).
 *
 * Counts are over current approved apps and structured filters only (the
 * free-text search box is not included).
 *
 * Returns a stable (per apps/filters) `getCount(categoryId, optionValue)`.
 */
export const useFilterOptionCount = () => {
  const [apps] = useApplications();
  const [filters = {}] = useTableFilterValues('Applications');

  // Per app: its tag values per category; whether it passes each category
  // under the CURRENT selections; and whether it passes all OTHER categories.
  // A toggle is then evaluated by re-checking only the toggled category.
  const perApp = React.useMemo(() => {
    const wrapped = Object.keys(apps ?? {})
      .map(k => apps[k])
      .filter(r => r.draft !== true && r.delete !== true && r.approved === true)
      .map(r => ({ groupId: isEmpty(r.groupId) ? r._id : r.groupId, created: r.created, approved: r.approved, row: r }));
    const current = dedupeByGroupId(wrapped).map((w: any) => w.row);

    return current.map(app => {
      const values: Record<string, unknown> = {};
      const passes: Record<string, boolean> = {};
      for (const cat of CATEGORIES) {
        values[cat] = app[CATEGORY_TO_TAG_FIELD[cat]];
        passes[cat] = matchesCategory(FILTER_CATEGORY_JOIN_MODE[cat], (filters as any)[cat] ?? [], values[cat]);
      }
      const passesAllExcept: Record<string, boolean> = {};
      for (const cat of CATEGORIES) {
        let ok = true;
        for (const other of CATEGORIES) {
          if (other !== cat && !passes[other]) {
            ok = false;
            break;
          }
        }
        passesAllExcept[cat] = ok;
      }
      return { values, passesAllExcept };
    });
  }, [apps, filters]);

  return React.useCallback(
    (categoryId: string, optionValue: string): number => {
      const selected: string[] = (filters as any)[categoryId] ?? [];
      const toggled = selected.includes(optionValue) ? selected.filter(s => s !== optionValue) : [...selected, optionValue];
      let n = 0;
      for (const { values, passesAllExcept } of perApp) {
        if (passesAllExcept[categoryId] && matchesCategory(FILTER_CATEGORY_JOIN_MODE[categoryId], toggled, values[categoryId])) n++;
      }
      return n;
    },
    [perApp, filters]
  );
};

export default useFilterOptionCount;
