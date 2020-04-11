import * as React from 'react';
import { Grid, Paper, Input, Tooltip } from '@material-ui/core';
import { FormControl, InputAdornment, IconButton, Typography } from '@material-ui/core';
import { useTable, useTableUpdate } from './store';
import { useWidth } from '../../layout/store';
import { Fab, makeStyles, createStyles, useTheme } from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import { evalFunc } from '../../../helpers';
import { GenericTableContainerProps } from './GenericTableContainer';
import { useFullScreen } from '../../../hooks';

export interface TableToolbarProps {
  name?: string;
  buttons?: any[] | ((props?: GenericTableContainerProps & any) => any[]);
  square?: boolean;
  title?: string;
  showicon?: boolean;
  viewportwidth?: any;
  inputplaceholder?: string;
  width?: number;
  search?: boolean;
  Icon?: any;
  buttonPosition?: string;
  classes?: any;
}

const useStyles = makeStyles(({ palette, spacing, typography, layout }: any) =>
  createStyles({
    root: {},
    paper: {
      color: palette.common.white,
      background: palette.primary.main
    },
    formControl: {
      marginBottom: 4,
      paddingRight: spacing(1),
      width: 308
    },
    searchIcon: {
      color: palette.primary.main
    },
    underline: {
      //color: palette.common.white,
      color: palette.primary.main,
      borderBottom: `2px solid ${palette.primary.main}`
    },
    title: {
      ...typography.h4,
      paddingLeft: spacing(0.5),
      color: palette.common.white,
      fontSize: typography.pxToRem(19),
      fontWeight: '300'
    },
    titleicon: {
      height: 32,
      width: 32,
      color: palette.common.white,
      marginTop: 3
    },
    grid: {
      overflow: 'hidden',
      paddingRight: spacing(1),
      paddingLeft: spacing(1),
      height: layout.tabletoolbarheight / 2
    },
    hidden: {
      display: 'none' as 'none'
    }
  })
);

function TableToolbar(props: TableToolbarProps) {
  const classes = useStyles({});
  const [searchOpen, setSearchOpen] = React.useState(false);
  const { layout } = useTheme();
  const { name, buttons = [], square, title, inputplaceholder, Icon, search, showicon = true, buttonPosition = 'top' } = props;

  const { searchtext = '' } = useTable(name);

  React.useEffect(() => {
    if (searchtext !== null && searchtext !== undefined && searchtext !== '') {
      handleOpenSearch();
    }
  }); // No dependencies on purpose

  const width = useWidth();

  const handleOpenSearch = React.useCallback(() => setSearchOpen(true), [setSearchOpen]);

  const inputRef = React.useRef(null);

  const tableUpdate = useTableUpdate();

  const updateTable = React.useCallback(
    value =>
      tableUpdate({
        id: name,
        searchtext: value
      }),
    [name, tableUpdate]
  );

  const handleClear = React.useCallback(
    event => {
      updateTable('');
      setSearchOpen(false);
    },
    [updateTable, setSearchOpen]
  );

  const handleKeyDown = React.useCallback(
    event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleClear(event);
      }
    },
    [handleClear]
  );

  React.useEffect(() => {
    const current = inputRef && inputRef.current;
    if (searchOpen) {
      if (current) {
        current.focus();
        current.addEventListener('keydown', handleKeyDown);
      }
    } else {
      current.removeEventListener('keydown', handleKeyDown);
    }
    return () => {
      if (current && searchOpen) {
        current.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [inputRef, searchOpen, handleKeyDown]);

  const handleChange = React.useCallback(
    event => {
      updateTable(event.target.value);
    },
    [updateTable]
  );
  const fullScreen = useFullScreen();

  const Search = (
    <FormControl className={classes.formControl}>
      <Input
        disableUnderline={false}
        classes={{ underline: classes.underline }}
        value={searchtext ? searchtext : ''}
        onChange={handleChange}
        placeholder={inputplaceholder}
        startAdornment={
          <InputAdornment position='start'>
            <Icons.Search className={classes.searchIcon} />
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position='end'>
            <IconButton className={classes.searchIcon} onClick={handleClear}>
              <Icons.Close />{' '}
            </IconButton>{' '}
          </InputAdornment>
        }
        inputRef={inputRef}
      />
    </FormControl>
  );

  const searchbutton =
    search !== false && search ? (
      <>
        <Tooltip
          placement='bottom'
          title={
            <Typography variant='h6' color='inherit'>
              Search
            </Typography>
          }
        >
          <Fab variant='extended' size='small' color='primary' onClick={handleOpenSearch}>
            <Icons.Search />
            {!fullScreen && <div style={{ marginLeft: 4, marginRight: 4 }}>Search</div>}
          </Fab>
        </Tooltip>
      </>
    ) : null;

  var Buttons = [searchbutton, ...evalFunc(buttons, props)].filter(b => b);

  const buttonspacing = 0; //Grid spacing of each button
  const buttonwidth = 42; //Width of each button
  const widths = {
    contentpadding: layout.contentpadding * 2, //Exterior padding
    headerpadding: 16, //Padding within the header
    iconwidth: 32, //Width of the title icon
    titlepadding: 8, //Padding between the icon and the title
    titleminwidth: 64, //Minimum width of the typography title - Don't display the title unless you can see more than 64 pixels
    calculatedbuttonswidth: Buttons.length * buttonwidth + buttonspacing * (Buttons.length > 0 ? Buttons.length - 1 : 0)
  };

  const calculatedfullwidth = Object.keys(widths)
    .map(k => widths[k])
    .reduce((t, a) => t + a, 0);
  const calculatedpartialwidth = calculatedfullwidth - widths.titlepadding - widths.titleminwidth;

  const tabletitlevisible = width >= calculatedfullwidth;
  const tableiconvisible = width >= calculatedpartialwidth;

  const IconComponent = Icon ?? Icons.List;

  const ButtonGroup = (
    <Grid item>
      <Grid container direction='row' justify='flex-end' alignItems='center' spacing={buttonspacing}>
        <Grid item>
          <div style={{ display: searchOpen ? '' : 'none' }}>{Search}</div>
          {!searchOpen && (
            <Grid container spacing={1}>
              {Buttons.map((b, i) => (
                <Grid key={i} item>
                  {evalFunc(b)}
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );

  return (
    <>
      {buttonPosition === 'top' && (
        <Paper elevation={0} square={square}>
          <Grid container spacing={0} justify='space-between' alignItems='center' className={classes.grid}>
            <Grid item xs zeroMinWidth>
              <Grid container justify='flex-start' alignItems='center'></Grid>
            </Grid>
            {ButtonGroup}
          </Grid>
        </Paper>
      )}
      <Paper className={classes.paper} square={square}>
        <Grid container spacing={0} justify='space-between' alignItems='center' className={classes.grid}>
          <Grid item xs zeroMinWidth>
            <Grid container justify='flex-start' alignItems='center'>
              {tableiconvisible && showicon === true && (
                <Grid item>
                  <Tooltip title={title}>
                    <IconComponent className={classes.titleicon} />
                  </Tooltip>
                </Grid>
              )}
              {tabletitlevisible && (
                <Grid item xs zeroMinWidth>
                  {title && (
                    <Typography variant='body2' noWrap className={classes.title}>
                      {title}
                    </Typography>
                  )}
                </Grid>
              )}
            </Grid>
          </Grid>
          {buttonPosition !== 'top' && ButtonGroup}
        </Grid>
      </Paper>
    </>
  );
}

export default TableToolbar;
