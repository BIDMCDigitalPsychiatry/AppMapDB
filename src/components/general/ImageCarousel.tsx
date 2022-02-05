import * as React from 'react';
import { createStyles, Grid, IconButton, Link, makeStyles, Paper, Typography } from '@material-ui/core';
import Carousel from 'react-elastic-carousel';
import * as Icons from '@material-ui/icons';
import { grey } from '@material-ui/core/colors';
import useWidth from '../layout/ViewPort/hooks/useWidth';

const Arrow = ({ type, onClick }) => {
  const Icon = type === 'PREV' ? Icons.NavigateBefore : Icons.NavigateNext;
  return (
    <Grid container style={{ maxWidth: 64 }} spacing={0} justify='center' direction='column'>
      <Grid item>
        <IconButton onClick={onClick}>
          <Icon style={{ color: '#38B6FF' }} fontSize='large' />
        </IconButton>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    paper: {
      background: grey[50],
      margin: 8,
      padding: 4,
      paddingBottom: 0,
      '&:hover': {
        background: palette.primary.light
      }
    },
    link: {
      outline: 'none'
    }
  })
);

export default function ImageCarousel({ images = [] }) {
  const width = useWidth();
  var imageWidth = Math.max(225, Math.min(width * 0.2, 225));

  if (width < 400) {
    imageWidth = width * 0.4;
  }

  const itemsToShow = Math.floor((width * 0.7) / imageWidth);

  const classes = useStyles();
  return (images?.length ?? []) <= 0 ? (
    <Typography color='textSecondary' align='center'>
      No images available
    </Typography>
  ) : (
    <Carousel focusOnSelect={false} renderPagination={() => <></>} renderArrow={Arrow} itemsToShow={itemsToShow} isRTL={false}>
      {images.map((ss, i) => (
        <Link key={i} href={ss} underline='always' target='_blank' variant='body1' color='primary' className={classes.link}>
          <Paper elevation={4} className={classes.paper}>
            <img style={{ width: imageWidth, borderRadius: 3 }} src={ss} alt={`slide-${i}`} />
          </Paper>
        </Link>
      ))}
    </Carousel>
  );
}
