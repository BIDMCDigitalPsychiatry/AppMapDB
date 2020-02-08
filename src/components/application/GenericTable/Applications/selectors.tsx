import { tableFilter } from '../tablehelpers';
import { AppState } from '../../../../store';
import { GenericTableContainerProps } from '../GenericTableContainer';
import Application from '../../../../database/models/Application';

export const from_database = (state: AppState, props: GenericTableContainerProps) => {
  const DB = state.database;
  var data = DB
    ? Object.keys(DB).map(k => {
        const app: Application = DB[k];
        return {
          name: app.name,
          company: app.company,
          costs: app.costs.join(''),
          platforms: app.platforms.join(' '), // for searching
          features: app.features.join(' '), // for searching
          functionalities: app.functionalities.join(' '),
          conditions: app.conditions.join(' '),
          getValues: () => app
        };
      })
    : [];
  return tableFilter(data, state, props);
};
