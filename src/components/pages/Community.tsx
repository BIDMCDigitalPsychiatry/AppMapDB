import { Container, Grid, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
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
      <Grid container justifyContent='center' style={{ marginTop: 24 }} spacing={3}>
        <BlogLayout />
      </Grid>
    </Container>
  );
}
 
