import * as React from 'react';
import { makeStyles, createStyles, Chip } from '@material-ui/core';
import Select from './Select';
import CancelIcon from '@material-ui/icons/Cancel';

const itemHeight = 48;
const itemPaddingTop = 8;

const useStyles = makeStyles(() =>
  createStyles({
    chips: {
      display: 'flex',
      flexWrap: 'wrap'
    },
    chip: {
      margin: 2
    }
  })
);

interface ChipData {
  value: number;
  label: string;
}

export default function MultiChipSelect({
  value,
  onChange = undefined,
  disabled = false,
  size = 'small' as 'small',
  ...other
}) {
  const classes = useStyles({});

  const value_s = JSON.stringify(value);
  const handleDelete = React.useCallback(
    (chipToDelete: ChipData) => (event: React.MouseEvent) => {
      event.stopPropagation();
      (event.target as any).value = JSON.parse(value_s).filter(chip => chip.value !== chipToDelete.value);
      onChange && onChange(event);
    },
    [value_s, onChange]
  );

  return (
    <Select
      multiple
      disabled={disabled}
      value={value}
      onChange={onChange}
      renderValue={selected => (
        <div className={classes.chips}>
          {(selected as any[]).map(item => (
            <Chip
              key={item.value}
              label={item.label}
              size={size}
              className={classes.chip}
              deleteIcon={<CancelIcon onMouseDown={handleDelete(item)} />} // Hack to fix Chip on click that broke
              onDelete={disabled ? undefined : () => undefined} // Hack to fix Chip on click that broke.  onDelete must be set for the icon to show up, but the onClick doesn't fire in a select
            />
          ))}
        </div>
      )}
      MenuProps={{
        PaperProps: {
          style: {
            maxHeight: itemHeight * 4.5 + itemPaddingTop,
            width: 250
          }
        }
      }}
      {...other}
    />
  );
}
