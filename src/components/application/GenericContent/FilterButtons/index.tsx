import React from 'react';
import { useSignedIn } from '../../../../hooks';
import { Grid, Typography } from '@material-ui/core';
import { useTableFilterValues, useHandleTableReset } from '../../GenericTable/store';
import DialogButton from '../../GenericDialog/DialogButton';
import * as DeleteFilterDialog from '../../GenericDialog/DeleteFilter';
import * as SaveFilterDialog from '../../GenericDialog/SaveFilter';
import * as LoadFilterDialog from '../../GenericDialog/LoadFilter';

export default function FilterButtons({ variant = 'smallOutlined', underline = 'always' }) {
  const signedIn = useSignedIn();
  const [values, setValues] = useTableFilterValues('Applications');
  const handleReset = useHandleTableReset('Applications');
  const { SavedFilter } = values;
  const SavedFilterStr = JSON.stringify(SavedFilter);

  React.useEffect(() => {
    SavedFilterStr && setValues(prev => ({ ...JSON.parse(SavedFilterStr), SavedFilter: prev.SavedFilter })); // If we changed the selected saved filter then update the filters on the page
  }, [SavedFilterStr, setValues]);

  return (
    <Grid container spacing={2} justify='space-around' alignItems='center'>
      <>
        <Grid item>
          <DialogButton variant={variant} underline={underline} onClick={handleReset}>
            Reset Filter
          </DialogButton>
        </Grid>
        <Grid item>
          <DialogButton disabled={!signedIn} Module={LoadFilterDialog} variant={variant} underline={underline}>
            Load Filter
          </DialogButton>
        </Grid>
        <Grid item>
          <DialogButton disabled={!signedIn} Module={SaveFilterDialog} variant={variant} underline={underline}>
            Save Filter
          </DialogButton>
        </Grid>
        <Grid item>
          <DialogButton disabled={!signedIn} Module={DeleteFilterDialog} variant={variant} underline={underline}>
            Delete Filter
          </DialogButton>
        </Grid>
        {!signedIn && (
          <Grid item xs={12}>
            <Typography variant='caption' color='textSecondary'>
              You must create an account and sign in to save and load filters.
            </Typography>
          </Grid>
        )}
      </>
    </Grid>
  );
}
