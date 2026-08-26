import * as React from 'react';
import { Box, Card, CardContent, Chip, Grid, Typography } from '@mui/material';
import { createStyles } from '../../../../styles/jss';
import { makeStyles } from '../../../../styles/jss';
import { isEmpty, lineClamp, publicUrl, stripContent } from '../../../../helpers';
import { useChangeRoute } from '../../../layout/hooks';
import { getAppCompany, getAppIcon, getAppName } from '../Applications/selectors';
import PlatformButtons from './PlatformButtons';
import { useLastRatingDateTime } from './useLastRatingDateTime';
import { useDialogState } from '../../GenericDialog/useDialogState';
import { title } from '../../GenericDialog/ViewApp';
import { green } from '@mui/material/colors';
import { withReplacement } from '../../../../database/models/Application';
import { categories } from '../../../../constants';
import { useAreFiltersActive } from '../../../pages/useAppTableData';
import { useFilterCount } from '../../../layout/useFilterCount';

const height = 352;
const extraPwaHeight = 48;
const iconSize = 64;

const useStyles = makeStyles((theme: any) =>
  createStyles({
    root: ({ isPwa }: any) => ({
      flex: '1',
      textAlign: 'left',
      height: isPwa ? height + extraPwaHeight : height,
      display: 'flex',
      flexDirection: 'column',
      transition: 'box-shadow 0.15s ease-in-out, transform 0.15s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 24px rgba(16, 24, 40, 0.12)'
      },
      cursor: 'pointer'
    }),
    icon: {
      width: iconSize,
      height: iconSize,
      borderRadius: 16,
      border: `1px solid ${theme.palette.divider ?? '#E5EAF0'}`,
      objectFit: 'cover',
      backgroundColor: theme.palette.common.white,
      flexShrink: 0
    },
    // Show full names by wrapping up to two lines instead of truncating one.
    clamp2: {
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical' as any,
      WebkitLineClamp: 2,
      overflow: 'hidden',
      wordBreak: 'break-word'
    },
    description: {
      color: theme.palette.text.secondary,
      '& h1, & h2, & h3, & h4': {
        fontSize: theme.typography.body2.fontSize,
        fontWeight: theme.typography.fontWeightBold,
        lineHeight: 1.4,
        margin: '8px 0 4px 0'
      },
      '& p': {
        fontSize: theme.typography.body2.fontSize,
        lineHeight: theme.typography.body2.lineHeight,
        marginBottom: 6,
        marginTop: 6
      },
      '& li': {
        fontSize: theme.typography.body2.fontSize,
        lineHeight: theme.typography.body2.lineHeight,
        marginBottom: 4
      }
    }
  })
);

export function PwaApplicationsGridItem(props) {
  return <ApplicationsGridItem {...props} isPwa={true} />;
}

const FilterMatchCount = props => {
  const filterMatches = props?.filterMatches ?? [];
  const matchCount = filterMatches?.length ?? 0;
  const filterCount = useFilterCount();

  const matchText = `Meets ${matchCount}/${filterCount} Criteria:`;

  return matchCount > 0 ? (
    <Box sx={{ pb: 0.5 }}>
      <Grid container justifyContent='space-between' alignItems='center'>
        <Grid item xs>
          <Grid container justifyContent='flex-start' alignItems='center' spacing={0.1} sx={{ backgroundColor: 'primary.light' }}>
            <Grid item>
              <Box sx={{ fontSize: 14, height: 20, mr: 0.5, color: 'white', fontWeight: 'bold', ml: 0.25, pl: 0.5, pr: 1 }}>{matchText}</Box>
            </Grid>
            {filterMatches.map((item, i) => {
              const category = categories[item.key];
              return (
                <Grid item key={item?.value}>
                  <Chip
                    key={`${item?.value}-${i}`}
                    style={{ background: green[700], color: 'white', marginRight: 0, fontSize: 12, height: 20 }}
                    variant='outlined'
                    size='small'
                    label={withReplacement(item?.value)}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  ) : (
    <></>
  );
};

export default function ApplicationsGridItem(props: any) {
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
    updated,
    isPwa = false,
    children = undefined
  } = props;

  const lastRating = useLastRatingDateTime({ created, updated });

  var areFiltersActive = useAreFiltersActive();

  const classes = useStyles({ isPwa: isPwa && areFiltersActive });
  const changeRoute = useChangeRoute();
  const content = !isEmpty(appleStore?.description) ? appleStore.description : androidStore?.description;

  const [, setDialogState] = useDialogState(title);

  const onClick = React.useCallback(() => {
    isPwa ? setDialogState({ open: true, app: props, from: 'pwa' }) : changeRoute(publicUrl('/ViewApp'), { app: props, from: 'ApplicationGrid' });
    // eslint-disable-next-line
  }, [isPwa, JSON.stringify(props), changeRoute, setDialogState]);

  return children ? (
    <Card className={classes.root}>
      <CardContent>{children}</CardContent>
    </Card>
  ) : (
    <Card onClick={onClick} className={classes.root} elevation={0}>
      <CardContent sx={{ p: 2, pb: 1.5, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        {/* Header: app icon + name/company (full names, wrapped up to 2 lines) */}
        <Grid container spacing={1.5} wrap='nowrap' alignItems='flex-start'>
          <Grid item>
            <img className={classes.icon} src={icon} alt={`${name || 'app'} icon`} />
          </Grid>
          <Grid item zeroMinWidth xs>
            <Typography variant='h5' className={classes.clamp2} title={name}>
              {name || 'Unknown Name'}
            </Typography>
            <Typography color='textSecondary' variant='body2' className={classes.clamp2} title={company}>
              {company}
            </Typography>
          </Grid>
        </Grid>

        {/* Platforms + cost */}
        <Box sx={{ mt: 1.5 }}>
          <PlatformButtons platforms={platforms} androidLink={androidLink} iosLink={iosLink} webLink={webLink} />
          <Typography display='block' color='textSecondary' variant='caption' className={classes.clamp2} sx={{ mt: 0.5 }}>
            {costs.length === 0 ? 'Unknown Cost' : costs.join(' | ')}
          </Typography>
        </Box>

        {/* Store description (clamped); footer follows the content directly so
            any slack from short descriptions falls at the card's bottom edge. */}
        <Box sx={{ mt: 1, flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <div
            className={classes.description}
            dangerouslySetInnerHTML={{ __html: lineClamp(stripContent(content), isPwa && areFiltersActive ? 4 : 5) }}
          />
        </Box>

        {/* Footer */}
        <Box sx={{ pt: 1 }}>
          <Typography noWrap display='block' align='right' color='textSecondary' variant='caption'>
            Last updated: {lastRating}
          </Typography>
          {isPwa && areFiltersActive && (
            <Box sx={{ pt: 0.5 }}>
              <FilterMatchCount {...props} />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
