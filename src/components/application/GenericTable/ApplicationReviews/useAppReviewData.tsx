import { AppState } from '../../../../store';
import Application from '../../../../database/models/Application';
import { getGroupId, isEmpty } from '../../../../helpers';
import { useTableFilter } from '../helpers';
import { tables } from '../../../../database/dbConfig';
import { useSelector } from 'react-redux';

export const useAppReviewData = (table, groupId) => {
  const apps = useSelector((s: AppState) => s.database[tables.applications] ?? {});
  var data = apps
    ? Object.keys(apps)
        .filter(
          k => apps[k].draft !== true && apps[k].delete !== true && !isEmpty(apps[k].review) && apps[k].approved === true && getGroupId(apps[k]) === groupId
        )
        .map((k, i) => {
          const app: Application = apps[k];
          return {
            _id: app._id,
            parent: app.parent,
            getValues: () => ({ ...app, index: i }),
            created: app.created,
            approved: app.approved,
            review: app.review,
            groupId: getGroupId(app)
          };
        })
    : [];

  var sorted = data.sort(({ getValues: a }, { getValues: b }) => (b() as any).created - (a() as any).created); // Create a sorted ascending list
  return useTableFilter(sorted, table);
};
