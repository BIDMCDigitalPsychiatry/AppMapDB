import * as React from 'react';
import { Box, Card, CardContent, CardMedia, Chip, Grid, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { isEmpty, lineClamp, publicUrl, stripContent } from '../../../../helpers';
import { useChangeRoute } from '../../../layout/hooks';
import { getAppCompany, getAppIcon, getAppName } from '../Applications/selectors';
import PlatformButtons from './PlatformButtons';
import DialogButton from '../../GenericDialog/DialogButton';
import { useLastRatingDateTime } from './useLastRatingDateTime';
import { useDialogState } from '../../GenericDialog/useDialogState';
import { title } from '../../GenericDialog/ViewApp';
import { red } from '@mui/material/colors';
import { withReplacement } from '../../../../database/models/Application';
import { categories } from '../../../../constants';

const height = 520;
const extraPwaHeight = 96;
const useStyles = makeStyles((theme: any) =>
  createStyles({
    root: ({ isPwa }: any) => ({
      flex: '1',
      textAlign: 'center',
      height: isPwa ? height + extraPwaHeight : height, // Add 20 for the filter match count section
      borderRadius: 10,
      transition: 'transform 0.15s ease-in-out',
      '&:hover': {
        transform: 'scale3d(1.025, 1.025, 1)'
      },
      cursor: 'pointer'
    }),
    media: {
      borderBottom: `1px solid ${theme.palette.grey[400]}`
    },
    wrapper: ({ isPwa }: any) => ({
      height: isPwa ? height + extraPwaHeight - 200 : height - 200,
      overflow: 'hidden',
      color: theme.palette.text.primary,
      fontFamily: theme.typography.fontFamily,
      '& h2': {
        fontSize: theme.typography.h2.fontSize,
        fontWeight: theme.typography.fontWeightBold,
        lineHeight: theme.typography.h2.lineHeight,
        marginBottom: theme.spacing(3)
      },
      '& h3': {
        fontSize: theme.typography.h3.fontSize,
        fontWeight: theme.typography.fontWeightBold,
        lineHeight: theme.typography.h3.lineHeight,
        marginBottom: theme.spacing(3)
      },
      '& p': {
        fontSize: theme.typography.body1.fontSize,
        lineHeight: theme.typography.body1.lineHeight,
        marginBottom: 8,
        marginTop: 8
      },
      '& li': {
        fontSize: theme.typography.body1.fontSize,
        lineHeight: theme.typography.body1.lineHeight,
        marginBottom: theme.spacing(1)
      }
    })
  })
);

export function PwaApplicationsGridItem(props) {
  return <ApplicationsGridItem {...props} isPwa={true} />;
}

const FilterMatchCount = props => {
  const filterMatches = props?.filterMatches ?? [];
  const matchCount = filterMatches?.length ?? 0;
  const matchText = `${matchCount} Match${matchCount === 1 ? '' : 'es'}:`;

  return matchCount > 0 ? (
    <Box sx={{ pb: 0.5 }}>
      <Grid container justifyContent='space-between' alignItems='center'>
        <Grid item xs>
          <Grid container justifyContent='flex-start' alignItems='center' spacing={0.1} sx={{ backgroundColor: 'primary.light' }}>
            <Grid item>
              <Box sx={{ fontSize: 14, height: 20, mr: 0.5, background: red[700], color: 'white', ml: 0.25, pl: 0.5, pr: 1 }}>{matchText}</Box>
            </Grid>
            {filterMatches.map((item, i) => {
              const category = categories[item.key];
              return (
                <Grid item key={item?.value}>
                  <Chip
                    key={`${item?.value}-${i}`}
                    style={{ background: category?.color ?? 'grey', color: 'white', marginRight: 0, fontSize: 12, height: 20 }}
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

  const [state, setState] = React.useState({
    raised: false
  });

  const classes = useStyles({ isPwa });
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
    <Card
      onClick={onClick}
      className={classes.root}
      onMouseOver={() => setState({ raised: true })}
      onMouseOut={() => setState({ raised: false })}
      raised={state.raised}
      elevation={state.raised ? 8 : 4}
    >
      <CardMedia className={classes.media} image={icon} component='img' height='200' width='100%' alt='cover image' />
      <CardContent
        sx={{
          p: 0,
          mt: 1,
          backgroundColor: isPwa ? 'primary.light' : undefined
        }}
      >
        <Grid container sx={{ px: 1, backgroundColor: 'white' }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12}>
                <Typography variant='h5' noWrap>
                  {name || 'Unknown Name'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography color='textSecondary' noWrap>
                  {company}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Grid container justifyContent='center' spacing={0}>
                  <Grid item>
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
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <div className={classes.wrapper}>
          <div
            style={{ paddingLeft: 8, paddingRight: 8, paddingBottom: 4, backgroundColor: 'white' }}
            dangerouslySetInnerHTML={{ __html: lineClamp(stripContent(content), isPwa ? 6 : 7) }}
          />
          <Grid container sx={{ backgroundColor: 'white' }}>
            <Grid item xs={12}>
              <Typography noWrap display='block' align='right' color='textSecondary' variant='caption'>
                Last MINDapps evaluation: {lastRating}
              </Typography>
            </Grid>
          </Grid>
          {isPwa && (
            <Box sx={{ pt: 0.5 }}>
              <FilterMatchCount {...props} />
            </Box>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
