import * as React from 'react';
import { Grid, Typography, createStyles, makeStyles, Button } from '@material-ui/core';
import * as Icons from '@material-ui/icons';

const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    arrowRight: {
      color: palette.primary.light
    },
    primaryTextSmall: {
      fontWeight: 900,
      color: palette.primary.dark
    }
  })
);

export default function ArrowButton({ label, onClick = undefined }) {
  const classes = useStyles();
  return (
    <Button onClick={onClick}>
      <Grid container spacing={1}>
        <Grid item>
          <Typography className={classes.primaryTextSmall}>{label}</Typography>
        </Grid>
        <Grid item>
          <Icons.ArrowRightAlt className={classes.arrowRight} />
        </Grid>
      </Grid>
    </Button>
  );
}
