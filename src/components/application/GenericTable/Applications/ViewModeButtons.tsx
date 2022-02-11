import React from 'react';
import * as Icons from '@mui/icons-material';
import { useViewMode } from '../../../layout/store';
import { Grid, Button } from '@mui/material';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

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

export default function ViewModeButtons({ onExport = undefined, collapsed = false }) {
  const classes = useStyles();
  const [viewMode, setViewMode] = useViewMode() as any;
  const handleClick = React.useCallback(mode => () => setViewMode(mode), [setViewMode]);
  const handleExport = React.useCallback(isTableData => () => onExport && onExport(isTableData), [onExport]);

  const style = { marginRight: collapsed ? 0 : 4 };
  const buttonStyle = { height: 34, minWidth: collapsed ? 24 : undefined };

  return (
    <Grid container spacing={1}>
      {onExport && (
        <>
          <Grid item>
            <Button style={buttonStyle} size='small' className={classes.primaryButton} onClick={handleExport(false)}>
              <Icons.GetApp style={style} />
              {!collapsed && 'Export Database'}
            </Button>
          </Grid>
          <Grid item>
            <Button style={buttonStyle} size='small' className={classes.primaryButton} onClick={handleExport(true)}>
              <Icons.GetApp style={style} />

              {!collapsed && 'Export Table Data'}
            </Button>
          </Grid>
        </>
      )}
      <Grid item>
        <Button
          style={buttonStyle}
          disableRipple={viewMode === 'grid'}
          size='small'
          className={viewMode === 'grid' ? classes.primaryButtonDisabled : classes.primaryButton}
          onClick={handleClick('grid')}
        >
          <Icons.Apps style={style} />
          {!collapsed && 'Grid View'}
        </Button>
      </Grid>
      <Grid item>
        <Button
          style={buttonStyle}
          disableRipple={viewMode === 'table'}
          size='small'
          className={viewMode === 'table' ? classes.primaryButtonDisabled : classes.primaryButton}
          onClick={handleClick('table')}
        >
          <Icons.List style={style} />
          {!collapsed && 'Table View'}
        </Button>
      </Grid>
    </Grid>
  );
}
