import React from 'react';
import { Grid, Box, Typography, Link, makeStyles, Theme, createStyles } from '@material-ui/core';
import Application, { DeveloperTypeQuestions } from '../../../../database/models/Application';
import OutlinedDiv from '../../../general/OutlinedDiv/OutlinedDiv';
import RatingsColumn from '../Applications/RatingsColumn';
import { getAppName, getAppCompany, getAppIcon, useNewerMemberCount } from '../Applications/selectors';
import { onlyUnique, getDayTimeFromTimestamp, isEmpty } from '../../../../helpers';
import DialogButton from '../../GenericDialog/DialogButton';
import { useAdminMode } from '../../../layout/store';
import ExpandableCategories from './ExpandableCategories';

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
    }
  })
);

const appColumnWidth = 520;

export default function AppSummary(props: Application & AppSummaryProps) {
  const {
    _id,
    name = getAppName(props),
    company = getAppCompany(props),
    platforms = [],
    costs = [],
    developerTypes = [],
    androidLink,
    iosLink,
    webLink,
    ratingIds = [],
    icon = getAppIcon(props),
    rating,
    created,
    updated,
    approved,
    groupId,
    RatingButtonsComponent = RatingsColumn
  } = props;

  const classes = useStyles();

  const handleLink = React.useCallback(
    platform => event => {
      const url = platform === 'Android' ? androidLink : platform === 'iOS' ? iosLink : webLink;
      var win = window.open(url, '_blank');
      win.focus();
    },
    [androidLink, iosLink, webLink]
  );

  const shortDeveloperTypes = developerTypes.map(dt => {
    const dtq = DeveloperTypeQuestions.find(dtq => dtq.value === dt);
    return dtq ? (dtq.short ? dtq.short : dtq.value) : dt;
  });

  const GroupId = isEmpty(groupId) ? _id : groupId;
  const newerMembers = useNewerMemberCount(GroupId, created);
  const newMemberText = newerMembers > 0 ? ` (${newerMembers} Newer)` : '';
  const [adminMode] = useAdminMode();
  return (
    <OutlinedDiv>
      <Box pt={1} pb={1}>
        <Grid container spacing={2}>
          <Grid item style={{ width: appColumnWidth }}>
            <Grid container spacing={2}>
              <Grid item style={{ maxWidth: 184 + 16 }}>
                <Grid container>
                  <Grid item xs={12}>
                    <img style={{ height: 184 }} src={icon} alt='logo' />
                  </Grid>
                  {adminMode && (
                    <Grid item xs={12}>
                      <Typography align='center' color={approved ? 'secondary' : 'primary'}>
                        {`${approved === true ? 'Approved' : 'Not Approved'}${newMemberText}`}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Grid>
              <Grid item zeroMinWidth xs>
                <Grid container>
                  <Grid item xs={12}>
                    <Typography noWrap variant='h5'>
                      {name || 'Unknown Name'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography noWrap color='textSecondary'>
                      {company}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography noWrap component='span'>
                      <Grid container spacing={1}>
                        {platforms.filter(onlyUnique).map((p, i) => (
                          <Grid item key={`platform-${p}-${i}`}>
                            <Link underline='always' key={p} className={classes.link} onClick={handleLink(p)}>
                              {p}
                            </Link>
                            {i !== platforms.filter(onlyUnique).length - 1 && `\u2022`}
                          </Grid>
                        ))}
                      </Grid>
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography noWrap color='textSecondary' variant='caption'>
                      {shortDeveloperTypes.length === 0 ? (
                        'Unknown Developer Type'
                      ) : shortDeveloperTypes.length > 4 ? (
                        <DialogButton variant='link' size='small' Icon={null} tooltip={developerTypes.join(' | ')}>
                          Multiple Developer Types
                        </DialogButton>
                      ) : (
                        shortDeveloperTypes.join(' | ')
                      )}
                    </Typography>
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
                  {adminMode && (
                    <Grid item xs={12}>
                      <Typography noWrap color='textSecondary' variant='caption'>
                        Created: {updated ? getDayTimeFromTimestamp(created) : ''}
                      </Typography>
                    </Grid>
                  )}
                  {created !== updated && (
                    <Grid item xs={12}>
                      <Typography noWrap color='textSecondary' variant='caption'>
                        Last Updated: {updated ? getDayTimeFromTimestamp(updated) : ''}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <RatingButtonsComponent _id={_id} rating={rating} ratingIds={ratingIds} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs style={{ minWidth: 450 }}>
            <ExpandableCategories {...props} />
          </Grid>
        </Grid>
      </Box>
    </OutlinedDiv>
  );
}
