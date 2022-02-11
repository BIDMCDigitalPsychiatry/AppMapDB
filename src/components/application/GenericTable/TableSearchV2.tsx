import * as React from 'react';
import { InputAdornment, IconButton } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import * as Icons from '@mui/icons-material';
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

export default function TableSearchV2({ value = '', label = undefined, placeholder = undefined, onChange }) {
  const classes = useStyles();

  const handleClear = React.useCallback(e => onChange({ target: { value: '' } }), [onChange]);

  return (
    <Text
      margin='dense'
      size='small'
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      label={label}
      InputProps={{
        style: { background: 'white' },
        startAdornment: (
          <InputAdornment position='start'>
            <Icons.Search className={classes.searchIcon} />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position='end'>
            <IconButton className={classes.endIcon} onClick={handleClear} size="large">
              <Icons.Close />{' '}
            </IconButton>{' '}
          </InputAdornment>
        )
      }}
    />
  );
}
