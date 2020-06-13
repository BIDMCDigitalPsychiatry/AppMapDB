import { AppState } from '../../../../store';
import Application from '../../../../database/models/Application';
import { isEmpty } from '../../../../helpers';
import { useTableFilter } from '../helpers';
import { tables } from '../../../../database/dbConfig';
import { useSelector } from 'react-redux';

const getId = app => (isEmpty(app.groupId) ? app._id : app.groupId);

export const useAppReviewData = (table, groupId) => {
  const apps = useSelector((s: AppState) => s.database[tables.applications] ?? {});
  var data = apps
    ? Object.keys(apps)
        .filter(k => apps[k].delete !== true && !isEmpty(apps[k].review) && apps[k].approved === true && getId(apps[k]) === groupId)
        .map((k, i) => {
          const app: Application = apps[k];
          return {
            _id: app._id,            
            parent: app.parent,
            getValues: () => ({ ...app, index: i }),
            created: app.created,
            approved: app.approved,
            review: app.review,
            groupId: getId(app)
          };
        })
    : [];

  var sorted = data.sort(({ getValues: a }, { getValues: b }) => (b() as any).created - (a() as any).created); // Create a sorted ascending list
  return useTableFilter(sorted, table);
};
