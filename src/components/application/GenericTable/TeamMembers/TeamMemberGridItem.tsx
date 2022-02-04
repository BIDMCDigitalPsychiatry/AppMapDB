import * as React from 'react';
import { Card, CardContent, CardMedia, createStyles, Divider, Grid, makeStyles, Typography } from '@material-ui/core';
import { getDayTimeFromTimestamp, isEmpty, lineClamp, publicUrl, stripContent } from '../../../../helpers';
import { useChangeRoute } from '../../../layout/hooks';
import { getObjectUrl } from '../../../../aws-exports';
import * as Icons from '@material-ui/icons';
import DialogButton from '../../GenericDialog/DialogButton';
import * as SortKeyDialog from '../../GenericDialog/SortKey';

const height = 400;
const useStyles = makeStyles(theme =>
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
    rootDisabled: {
      flex: '1',
      textAlign: 'center',
      height,
      borderRadius: 10
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
      color: theme.palette.text.secondary
    }
  })
);

export const TeamMemberGridItemSortKey = props => <TeamMemberGridItem {...props} showSortKey={true} />;

export default function TeamMemberGridItem({
  _id,
  sortKey,
  cover,
  title,
  subTitle,
  shortDescription,
  created,
  updated,
  children = undefined,
  showSortKey = undefined
}) {
  const [state, setState] = React.useState({
    raised: false
  });

  const classes = useStyles();
  const changeRoute = useChangeRoute();

  const handleClick = () => changeRoute(publicUrl('/Community'), prev => ({ ...prev, subRoute: 'viewTeamMember', _id }));

  return children ? (
    <Card className={showSortKey ? classes.rootDisabled : classes.root}>
      <CardContent>{children}</CardContent>
    </Card>
  ) : (
    <Card
      onClick={showSortKey ? undefined : handleClick}
      className={showSortKey ? classes.rootDisabled : classes.root}
      onMouseOver={() => setState({ raised: true })}
      onMouseOut={() => setState({ raised: false })}
      raised={!showSortKey && state.raised}
      elevation={!showSortKey && state.raised ? 8 : 4}
    >
      <CardMedia
        className={classes.media}
        image={isEmpty(cover) ? '/images/avatars/empty-profile.png' : getObjectUrl(cover)}
        component='img'
        height={height - 180}
        width='100%'
        alt='cover image'
      />
      <CardContent className={classes.cardContent}>
        <Grid container style={{ height: height - 340 }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12}>
                <Typography variant='h5' noWrap>
                  {title || 'Unknown Name'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography color='textSecondary' noWrap>
                  {subTitle}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Divider />
        <div className={classes.wrapper}>
          {showSortKey ? (
            <>
              <Grid item xs={12}>
                <Grid container justify='center' alignItems='center' spacing={0}>
                  <Grid item xs={12}>
                    <Typography color='textSecondary' align='center' variant='caption' noWrap>
                      Sort Key
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography color='inherit' align='center' variant='h5' noWrap>
                      {isEmpty(sortKey) ? 0 : sortKey}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <DialogButton
                      Module={SortKeyDialog}
                      label='Edit Sort Key'
                      size='large'
                      mount={false}
                      type='Edit'
                      initialValues={{ _id }}
                      variant='extended'
                      Icon={Icons.Edit}
                    >
                      Edit Sort Key
                    </DialogButton>
                  </Grid>
                </Grid>
              </Grid>
            </>
          ) : (
            <>
              <div style={{ height: 90 }} dangerouslySetInnerHTML={{ __html: lineClamp(stripContent(shortDescription), 3) }} />
              <Grid container style={{ marginTop: 0 }}>
                <Grid item xs={12}>
                  <Typography noWrap display='block' align='right' color='textSecondary' variant='caption'>
                    Last Updated: {updated ? getDayTimeFromTimestamp(updated) : created ? getDayTimeFromTimestamp(created) : ''}
                  </Typography>
                </Grid>
              </Grid>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
