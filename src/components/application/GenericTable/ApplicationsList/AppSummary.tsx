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
  Tooltip,
  useTheme
} from '@material-ui/core';
import Application from '../../../../database/models/Application';
import OutlinedDiv from '../../../general/OutlinedDiv/OutlinedDiv';
import RatingsColumn from '../Applications/RatingsColumn';
import { getAppName, getAppCompany, getAppIcon } from '../Applications/selectors';
import { bool, onlyUnique } from '../../../../helpers';
import { purple, green, blue, red } from '@material-ui/core/colors';

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
    rating
  } = props;

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

  return (
    <div style={{ marginRight: 16 /*width: width - 200*/ }}>
      <OutlinedDiv>
        <Box pt={1} pb={1}>
          <Grid container>
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
                </Grid>
              </Grid>
            </Grid>
            <Grid item zeroMinWidth xs>
              <TableContainer className={classes.tableScroll}>
                <Table size='small'>
                  <TableBody>
                    {[
                      { label: 'Conditions', values: conditions.filter(onlyUnique), color: purple[colorLevel] },
                      { label: 'Features', values: features.filter(onlyUnique), color: green[colorLevel] },
                      { label: 'Functionalities', values: functionalities.filter(onlyUnique), color: blue[colorLevel] },
                      { label: 'Privacies', values: privacies.filter(onlyUnique), color: red[colorLevel] }
                    ].map((row: any, i) => (
                      <TableRow key={`${row.label}-${i}`}>
                        <TableCell style={{ width: summaryNameColumnWidth }}>
                          <Typography>{row.label}:</Typography>
                        </TableCell>
                        <TableCell>
                          {row.values.map((l, i) => (
                            <Chip
                              key={`${l}-${i}`}
                              style={{ background: row.color, color: 'white', marginRight: 8 }}
                              variant='outlined'
                              size='small'
                              label={l}
                            />
                          ))}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell style={{ width: summaryNameColumnWidth }}>
                        <Typography>Classifications:</Typography>
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                    </TableRow>
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
