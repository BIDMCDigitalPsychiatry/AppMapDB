import React from 'react';
import { Card, CardContent, Typography, makeStyles, Grid, Box, Avatar, createStyles, Divider } from '@material-ui/core';
import Rating from '../../../../database/models/Rating';
import * as Icons from '@material-ui/icons';
import { timeAgo } from '../../../../helpers';
import RatingReadOnly from '../../GenericTable/Applications/RatingReadOnly';

const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    avatar: {
      color: palette.common.white,
      background: palette.primary.main,
      height: 30,
      width: 30
    }
  })
);

const RatingCard = ({ rating, name, review, time }: Rating = {} as any) => {
  const classes = useStyles({});
  return (
    <Card>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item>
            <Avatar className={classes.avatar}>
              <Icons.Person />
            </Avatar>
          </Grid>
          <Grid item xs>
            <Grid container alignItems='center'>
              <Grid item xs={12}>
                <Grid container alignItems='center' spacing={1}>
                  <RatingReadOnly size='small' precision={0.25} value={Number(rating)} />
                  <Typography variant='caption' color='textSecondary'>
                    {`(${rating})`}
                  </Typography>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Typography variant='caption' color='textSecondary'>
                  {`Reviewed by ${name} ${time ? `| ${timeAgo(time)}` : ''}`}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Box mt={1}>
          <Divider />
          <Box ml={1} mr={1}>
            <Typography variant='caption' color='textSecondary'>
              {review}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RatingCard;
