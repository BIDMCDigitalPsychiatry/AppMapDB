import React from 'react';
import { Grid, Typography, makeStyles, Theme, createStyles, Button } from '@material-ui/core';
import { onlyUnique, sortAscendingToLower } from '../../../../helpers';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    secondaryButton: {
      color: theme.palette.common.white,
      background: theme.palette.primary.light,
      '&:hover': {
        background: theme.palette.primary.main
      }
    }
  })
);

export default function PlatformButtons({ platforms = [], androidLink, iosLink, webLink }) {

  const classes = useStyles({});

  const handleLink = React.useCallback(
    platform => event => {
      const url = platform === 'Android' ? androidLink : platform === 'iOS' ? iosLink : webLink;
      var win = window.open(url, '_blank');
      win.focus();
    },
    [androidLink, iosLink, webLink]
  );

  return (
    <Typography noWrap component='span'>
      <Grid container spacing={1}>
        {platforms
          .sort(sortAscendingToLower)
          .filter(onlyUnique)
          .map((p, i) => (
            <Grid item key={`platform-${p}-${i}`}>
              <Button size='small' className={classes.secondaryButton} onClick={handleLink(p)}>
                {p}
              </Button>
            </Grid>
          ))}
      </Grid>
    </Typography>
  );
}
