import React from 'react';
import { Grid, Box, Typography, makeStyles, Theme, createStyles, Button } from '@material-ui/core';
import Application from '../../../../database/models/Application';
import { getAppName, getAppCompany, getAppIcon } from '../Applications/selectors';
import { onlyUnique, getDayTimeFromTimestamp, isEmpty, sortAscendingToLower, publicUrl } from '../../../../helpers';
import DialogButton from '../../GenericDialog/DialogButton';
import { grey } from '@material-ui/core/colors';
import { useHandleChangeRoute } from '../../../layout/hooks';
import PlatformButtons from './PlatformButtons';

interface AppSummaryProps {
  ratingIds: string[];
  rating: number;
  RatingButtonsComponent: any;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tableScroll: {
      border: 0,
      'scrollbar-width': 'none' /* Firefox 64 */,
      '&::-webkit-scrollbar': {
        display: 'auto',
        width: 6,
        height: 6
      },
      '&::-webkit-scrollbar-thumb': {
        // Works on chrome only
        backgroundColor: theme.palette.primary.light,
        borderRadius: 25
      },
      '-ms-overflow-style': 'none' as any,
      '-webkit-overflow-scrolling': 'auto',
      '&::-webkit-overflow-scrolling': 'auto'
    },
    chipRoot: {
      marginLeft: -4,
      display: 'flex',
      flexWrap: 'wrap',
      '& > *': {
        margin: theme.spacing(0.5)
      }
    },
    mainChip: {
      minWidth: 130
    },
    link: {
      cursor: 'pointer',
      marginRight: 8
    },
    row: {
      borderBottom: `1px solid ${theme.palette.divider}`
    },
    secondaryButton: {
      color: theme.palette.common.white,
      background: theme.palette.primary.light,
      '&:hover': {
        background: theme.palette.primary.main
      }
    }
  })
);

const imageHeight = 64;
const maxDescription = 1000;

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

  const classes = useStyles({});
  const [expand, setExpand] = React.useState(false);

  const handleLink = React.useCallback(
    platform => event => {
      const url = platform === 'Android' ? androidLink : platform === 'iOS' ? iosLink : webLink;
      var win = window.open(url, '_blank');
      win.focus();
    },
    [androidLink, iosLink, webLink]
  );

  const handleToggleExpand = React.useCallback(() => {
    setExpand(prev => !prev);
    handleRefresh && handleRefresh();
  }, [setExpand, handleRefresh]);

  var description = !isEmpty(appleStore?.description) ? appleStore.description : androidStore?.description;
  const isExpandable = description?.length > maxDescription;
  var collapsedDescription = undefined;
  if (expand === false && isExpandable) {
    collapsedDescription = description.substring(0, maxDescription) + '...  ';
  }

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
                {isExpandable ? (
                  <>
                    <Typography variant='caption'>{expand ? description : collapsedDescription}</Typography>
                    <DialogButton variant='link' color='primary' size='small' tooltip='' underline='always' onClick={handleToggleExpand}>
                      {expand ? 'Hide More' : `Show More`}
                    </DialogButton>
                  </>
                ) : (
                  <Typography variant='caption'>{description}</Typography>
                )}
              </Grid>
            </Grid>
          </Grid>
          <Grid item style={{ width: 240 }}>
            <Grid container spacing={0}>
              <Grid item xs={12}>
                <PlatformButtons platforms={platforms} androidLink={androidLink} iosLink={iosLink} webLink={webLink}/>
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
