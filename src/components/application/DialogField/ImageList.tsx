import * as React from 'react';
import { createStyles, Grid, makeStyles, Typography } from '@material-ui/core';
import { isEmpty } from '../../../helpers';

const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    notSelected: {
      borderRadius: 15,
      width: '100%',
      border: '5px solid',
      borderColor: palette.common.white
    },
    selected: {
      borderRadius: 15,
      width: '100%',
      border: '5px solid',
      borderColor: palette.primary.light
    }
  })
);

const ImageList = ({ value = '', label = undefined, error = undefined, items = [], onChange = undefined }) => {
  const classes = useStyles({});
  const handleSelect = React.useCallback(
    value => () => {
      onChange && onChange({ target: { value } });
    },
    [onChange]
  );

  return (
    <Grid container justify='center' spacing={4} alignItems='center'>
      {!isEmpty(label) && (
        <Grid item xs={12}>
          <Typography variant='h6'>{label}</Typography>
        </Grid>
      )}
      {items.map(item => (
        <Grid item xs={12} sm={5} md={4} lg={2}>
          <img alt={item?.label} onClick={handleSelect(item?.value)} src={item?.value} className={item.value === value ? classes.selected : classes.notSelected} />
        </Grid>
      ))}
      {!isEmpty(error) && (
        <Grid item xs={12}>
          <Typography align='right' color='error'>
            {error}
          </Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default ImageList;
