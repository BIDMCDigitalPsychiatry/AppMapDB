import React from 'react';
import {
  Grid,
  Box,
  Typography,
  Link,
  Chip,
  TableContainer,
  Table,
  TableRow,
  TableCell,
  TableBody,
  makeStyles,
  Theme,
  createStyles,
  Tooltip
} from '@material-ui/core';
import Application from '../../../../database/models/Application';
import OutlinedDiv from '../../../general/OutlinedDiv/OutlinedDiv';
import RatingsColumn from '../Applications/RatingsColumn';
import { getAppName, getAppCompany, getAppIcon } from '../Applications/selectors';
import { bool, onlyUnique } from '../../../../helpers';

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
    }
  })
);

const appColumnWidth = 520;
const summaryNameColumnWidth = 60;

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
    inputs = [],
    outputs = [],
    engagements = [],
    conditions = [],
    clinicalFoundation,
    developerType,
    causeHarm,
    useWarning,
    selfHelp,
    referenceApp,
    hybridUse,
    androidLink,
    iosLink,
    webLink,
    ratingIds = [],
    icon = getAppIcon(props),
    rating
  } = props;

  const classes = useStyles({});

  const handleLink = React.useCallback(
    platform => event => {
      const url = platform === 'Android' ? androidLink : platform === 'iOS' ? iosLink : webLink;
      var win = window.open(url, '_blank');
      win.focus();
    },
    [androidLink, iosLink, webLink]
  );

  return (
    <div style={{ marginRight: 16 /*width: width - 200*/ }}>
      <OutlinedDiv>
        <Box pt={1} pb={1}>
          <Grid container>
            <Grid item style={{ width: appColumnWidth }}>
              <Grid container spacing={2}>
                <Grid item>
                  <img style={{ height: 170 }} src={icon} alt='logo' />
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
                </Grid>
                <Grid item xs={12}>
                  <div className={classes.chipRoot}>
                    {[
                      { label: 'Self Help Tool', value: bool(selfHelp), tooltip: 'App is a self-help/self-management tool.' },
                      { label: 'Supporting Studies', value: clinicalFoundation === 'Supporting Studies', tooltip: 'App has supporting studies.' },
                      { label: 'Hybrid Use', value: bool(hybridUse), tooltip: 'App can be used with a clinician in conjuction with treatment plan.' },
                      { label: 'Reference App', value: bool(referenceApp), tooltip: 'App is a reference app.' },
                      { label: 'Can Cause Harm', value: bool(causeHarm), tooltip: 'App can cause harm.' },
                      { label: 'Use Warning', value: bool(useWarning), tooltip: 'App provides warning for use.' }
                    ]
                      .filter(c => c.value)
                      .map((c, i) => (
                        <Tooltip key={`main-chip-${c.label}`} title={(<Typography>{c.tooltip}</Typography>) as any}>
                          <Chip className={classes.mainChip} color='primary' size='small' label={c.label} />
                        </Tooltip>
                      ))}
                  </div>
                </Grid>
              </Grid>
            </Grid>
            <Grid item zeroMinWidth xs>
              <TableContainer className={classes.tableScroll}>
                <Table size='small'>
                  <TableBody>
                    {[
                      { label: 'Conditions', values: conditions.filter(onlyUnique) },
                      { label: 'Features', values: features.filter(onlyUnique) },
                      { label: 'Functionalities', values: functionalities.filter(onlyUnique) },
                      { label: 'Privacies', values: privacies.filter(onlyUnique) },
                      { label: 'Inputs', values: inputs.filter(onlyUnique) },
                      { label: 'Outputs', values: outputs.filter(onlyUnique) },
                      { label: 'Engagements', values: engagements.filter(onlyUnique) }
                    ].map((row: any, i) => (
                      <TableRow key={`${row.label}-${i}`}>
                        <TableCell style={{ width: summaryNameColumnWidth }}>
                          <Chip color='primary' size='small' label={row.values.length} style={{ minWidth: 30, marginRight: 8 }} />
                          {row.label}:
                        </TableCell>
                        <TableCell>
                          {row.values.map((l, i) => (
                            <Chip key={`${l}-${i}`} style={{ marginRight: 8 }} color='primary' variant='outlined' size='small' label={l} />
                          ))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </Box>
      </OutlinedDiv>
    </div>
  );
}
