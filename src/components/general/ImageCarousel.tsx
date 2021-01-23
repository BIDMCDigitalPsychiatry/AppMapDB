import * as React from 'react';
import { Grid, IconButton, Link, Paper, Typography } from '@material-ui/core';
import { useWidth } from '../layout/store';
import Carousel from 'react-elastic-carousel';
import * as Icons from '@material-ui/icons';

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

export default function ImageCarousel({ images = [] }) {
  const width = useWidth();
  var imageWidth = Math.max(225, Math.min(width * 0.2, 300)); // Minimum of 200, Max width of 300

  if (width < 400) {
    imageWidth = width * 0.4;
  }
  const itemsToShow = Math.floor((width * 0.7) / imageWidth);

  return (images?.length ?? []) <= 0 ? (
    <Typography color='textSecondary' align='center'>
      No images available
    </Typography>
  ) : (
    <Carousel renderPagination={() => <></>} renderArrow={Arrow} itemsToShow={itemsToShow} isRTL={false}>
      {images.map((ss, i) => (
        <Link href={ss} underline='always' target='_blank' variant='body1' color='primary'>
          <Paper>
            <img style={{ width: imageWidth }} src={ss} alt={`slide-${i}`} />
          </Paper>
        </Link>
      ))}
    </Carousel>
  );
}
