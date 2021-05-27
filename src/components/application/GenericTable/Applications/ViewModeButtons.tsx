import React from 'react';
import * as Icons from '@material-ui/icons';
import { useViewMode } from '../../../layout/store';
import { makeStyles, createStyles, Grid, Button } from '@material-ui/core';

const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    primaryButtonDisabled: {
      paddingLeft: 8,
      paddingRight: 8,
      borderRadius: 7,
      cursor: 'auto',
      color: palette.common.white,
      background: palette.primary.dark,
      '&:hover': {
        background: palette.primary.dark
      }
    },
    primaryButton: {
      paddingLeft: 8,
      paddingRight: 8,
      borderRadius: 7,
      color: palette.common.white,
      background: palette.primary.main,
      '&:hover': {
        background: palette.primary.dark
      }
    }
  })
);

export default function ViewModeButtons({ onExport = undefined }) {
  const classes = useStyles();
  const [viewMode, setViewMode] = useViewMode() as any;
  const handleClick = React.useCallback(mode => () => setViewMode(mode), [setViewMode]);
  const handleExport = React.useCallback(isTableData => () => onExport && onExport(isTableData), [onExport]);

  return (
    <Grid container spacing={1}>
      {onExport && (
        <>
          <Grid item>
            <Button size='small' className={classes.primaryButton} onClick={handleExport(false)}>
              <Icons.GetApp style={{ marginRight: 4 }} />
              Export Database
            </Button>
          </Grid>
          <Grid item>
            <Button size='small' className={classes.primaryButton} onClick={handleExport(true)}>
              <Icons.GetApp style={{ marginRight: 4 }} />
              Export Table Data
            </Button>
          </Grid>
        </>
      )}
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
