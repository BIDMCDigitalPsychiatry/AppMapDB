import * as React from 'react';
import { InputAdornment, IconButton } from '@mui/material';
import { makeStyles } from '../../../styles/jss';
import { createStyles } from '../../../styles/jss';
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

export default function TableSearchV2({ value = '', label = undefined, placeholder = undefined, onChange, debounceMs = 250 }) {
  const classes = useStyles();

  // The input is locally controlled so typing paints immediately; the
  // (expensive) onChange dispatch — Redux update, re-filter, fuzzy search —
  // is debounced until typing pauses. Results are unchanged, only latency.
  const [text, setText] = React.useState(value);
  const pending = React.useRef<any>();
  const lastSent = React.useRef(value);

  React.useEffect(() => {
    // Sync from an external change (e.g. 'Reset all filters'), but ignore
    // the echo of our own debounced dispatch so it can't clobber newer keystrokes.
    if (value !== lastSent.current) {
      lastSent.current = value;
      setText(value);
    }
  }, [value]);

  React.useEffect(() => () => clearTimeout(pending.current), []);

  const handleChange = React.useCallback(
    (e: any) => {
      const v = e?.target?.value ?? '';
      setText(v);
      clearTimeout(pending.current);
      pending.current = setTimeout(() => {
        lastSent.current = v;
        onChange({ target: { value: v } });
      }, debounceMs);
    },
    [onChange, debounceMs]
  );

  const handleClear = React.useCallback(
    e => {
      clearTimeout(pending.current);
      setText('');
      lastSent.current = '';
      onChange({ target: { value: '' } });
    },
    [onChange]
  );

  return (
    <Text
      margin='dense'
      size='small'
      placeholder={placeholder}
      value={text}
      onChange={handleChange}
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
