import React from 'react';
import { Grid, Box, Typography, Link, Chip, makeStyles, Theme, createStyles, Tooltip, useTheme } from '@material-ui/core';
import Application from '../../../../database/models/Application';
import OutlinedDiv from '../../../general/OutlinedDiv/OutlinedDiv';
import RatingsColumn from '../Applications/RatingsColumn';
import { getAppName, getAppCompany, getAppIcon } from '../Applications/selectors';
import { bool, onlyUnique, getDayTimeFromTimestamp } from '../../../../helpers';
import { purple, green, blue, pink } from '@material-ui/core/colors';

interface AppSummaryProps {
  ratingIds: string[];
  rating: number;
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
    privacies = [],
    features = [],
    functionalities = [],
    conditions = [],
    clinicalFoundation,
    developerType,
    selfHelp,
    referenceApp,
    hybridUse,
    androidLink,
    iosLink,
    webLink,
    ratingIds = [],
    icon = getAppIcon(props),
    rating,
    updated
  } = props;

  const { handleRefresh } = props as any;

  const classes = useStyles({});
  const theme = useTheme();

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

  return (
    <OutlinedDiv>
      <Box pt={1} pb={1}>
        <Grid container spacing={2}>
          <Grid item style={{ width: appColumnWidth }}>
            <Grid container spacing={2}>
              <Grid item>
                <img style={{ height: 184 }} src={icon} alt='logo' />
              </Grid>
              <Grid item zeroMinWidth xs>
                <Typography noWrap variant='h5'>
                  {name}
                </Typography>
                <Typography noWrap color='textSecondary'>
                  {company}
                </Typography>
                <Typography noWrap color='textSecondary' variant='body1'>
                  {developerType}
                </Typography>
                <Typography noWrap component='span'>
                  <Grid container spacing={1}>
                    {platforms.filter(onlyUnique).map((p, i) => (
                      <Grid item key={`platform-${p}-${i}`}>
                        <Link underline='always' key={p} className={classes.link} onClick={handleLink(p)}>
                          {p}
                        </Link>
                        {i !== platforms.length - 1 && `\u2022`}
                      </Grid>
                    ))}
                  </Grid>
                </Typography>
                <Typography noWrap color='textSecondary' variant='caption'>
                  {costs.join(' | ')}
                </Typography>
                <div style={{ maxWidth: 130 }}>
                  <RatingsColumn _id={_id} rating={rating} ratingIds={ratingIds} />
                </div>
                <Typography noWrap color='textSecondary' variant='caption'>
                  Last Updated: {updated ? getDayTimeFromTimestamp(updated) : ''}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs style={{ minWidth: 350 }}>
            {[
              { label: 'Conditions', values: conditions.filter(onlyUnique), color: purple[colorLevel] },
              { label: 'Features', values: features.filter(onlyUnique), color: green[colorLevel] },
              { label: 'Functionalities', values: functionalities.filter(onlyUnique), color: blue[colorLevel] },
              { label: 'Privacies', values: privacies.filter(onlyUnique), color: pink[400] }
            ].map((row: any, i) => (
              <Grid key={i} container alignItems='center' spacing={1} className={classes.row}>
                <Grid item style={{ width: 120 }}>
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
            <Grid container alignItems='center' spacing={1} className={classes.row}>
              <Grid item style={{ width: 120 }}>
                <Typography>Classifications:</Typography>
              </Grid>
              <Grid item zeroMinWidth xs className={classes.chipRoot}>
                {[
                  { label: 'Self Help Tool', value: bool(selfHelp), tooltip: 'App is a self-help/self-management tool.' },
                  { label: 'Supporting Studies', value: clinicalFoundation === 'Supporting Studies', tooltip: 'App has supporting studies.' },
                  { label: 'Hybrid Use', value: bool(hybridUse), tooltip: 'App can be used with a clinician in conjuction with treatment plan.' },
                  { label: 'Reference App', value: bool(referenceApp), tooltip: 'App is a reference app.' }
                ]
                  .filter(c => c.value)
                  .map((c, i) => (
                    <Tooltip key={`main-chip-${c.label}`} title={(<Typography>{c.tooltip}</Typography>) as any}>
                      <Chip
                        style={{ background: theme.palette.primary.main, color: 'white', marginRight: 8 }}
                        variant='outlined'
                        size='small'
                        className={classes.mainChip}
                        color='primary'
                        label={c.label}
                      />
                    </Tooltip>
                  ))}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </OutlinedDiv>
  );
}
