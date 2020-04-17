import * as React from 'react';
import { InputAdornment, IconButton } from '@material-ui/core';
import { useTable, useTableUpdate } from './store';
import { makeStyles, createStyles } from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import { GenericTableContainerProps } from './GenericTableContainer';
import Text from '../DialogField/Text';

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

const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    searchIcon: {
      color: palette.text.secondary
    },
    endIcon: {
      marginRight: -12,
      color: palette.text.secondary
    }
  })
);

export default function TableSearch({ name = 'Applications', label = 'Enter Text to Search' }) {
  const classes = useStyles();
  const { searchtext = '' } = useTable(name);
  const tableUpdate = useTableUpdate();
  const updateTable = React.useCallback(
    value =>
      tableUpdate({
        id: name,
        searchtext: value
      }),
    [name, tableUpdate]
  );
  const handleChange = React.useCallback(e => updateTable(e.target.value), [updateTable]);

  const handleClear = React.useCallback(e => updateTable(''), [updateTable]);

  return (
    <Text
      margin='dense'
      value={searchtext ? searchtext : ''}
      onChange={handleChange}
      label={label}
      InputProps={{
        startAdornment: (
          <InputAdornment position='start'>
            <Icons.Search className={classes.searchIcon} />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position='end'>
            <IconButton className={classes.endIcon} onClick={handleClear}>
              <Icons.Close />{' '}
            </IconButton>{' '}
          </InputAdornment>
        )
      }}
    />
  );
}
