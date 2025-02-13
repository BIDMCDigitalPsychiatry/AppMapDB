import { Grid } from '@mui/material';
import { EditDialogButton } from '../../GenericDialog/DialogButton';
import * as ApplicationHistoryDialogV2 from '../../GenericDialog/ApplicationHistoryDialogV2';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../store';
import { tables } from '../../../../database/dbConfig';
import { useSignedInRater } from '../../../../hooks';
import * as Icons from '@mui/icons-material';
import { useHandleChangeRoute } from '../../../layout/hooks';
import { publicUrl } from '../../../../helpers';
import * as RateNewAppDialogAdminEdit from '../../GenericDialog/RateNewApp/RateNewAppDialogAdminEdit';

export default function RatingsColumnPending({ _id }) {
  const initialValues = useSelector((s: AppState) => s.database[tables.applications][_id]);
  const signedInRater = useSignedInRater();
  const handleChangeRoute = useHandleChangeRoute();

  return (
    <Grid container alignItems='center' spacing={1}>
      <Grid item>
        <EditDialogButton
          variant='iconbutton'
          mount={false}
          Icon={Icons.Pageview}
          onClick={handleChangeRoute(publicUrl('/ViewApp'), { app: initialValues, from: 'Admin' })}
          tooltip='View Additional Application Info'
          placement='bottom'
        />
      </Grid>
      {signedInRater && (
        <Grid item>
          <EditDialogButton
            variant='iconbutton'
            Module={RateNewAppDialogAdminEdit}
            mount={false}
            Icon={Icons.Edit}
            initialValues={{ [tables.applications]: initialValues }}
            tooltip='Edit'
            placement='bottom'
          />
        </Grid>
      )}
      <Grid item>
        <EditDialogButton
          variant='iconbutton'
          Module={ApplicationHistoryDialogV2}
          mount={false}
          Icon={Icons.Timeline}
          initialValues={{ [tables.applications]: initialValues }}
          tooltip='Open Ratings History'
          placement='bottom'
          isAdminEdit={true}
        />
      </Grid>
    </Grid>
  );
}
