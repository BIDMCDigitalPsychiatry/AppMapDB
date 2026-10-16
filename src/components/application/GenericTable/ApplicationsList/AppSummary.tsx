import React from 'react';
import { Grid, Box, Typography, Link, Theme } from '@mui/material';
import { makeStyles } from '../../../../styles/jss';
import { createStyles } from '../../../../styles/jss';
import Application, { DeveloperTypeQuestions, withReplacement } from '../../../../database/models/Application';
import OutlinedDiv from '../../../general/OutlinedDiv/OutlinedDiv';
import RatingsColumn from '../Applications/RatingsColumn';
import { getAppName, getAppCompany, getAppIcon, useNewerMemberCount } from '../Applications/selectors';
import { onlyUnique, getDayTimeFromTimestamp, isEmpty } from '../../../../helpers';
import DialogButton from '../../GenericDialog/DialogButton';
import { useAdminMode } from '../../../layout/store';
import ExpandableCategories from './ExpandableCategories';
import { useLastRatingDateTime } from '../ApplicationsGrid/useLastRatingDateTime';
import { useLastRatingCreatedDateTime } from '../ApplicationsGrid/useLastRatingCreatedDateTime';
import { useT } from '../../../../i18n';

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

export default function AppSummary(props: Application & AppSummaryProps & any) {
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
    RatingButtonsComponent = RatingsColumn,
    isAdminEdit
  } = props;

  const classes = useStyles();
  const t = useT();

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
  const newMemberText = newerMembers > 0 ? ` ${t('({{count}} Newer)', { count: newerMembers })}` : '';
  const [adminMode] = useAdminMode();

  const lastUpdated = useLastRatingDateTime({ created, updated });
  const lastCreated = useLastRatingCreatedDateTime({ created });
  return (
    <OutlinedDiv>
      <Box pt={1} pb={1}>
        <Grid container spacing={2}>
          <Grid item style={{ width: appColumnWidth }}>
            <Grid container spacing={2}>
              <Grid item style={{ maxWidth: 184 + 16 }}>
                <Grid container>
                  <Grid item xs={12}>
                    <img style={{ height: 184 }} src={icon} alt={t('logo')} />
                  </Grid>
                  {adminMode && (
                    <Grid item xs={12}>
                      <Typography align='center' color={approved ? 'secondary' : 'primary'}>
                        {`${approved === true ? t('Approved') : t('Not Approved')}${newMemberText}`}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Grid>
              <Grid item zeroMinWidth xs>
                <Grid container>
                  <Grid item xs={12}>
                    <Typography noWrap variant='h5'>
                      {name || t('Unknown Name')}
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
                        {(platforms || []).filter(onlyUnique).map((p, i) => (
                          <Grid item key={`platform-${p}-${i}`}>
                            <Link underline='always' key={p} className={classes.link} onClick={handleLink(p)}>
                              {t(withReplacement(p))}
                            </Link>
                            {i !== (platforms || []).filter(onlyUnique).length - 1 && `\u2022`}
                          </Grid>
                        ))}
                      </Grid>
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography noWrap color='textSecondary' variant='body1'>
                      {shortDeveloperTypes.length === 0 ? (
                        t('Unknown Developer Type')
                      ) : shortDeveloperTypes.length > 4 ? (
                        <DialogButton variant='link' size='small' Icon={null} tooltip={developerTypes.map(d => t(withReplacement(d))).join(' | ')}>
                          {t('Multiple Developer Types')}
                        </DialogButton>
                      ) : (
                        shortDeveloperTypes.map(d => t(withReplacement(d))).join(' | ')
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography noWrap color='textSecondary' variant='body1'>
                      {costs.length === 0 ? (
                        t('Unknown Cost')
                      ) : costs.length > 2 ? (
                        <DialogButton variant='link' size='small' Icon={null} tooltip={costs.map(c => t(withReplacement(c))).join(' | ')}>
                          {t('Multiple Associated Costs')}
                        </DialogButton>
                      ) : (
                        costs.map(c => t(withReplacement(c))).join(' | ')
                      )}
                    </Typography>
                  </Grid>
                  {adminMode && (
                    <Grid item xs={12}>
                      <Typography noWrap color='textSecondary' variant='body1'>
                        {t('Created: {{date}}', { date: lastCreated })}
                      </Typography>
                    </Grid>
                  )}
                  {lastCreated !== lastUpdated && (
                    <Grid item xs={12}>
                      <Typography noWrap color='textSecondary' variant='body1'>
                        {t('Last Updated: {{date}}', { date: lastUpdated })}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <RatingButtonsComponent _id={_id} rating={rating} ratingIds={ratingIds} isAdminEdit={isAdminEdit} />
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
