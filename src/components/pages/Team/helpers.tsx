import { getDayTimeFromTimestamp, isEmpty, sortAscending, sortDescending } from '../../../helpers';
import { escapeRegex, isMatch } from '../../application/GenericTable/helpers';

const getLatest = o => (o.updated ? o.updated : o.created);
const getSortKey = o => (!isEmpty(o.sortKey) ? Number(o.sortKey) : 0);

export const sortRows = (rows, direction) => {
  const sortKeyRows = rows.filter(r => !isEmpty(r.sortKey));
  const remaining = rows.filter(r => isEmpty(r.sortKey));

  const sortedKeyRows = sortKeyRows.sort((a, b) => sortDescending(getSortKey(a), getSortKey(b)));
  const sortedRemaining =
    direction === 'desc'
      ? remaining.sort((a, b) => sortDescending(getLatest(a), getLatest(b)))
      : remaining.sort((a, b) => sortAscending(getLatest(a), getLatest(b)));

  return [...sortedKeyRows, ...sortedRemaining];
};

export const searchRows = (rows, search) => {
  if (isEmpty(search)) {
    return rows;
  } else {
    return rows.filter(({ title, subTitle, shortDescription, created, updated }) => {
      const searchObj = {
        title,
        subTitle,
        shortDescription,
        created: created ? getDayTimeFromTimestamp(created) : '',
        updated: updated ? getDayTimeFromTimestamp(updated) : ''
      };
      return isMatch(searchObj, escapeRegex(search));
    });
  }
};
