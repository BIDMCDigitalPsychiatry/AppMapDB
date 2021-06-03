import { Container, createStyles, Grid, makeStyles, Typography } from '@material-ui/core';
import BlogLayout from '../application/Blog/BlogLayout';

const useStyles = makeStyles(({ palette }) =>
  createStyles({
    primaryHeaderText: {
      fontWeight: 900,
      color: palette.primary.dark,
      fontSize: 30
    }
  })
);

export default function Community() {
  const classes = useStyles();

  return (
    <Container maxWidth='xl' style={{ padding: 24 }}>
      <Typography variant='h5' className={classes.primaryHeaderText}>
        Community
      </Typography>
      <Typography variant='body2'>Learn more about how our database is being used around the world.</Typography>
      <Grid container justify='center' style={{ marginTop: 24 }} spacing={3}>
        <BlogLayout />
      </Grid>
    </Container>
  );
}
 
