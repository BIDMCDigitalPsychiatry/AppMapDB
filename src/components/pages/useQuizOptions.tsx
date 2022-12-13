import * as React from 'react';
import { useChangeRoute } from '../layout/hooks';
import { publicUrl } from '../../helpers';
import { internalKeys } from '../application/GenericDialog/InteractiveSearch/InteractiveSearchCard';
import { useTableValues } from '../application/GenericTable/store';

export default function useQuizOptions() {
  const [state, setState] = React.useState({ searchtext: '', Platforms: [], Features: [], hasClinicalFoundation: false, isSpanish: false, isOffline: false });
  const [, setValues] = useTableValues('Applications');

  // Sets the associated values in the redux store
  const setTableState = React.useCallback(() => {
    const { searchtext, isSpanish, isOffline, hasClinicalFoundation, ...filters } = state;
    var filteredFilters = Object.keys(filters)
      .filter(k => !internalKeys.includes(k))
      .reduce((o, k) => {
        o[k] = filters[k];
        return o;
      }, {});

    if (isSpanish === true) {
      filteredFilters['Functionalities'] = [...(filteredFilters['Functionalities'] ?? []), 'Spanish'];
    }
    if (isOffline === true) {
      filteredFilters['Functionalities'] = [...(filteredFilters['Functionalities'] ?? []), 'Offline'];
    }
    if (hasClinicalFoundation === true) {
      filteredFilters['ClinicalFoundations'] = [...(filteredFilters['ClinicalFoundations'] ?? []), 'Supporting Studies'];
    }
    setValues({ searchtext, filters: filteredFilters });
    // eslint-disable-next-line
  }, [setValues, JSON.stringify(state)]);

  const changeRoute = useChangeRoute();

  const handleSearch = React.useCallback(() => {
    setTableState();
    changeRoute(publicUrl('/Apps'));
  }, [changeRoute, setTableState]);

  return { state, setState, handleSearch };
}
