import * as React from 'react';
import { Box, Card, CardActionArea, CardActions, CardContent, Container, createStyles, Grid, makeStyles, Typography } from '@material-ui/core';
import { useFullScreen } from '../../../hooks';
import { publicUrl } from '../../../helpers';
import { useHandleChangeRoute } from '../../layout/hooks';
import ArrowButton from '../../general/ArrowButton';
import useComponentSize from '@rehooks/component-size';

const articleFile = require('../../../content/Articles/Articles.json');

const useStyles = makeStyles(({ palette }) =>
  createStyles({
    primaryHeaderText: {
      fontWeight: 900,
      color: palette.primary.dark,
      fontSize: 30
    },
    primaryText: {
      fontWeight: 700,
      color: palette.primary.dark
    },
    primaryLightText: {
      fontWeight: 600,
      color: palette.primary.light
    }
  })
);

export const ContentBox = ({ p = 2, children }) => {
  const fullScreen = useFullScreen();
  return (
    <Box pl={fullScreen ? 1 : p} pr={fullScreen ? 1 : p} pt={fullScreen ? 2 : 4}>
      {children}
    </Box>
  );
};

const PaperWithHeight = ({ maxHeight = undefined, index, date, title, subTitle, handleChangeRoute, handleSize }) => {
  const ref = React.useRef();
  const { height } = useComponentSize(ref);
  const classes = useStyles();

  React.useEffect(() => {
    if (height !== undefined && height > 0 && (maxHeight === undefined || height > maxHeight)) {
      handleSize({ height });
    }
  }, [maxHeight, height, handleSize]);

  const h = maxHeight !== undefined && maxHeight > height ? maxHeight : undefined;

  const [internalHeight, setInternalHeight] = React.useState();

  React.useEffect(() => {
    if (h !== undefined) {
      setInternalHeight(h);
    }
  }, [h, setInternalHeight]);

  const style = internalHeight === undefined ? { width: 300, cursor: 'pointer' } : { width: 300, height: internalHeight, cursor: 'pointer' };

  return (
    <Card ref={ref} onClick={handleChangeRoute(publicUrl('/Article'), { page: index + 1 })}>
      <CardActionArea style={style}>
        <CardContent>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Typography noWrap variant='caption' className={classes.primaryText}>
                {date}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography noWrap className={classes.primaryLightText}>
                {title}
              </Typography>
            </Grid>
            <Grid item xs>
              <Typography variant='caption'>
                {subTitle}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          <ArrowButton label='View more' onClick={handleChangeRoute(publicUrl('/Article'), { page: index + 1 })} />
        </CardActions>
      </CardActionArea>
    </Card>
  );
};

export default function NewsV2() {
  const { articles } = articleFile;

  const handleChangeRoute = useHandleChangeRoute();
  const [maxHeight, setMaxHeight] = React.useState(0);

  const handleSize = React.useCallback(
    ({ height }) => {
      if (height > maxHeight) {
        setMaxHeight(height);
      }
    },
    [maxHeight, setMaxHeight]
  );

  const classes = useStyles();

  return (
    <section>
      <Container maxWidth='xl' style={{ padding: 24}}>
        <Typography variant='h5' className={classes.primaryHeaderText}>
          News
        </Typography>
        <Typography variant='body2'>Learn more about how our database is being used around the world.</Typography>
        <Grid container justify='center' style={{ marginTop: 24 }} spacing={3}>
          {articles.map((props, index) => (
            <Grid item>
              <PaperWithHeight {...props} index={index} handleChangeRoute={handleChangeRoute} handleSize={handleSize} maxHeight={maxHeight} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </section>
  );
}
