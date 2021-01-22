import React from 'react';
import * as Icons from '@material-ui/icons';
import { useViewMode } from '../../../layout/store';
import { makeStyles, createStyles, Grid, Button } from '@material-ui/core';

const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    secondaryButton: {
      color: palette.common.white,
      background: palette.primary.light,
      '&:hover': {
        background: palette.primary.main
      }
    },
    primaryButtonDisabled: {
      borderRadius: 7,
      cursor: 'auto',
      color: palette.common.white,
      background: palette.primary.dark,
      '&:hover': {
        background: palette.primary.dark
      }
    },
    primaryButton: {
      borderRadius: 7,
      color: palette.common.white,
      background: palette.primary.main,
      '&:hover': {
        background: palette.primary.dark
      }
    }
  })
);

export default function ViewModeButtons() {
  const classes = useStyles();
  const [viewMode, setViewMode] = useViewMode() as any;
  const handleClick = React.useCallback(mode => () => setViewMode(mode), [setViewMode]);  
  
  return (
    <Grid container spacing={1}>
      <Grid item>
        <Button
          disableRipple={viewMode === 'list'}
          size='small'
          className={viewMode === 'list' ? classes.primaryButtonDisabled : classes.primaryButton}
          onClick={handleClick('list')}
        >
          <Icons.List style={{ marginRight: 4 }} />
          List View
        </Button>
      </Grid>
      <Grid item>
        <Button
          disableRipple={viewMode === 'table'}
          size='small'
          className={viewMode === 'table' ? classes.primaryButtonDisabled : classes.primaryButton}
          onClick={handleClick('table')}
        >
          <Icons.TableChart style={{ marginRight: 4 }} />
          Table View
        </Button>
      </Grid>
    </Grid>
  );
}
