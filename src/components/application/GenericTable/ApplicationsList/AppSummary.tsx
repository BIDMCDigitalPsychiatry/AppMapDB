import React from 'react';
import { Grid, Box, Typography, Link, Chip, makeStyles, Theme, createStyles } from '@material-ui/core';
import Application, { DeveloperTypeQuestions } from '../../../../database/models/Application';
import OutlinedDiv from '../../../general/OutlinedDiv/OutlinedDiv';
import RatingsColumn from '../Applications/RatingsColumn';
import { getAppName, getAppCompany, getAppIcon } from '../Applications/selectors';
import { onlyUnique, getDayTimeFromTimestamp, isEmpty } from '../../../../helpers';
import { purple, green, blue, pink, cyan, indigo, yellow, deepOrange, lime } from '@material-ui/core/colors';
import DialogButton from '../../GenericDialog/DialogButton';
import { useSelector } from 'react-redux';
import { tables } from '../../../../database/dbConfig';
import { AppState } from '../../../../store';
import { useAdminMode } from '../../../layout/store';

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

const useNewerMemberCount = (groupId, created) => {
  const apps = useSelector((state: AppState) => state.database[tables.applications] ?? {});
  return Object.keys(apps).filter(k => (apps[k]._id === groupId || apps[k].groupId === groupId) && apps[k].created > created).length;
};

export default function AppSummary(props: Application & AppSummaryProps) {
  const {
    _id,
    name = getAppName(props),
    company = getAppCompany(props),
    platforms = [],
    costs = [],
    privacies = [],
    uses = [],
    features = [],
    functionalities = [],
    conditions = [],
    engagements = [],
    clinicalFoundations = [],
    developerTypes = [],
    inputs = [],
    outputs = [],
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

  const colorLevel = 700;

  const [state, setState] = React.useState({});

  const handleExpand = React.useCallback(
    name => event => {
      setState(prev => ({ ...prev, [name]: true }));
      handleRefresh && handleRefresh();
    },
    [setState, handleRefresh]
  );

  const handleToggleExpand = React.useCallback(() => {
    setExpand(prev => !prev);
    handleRefresh && handleRefresh();
  }, [setExpand, handleRefresh]);

  const categories = [
    { label: 'Access', values: functionalities.filter(onlyUnique), color: blue[colorLevel] },
    { label: 'Privacy', values: privacies.filter(onlyUnique), color: pink[400] },
    { label: 'Clinical Foundation', values: clinicalFoundations.filter(onlyUnique), color: indigo[colorLevel] },
    { label: 'Features', values: features.filter(onlyUnique), color: green[colorLevel] },
    { label: 'Conditions Supported', values: conditions.filter(onlyUnique), color: purple[colorLevel] },
    { label: 'Engagements', values: engagements.filter(onlyUnique), color: lime[colorLevel] },
    { label: 'Inputs', values: inputs.filter(onlyUnique), color: yellow[colorLevel] },
    { label: 'Outputs', values: outputs.filter(onlyUnique), color: deepOrange[400] },
    { label: 'Uses', values: uses.filter(onlyUnique), color: cyan[colorLevel] }
  ];

  const filtered = categories.filter(
    row => expand || ['Access', 'Privacy', 'Clinical Foundation', 'Features', 'Conditions Supported'].find(l => l === row.label)
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
            {filtered.map((row: any, i) => (
              <Grid key={i} container alignItems='center' spacing={1} className={classes.row}>
                <Grid item style={{ width: 172 }}>
                  <Typography>{row.label}:</Typography>
                </Grid>
                <Grid item zeroMinWidth xs className={classes.chipRoot}>
                  {row.values.map((l, i) =>
                    i === 3 && row.values.length > 4 && state[row.label] !== true ? (
                      <Chip
                        key={`${l}-${i}`}
                        style={{ background: row.color, color: 'white', marginRight: 8 }}
                        variant='outlined'
                        size='small'
                        label={`${row.values.length - 3} More ...`}
                        onClick={handleExpand(row.label)}
                      />
                    ) : i > 3 && row.values.length > 4 && state[row.label] !== true ? (
                      <div key={`${l}-${i}`}></div>
                    ) : (
                      <Chip key={`${l}-${i}`} style={{ background: row.color, color: 'white', marginRight: 8 }} variant='outlined' size='small' label={l} />
                    )
                  )}
                </Grid>
              </Grid>
            ))}
            <DialogButton
              style={{ marginLeft: -4, marginTop: 8 }}
              variant='link'
              color='primary'
              size='small'
              tooltip=''
              underline={true}
              onClick={handleToggleExpand}
            >
              {`${expand ? 'Hide' : `Show  ${categories.length - filtered.length}`} More`}
            </DialogButton>
          </Grid>
        </Grid>
      </Box>
    </OutlinedDiv>
  );
}
