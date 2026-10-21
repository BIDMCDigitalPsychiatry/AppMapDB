import React from 'react';
import { Grid } from '@mui/material';
import { EditDialogButton } from '../../GenericDialog/DialogButton';
import * as RateNewAppDialog from '../../GenericDialog/RateNewApp/RateNewAppDialog';
import * as ApplicationHistoryDialog from '../../GenericDialog/ApplicationHistoryDialog';
import * as SuggestEditDialog from '../../GenericDialog/SuggestEdit';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../store';
import { tables } from '../../../../database/dbConfig';
import { useSignedInRater } from '../../../../hooks';
import * as Icons from '@mui/icons-material';
import { useOpenApp } from '../../../layout/hooks';
import { useT } from '../../../../i18n';

export default function RatingsColumn({ _id }) {
  const initialValues = useSelector((s: AppState) => s.database[tables.applications][_id]);
  const signedInRater = useSignedInRater();
  const openApp = useOpenApp();
  const t = useT();

  return (
    <Grid container alignItems='center' spacing={1}>
      <Grid item>
        <EditDialogButton
          variant='iconbutton'
          mount={false}
          Icon={Icons.Pageview}
          onClick={() => openApp(initialValues, 'ApplicationTable')}
          tooltip={t('View Additional Application Info')}
          placement='bottom'
        />
      </Grid>
      {signedInRater && (
        <Grid item>
          <EditDialogButton
            variant='iconbutton'
            Module={RateNewAppDialog}
            mount={false}
            Icon={Icons.Edit}
            initialValues={{ [tables.applications]: initialValues }}
            tooltip={t('Edit')}
            placement='bottom'
          />
        </Grid>
      )}
      <Grid item>
        <EditDialogButton
          variant='iconbutton'
          Module={ApplicationHistoryDialog}
          mount={false}
          Icon={Icons.Timeline}
          initialValues={{ [tables.applications]: initialValues }}
          tooltip={t('Open Ratings History')}
          placement='bottom'
        />
      </Grid>
      <Grid item>
        <EditDialogButton
          variant='iconbutton'
          Module={SuggestEditDialog}
          mount={false}
          Icon={Icons.Report}
          initialValues={{ [tables.applications]: initialValues }}
          tooltip={t('Suggest Edit')}
          placement='bottom'
        />
      </Grid>
    </Grid>
  );
}
