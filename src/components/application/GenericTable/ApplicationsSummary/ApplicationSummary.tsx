import React from 'react';
import { Grid, Box, Typography } from '@material-ui/core';
import Application from '../../../../database/models/Application';
import { getAppName, getAppCompany, getAppIcon } from '../Applications/selectors';
import { getDayTimeFromTimestamp, publicUrl } from '../../../../helpers';
import DialogButton from '../../GenericDialog/DialogButton';
import { grey } from '@material-ui/core/colors';
import { useHandleChangeRoute } from '../../../layout/hooks';
import PlatformButtons from './PlatformButtons';
import ExpandableDescription from './ExpandableDescription';

interface AppSummaryProps {
  ratingIds: string[];
  rating: number;
  RatingButtonsComponent: any;
}

const imageHeight = 64;

export default function ApplicationSummary(props: Application & AppSummaryProps) {
  const {
    name = getAppName(props),
    company = getAppCompany(props),
    platforms = [],
    costs = [],
    androidLink,
    iosLink,
    androidStore,
    appleStore,
    webLink,
    icon = getAppIcon(props),
    created,
    updated
  } = props;

  const { handleRefresh } = props as any;

  const handleChangeRoute = useHandleChangeRoute();

  return (
    <Box mt={2} ml={2} mr={2} bgcolor={grey[100]} borderColor={grey[300]} border='2px solid' borderRadius={15}>
      <Box p={2}>
        <Grid container spacing={4}>
          <Grid item xs style={{ minWidth: 300 }}>
            <Grid container spacing={1}>
              <Grid item style={{ maxWidth: imageHeight + 16 }}>
                <img style={{ height: imageHeight }} src={icon} alt='logo' />
              </Grid>
              <Grid item zeroMinWidth xs>
                <Grid container>
                  <Grid item xs={12}>
                    <Typography variant='h5'>{name || 'Unknown Name'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography color='textSecondary'>{company}</Typography>
                  </Grid>
                  {/*<Grid item xs={12}>
                    <Typography noWrap color='textSecondary' variant='caption'>
                      Last Version Update:
                    </Typography>
                  </Grid>
  */}
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <ExpandableDescription appleStore={appleStore} androidStore={androidStore} handleRefresh={handleRefresh} />
              </Grid>
            </Grid>
          </Grid>
          <Grid item style={{ width: 240 }}>
            <Grid container spacing={0}>
              <Grid item xs={12}>
                <PlatformButtons platforms={platforms} androidLink={androidLink} iosLink={iosLink} webLink={webLink} />
              </Grid>
              <Grid item xs={12}>
                <Typography noWrap color='textSecondary' variant='caption'>
                  {costs.length === 0 ? (
                    'Unknown Cost'
                  ) : costs.length > 2 ? (
                    <DialogButton variant='link' size='small' Icon={null} tooltip={costs.join(' | ')}>
                      Multiple Associated Costs
                    </DialogButton>
                  ) : (
                    costs.join(' | ')
                  )}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography noWrap color='textSecondary' variant='caption'>
                  Last App Rating: {updated ? getDayTimeFromTimestamp(updated) : created ? getDayTimeFromTimestamp(created) : ''}
                </Typography>
              </Grid>
            </Grid>
            <Grid item xs={12} style={{ paddingTop: 16 }}>
              <DialogButton tooltip='' variant='primaryButton2' size='large' onClick={handleChangeRoute(publicUrl('/ViewApp'), props)}>
                View
              </DialogButton>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
