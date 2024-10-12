import React from 'react';
import { Box, Container, Divider, Grid, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import PencilAltIcon from '../../icons/PencilAlt';
import { useChangeRoute, useHandleChangeRoute } from '../../layout/hooks';
import { useRouteState } from '../../layout/store';
import * as Icons from '@mui/icons-material';
import useValues from './useValues';
import { useIsAdmin } from '../../../hooks';
import CommunityToolbar from '../Community/CommunityToolbar';
import { Card, CardContent, CardMedia } from '@mui/material';
import { getDayTimeFromTimestamp, isEmpty, publicUrl } from '../../../helpers';
import { getObjectUrl } from '../../../aws-exports';
import { useLastRatingDateTime } from '../../application/GenericTable/ApplicationsGrid/useLastRatingDateTime';

const height = 400;
const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      flex: '1',
      textAlign: 'center',
      height,
      width: height,
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
      marginTop: 8,
      overflow: 'hidden',
      color: theme.palette.text.secondary
    },
    deleteButton: {
      color: theme.palette.error.main,
      borderColor: theme.palette.error.main,
      '&:hover': {
        borderColor: theme.palette.error.main
      }
    }
  })
);

const TeamMemberView = () => {
  const classes = useStyles();
  const isAdmin = useIsAdmin();
  const changeRoute = useChangeRoute();

  const [routeState] = useRouteState();
  const { _id } = routeState;
  const { values = {}, handleDelete } = useValues({ type: 'view', trigger: true, values: { _id } });
  const { cover, title, subTitle, shortDescription, created, updated } = values;

  const handleBack = React.useCallback(() => {
    changeRoute(publicUrl('/Community'), prev => ({ ...prev, subRoute: 'team' }));
  }, [changeRoute]);

  const handleEdit = React.useCallback(() => {
    changeRoute(publicUrl('/Community'), prev => ({ ...prev, subRoute: 'editTeamMember', values }));
    // eslint-disable-next-line
  }, [changeRoute, JSON.stringify(values)]);

  const handleChangeRoute = useHandleChangeRoute();

  const lastUpdated = useLastRatingDateTime({ created, updated });

  return !values ? null : (
    <>
      <Container maxWidth='lg'>
        <CommunityToolbar
          title='Team Member Details'
          subtitle='View member'
          showGreeting={false}
          buttons={[
            {
              label: 'Back',
              startIcon: <Icons.ArrowBack fontSize='small' />,
              onClick: handleBack
            },
            isAdmin &&
              values?.deleted && {
                label: 'Restore member',
                startIcon: <Icons.RestoreFromTrash fontSize='small' />,
                onClick: () => {
                  handleDelete({ deleted: false, onSuccess: handleBack });
                }
              },
            isAdmin &&
              !values?.deleted && {
                label: 'Archive member',
                startIcon: <Icons.Delete fontSize='small' />,
                onClick: () => {
                  handleDelete({ onSuccess: handleBack });
                },
                className: classes.deleteButton
              },
            isAdmin && {
              label: 'Edit member',
              startIcon: <PencilAltIcon fontSize='small' />,
              onClick: handleEdit
            }
          ].filter(b => b)}
        />
        <Divider />

        <Box py={3}>
          <Grid container spacing={2}>
            <Grid item>
              <Card
                onClick={handleChangeRoute(publicUrl('/Community'), prev => ({ ...prev, subRoute: 'viewTeamMember', _id }))}
                className={classes.root}
                raised={true}
                elevation={8}
              >
                <CardMedia
                  className={classes.media}
                  image={isEmpty(cover) ? '/images/avatars/empty-profile.png' : getObjectUrl(cover)}
                  component='img'
                  height='100%'
                  width='100%'
                  alt='cover image'
                />
              </Card>
            </Grid>
            <Grid item style={{ minWidth: 500 }} xs>
              <CardContent className={classes.cardContent}>
                <Grid container style={{ height: height - 320 }}>
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
                  <Typography>{shortDescription}</Typography>
                  <Grid container style={{ marginTop: 8 }}>
                    <Grid item xs={12}>
                      <Typography noWrap display='block' align='right' color='textSecondary' variant='caption'>
                        Last Updated: {lastUpdated}
                      </Typography>
                    </Grid>
                  </Grid>
                </div>
              </CardContent>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default TeamMemberView;
