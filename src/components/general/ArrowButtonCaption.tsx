import * as React from 'react';
import { Grid, Typography, createStyles, makeStyles } from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import { useHandleLink } from '../../hooks';

const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    container: {
      cursor: 'pointer'
    },
    arrowRight: {
      color: palette.primary.light,
      fontSize: 19,
      marginTop: 1
    },
    primaryTextSmall: {
      fontWeight: 900
    }
  })
);

export default function ArrowButtonCaption({ size = 'small' as any, variant = 'caption' as any, label, link }) {
  const classes = useStyles();
  const handleClick = useHandleLink(link);
  return (
    <Grid container className={classes.container} spacing={1} onClick={handleClick}>
      <Grid item>
        <Typography variant={variant} className={classes.primaryTextSmall} color='textSecondary'>
          {label}
        </Typography>
      </Grid>
      <Grid item>
        <Icons.ArrowRightAlt className={classes.arrowRight} />
      </Grid>
    </Grid>
  );
}
