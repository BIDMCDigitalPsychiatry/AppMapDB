import * as React from 'react';
import { Card, CardContent, CardMedia, Grid, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { isEmpty, lineClamp, publicUrl, stripContent } from '../../../../helpers';
import { useHandleChangeRoute } from '../../../layout/hooks';
import { getAppCompany, getAppIcon, getAppName } from '../Applications/selectors';
import PlatformButtons from './PlatformButtons';
import DialogButton from '../../GenericDialog/DialogButton';
import { useLastRatingDateTime } from './useLastRatingDateTime';

const height = 520;
const useStyles = makeStyles((theme: any) =>
  createStyles({
    root: {
      flex: '1',
      textAlign: 'center',
      height,
      borderRadius: 10,
      transition: 'transform 0.15s ease-in-out',
      '&:hover': {
        transform: 'scale3d(1.025, 1.025, 1)'
      },
      cursor: 'pointer'
    },
    cardContent: {
      paddingTop: 8,
      paddingBottom: 0
    },
    media: {
      borderBottom: `1px solid ${theme.palette.grey[400]}`
    },
    wrapper: {
      height: height - 200,
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
    }
  })
);

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
    children = undefined
  } = props;

  const lastRating = useLastRatingDateTime({ created, updated });

  const [state, setState] = React.useState({
    raised: false
  });

  const classes = useStyles();
  const handleChangeRoute = useHandleChangeRoute();

  const content = !isEmpty(appleStore?.description) ? appleStore.description : androidStore?.description;

  return children ? (
    <Card className={classes.root}>
      <CardContent>{children}</CardContent>
    </Card>
  ) : (
    <Card
      onClick={handleChangeRoute(publicUrl('/ViewApp'), { app: props, from: 'ApplicationGrid' })}
      className={classes.root}
      onMouseOver={() => setState({ raised: true })}
      onMouseOut={() => setState({ raised: false })}
      raised={state.raised}
      elevation={state.raised ? 8 : 4}
    >
      <CardMedia className={classes.media} image={icon} component='img' height='200' width='100%' alt='cover image' />
      <CardContent className={classes.cardContent}>
        <Grid container>
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
          <div dangerouslySetInnerHTML={{ __html: lineClamp(stripContent(content), 7) }} />
          <Grid container style={{ marginTop: 4 }}>
            <Grid item xs={12}>
              <Typography noWrap display='block' align='right' color='textSecondary' variant='caption'>
                Last MINDapps evaluation: {lastRating}
              </Typography>
            </Grid>
          </Grid>
        </div>
      </CardContent>
    </Card>
  );
}
