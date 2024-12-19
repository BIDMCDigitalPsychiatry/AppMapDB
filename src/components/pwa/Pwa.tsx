import * as React from 'react';
import { Grid, Container } from '@mui/material';
import PwaApps from './PwaApps';
import { useScrollElement } from '../layout/ScrollElementProvider';
import useHeight from '../layout/ViewPort/hooks/useHeight';
import { useHandleTableReset, useTableFilterUpdate, useTableFilterValue } from '../application/GenericTable/store';
import { isEmpty, stringifyEqual } from '../../helpers';
import { usePwaActions, useShowResults } from './store';
import { useSelector } from 'react-redux';
import { AppState } from '../../store';
import Landing from './Landing';
import { questions, searchIndex } from './questions';
import SingleAnswerButtons from './SingleAnswerButtons';

const getQuestionFilters = values => {
  var filters = {};
  questions.forEach(({ id, options }, idx) => {
    if (!isEmpty(values[idx]?.label)) {
      var selectedOption = options.find(o => o.label === values[idx]?.label);
      if (selectedOption) {
        filters[id] = selectedOption.filterValue;
      }
    } else if (Array.isArray(values[idx])) {
      var filterValues = [];
      values[idx].forEach(v => {
        filterValues = [...filterValues, ...v.filterValue];
      });
      filters[id] = filterValues;
    }
  });
  return filters;
};

export default function Pwa() {
  const index = useSelector((s: AppState) => s.pwa.index);
  const values = useSelector((s: AppState) => s.pwa.values, stringifyEqual);

  const showLanding = index < 0 ? true : false;

  const question =
    index >= 0 && index <= questions.length - 1 ? questions[index] : { id: undefined, label: '', options: [], Field: () => <></>, onSelect: undefined };

  const { id, options, Field = SingleAnswerButtons } = question;

  const value = values[index];

  const scrollEl = useScrollElement();
  const height = useHeight();
  const onReset = useHandleTableReset('Applications');

  React.useEffect(() => {
    onReset();
    // eslint-disable-next-line
  }, []);

  const scrollTop = React.useCallback(() => {
    if (scrollEl) {
      scrollEl.scrollTop = 0;
    }
    // eslint-disable-next-line
  }, [scrollEl, height]);

  const [, setValue] = useTableFilterValue('Applications', id);
  const tableFilterUpdate = useTableFilterUpdate();

  const filters = getQuestionFilters(values);

  const { change, next } = usePwaActions();

  const onChange = React.useCallback(
    index => value => {
      change({ index, value });
      if (Array.isArray(value)) {
        // Handle multi select options
        var filterValues = [];
        value.forEach(v => {
          filterValues = [...filterValues, ...v.filterValue];
        });
        setValue(filterValues); // Set individual filter value any time it changes
      } else {
        // Handle single select options
        setValue(value?.filterValue ?? []); // Set individual filter value any time it changes
      }
    },
    [change, setValue]
  );

  const handleNext = React.useCallback(() => {
    next();
    scrollTop();
  }, [next, scrollTop]);

  const showResults = useShowResults();

  React.useEffect(() => {
    if (showResults) {
      tableFilterUpdate('Applications', filters); // Sync all filters with answer filters whenever we show the results
    }
  }, [filters, showResults, tableFilterUpdate]);

  return (
    <Container maxWidth='lg' disableGutters={showLanding || index === searchIndex} sx={{ pt: 0, pb: 1, px: 0 }}>
      {showLanding ? (
        <Landing />
      ) : (
        <>
          {showResults ? (
            <PwaApps />
          ) : (
            <Container maxWidth='sm'>
              <Grid container spacing={1} alignItems='center' justifyContent='center' sx={{ px: 1, pt: 1 }}>
                <Grid item xs={12} sx={{ mt: 0.5 }}>
                  <Field onChange={onChange(index)} onNext={handleNext} options={options} value={value} />
                </Grid>
              </Grid>
            </Container>
          )}
        </>
      )}
    </Container>
  );
}
