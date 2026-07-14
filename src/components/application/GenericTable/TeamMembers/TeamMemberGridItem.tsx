import * as React from 'react';
import { Card, CardContent, CardMedia, Divider, Grid, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { getDayTimeFromTimestamp, isEmpty, publicUrl } from '../../../../helpers';
import { useChangeRoute } from '../../../layout/hooks';
import { getObjectUrl } from '../../../../aws-exports';
import * as Icons from '@mui/icons-material';
import DialogButton from '../../GenericDialog/DialogButton';
import * as SortKeyDialog from '../../GenericDialog/SortKey';
import { useLastRatingDateTime } from '../ApplicationsGrid/useLastRatingDateTime';

const height = 416; // tall: team photos are portraits
const mediaHeight = 300;
const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      flex: '1',
      textAlign: 'center',
      height,
      display: 'flex',
      flexDirection: 'column',
      transition: 'box-shadow 0.15s ease-in-out, transform 0.15s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 24px rgba(16, 24, 40, 0.12)'
      },
      cursor: 'pointer'
    },
    rootDisabled: {
      flex: '1',
      textAlign: 'center',
      height
    },
    cardContent: {
      paddingTop: 8,
      paddingBottom: 0
    },
    media: {
      borderBottom: `1px solid ${theme.palette.divider ?? '#E5EAF0'}`,
      objectFit: 'cover',
      objectPosition: 'center top',
      backgroundColor: theme.palette.grey[100]
    },
    wrapper: {
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
  const classes = useStyles();
  const changeRoute = useChangeRoute();

  const handleClick = () => changeRoute(publicUrl('/Community'), prev => ({ ...prev, subRoute: 'viewTeamMember', _id }));
  const lastUpdated = useLastRatingDateTime({ created, updated });

  return children ? (
    <Card className={showSortKey ? classes.rootDisabled : classes.root}>
      <CardContent>{children}</CardContent>
    </Card>
  ) : (
    <Card
      onClick={showSortKey ? undefined : handleClick}
      className={showSortKey ? classes.rootDisabled : classes.root}
      elevation={0}
    >
      <CardMedia
        className={classes.media}
        image={isEmpty(cover) ? '/images/avatars/empty-profile.png' : getObjectUrl(cover)}
        component='img'
        height={mediaHeight}
        width='100%'
        alt='cover image'
      />
      <CardContent className={classes.cardContent} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, paddingBottom: 8 }}>
        <Typography variant='h5' noWrap>
          {title || 'Unknown Name'}
        </Typography>
        <Typography color='textSecondary' noWrap>
          {subTitle}
        </Typography>
        <div className={classes.wrapper} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          {showSortKey ? (
            <>
              <Grid item xs={12}>
                <Grid container justifyContent='center' alignItems='center' spacing={0}>
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
              <div style={{ flex: 1 }} />
              <Typography noWrap display='block' align='right' color='textSecondary' variant='caption'>
                Last Updated: {lastUpdated}
              </Typography>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
