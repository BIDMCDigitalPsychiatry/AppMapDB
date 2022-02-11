import React from 'react';
import { Grid, Typography, Chip, Theme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import { evalFunc, isEmpty } from '../../../../helpers';
import DialogButton from '../../GenericDialog/DialogButton';
import { categoryArray } from '../../../../constants';
import LightTooltip from '../../../general/LightTooltip/LightTooltip';
import { withReplacement } from '../../../../database/models/Application';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    chipRoot: {
      marginLeft: -4,
      display: 'flex',
      flexWrap: 'wrap',
      '& > *': {
        margin: theme.spacing(0.5)
      }
    },
    row: {
      borderBottom: `1px solid ${theme.palette.divider}`
    }
  })
);

export default function ExpandableCategories({ titleVariant = 'body1' as any, isExpandable = true, handleRefresh = undefined, ...other }) {
  const classes = useStyles({});
  const [expand, setExpand] = React.useState(false);

  const [state, setState] = React.useState({});

  const handleExpand = React.useCallback(
    name => event => {
      setState(prev => ({ ...prev, [name]: true }));
      handleRefresh && handleRefresh();
    },
    [setState, handleRefresh]
  );

  const handleToggleExpand = React.useCallback(() => {
    setExpand(prev => !prev);
    handleRefresh && handleRefresh();
  }, [setExpand, handleRefresh]);

  const filtered = categoryArray.filter(
    row => !isExpandable || expand || ['Access', 'Privacy', 'Clinical Foundation', 'Features', 'Conditions Supported'].find(l => l === row.label)
  );

  return (
    <>
      {filtered.map((row: any, i) => {
        const values = evalFunc(row.valueItems, other);
        return (
          <Grid key={i} container alignItems='center' spacing={1} className={classes.row}>
            <Grid item style={{ width: 172 }}>
              <Typography variant={titleVariant}>{row.label}:</Typography>
            </Grid>
            <Grid item zeroMinWidth xs className={classes.chipRoot}>
              {values.map(({ label, tooltip }, i) => (
                <div key={label}>
                  {isExpandable && i === 3 && values.length > 4 && state[row.label] !== true ? (
                    <LightTooltip title={isEmpty(tooltip) ? '' : tooltip}>
                      <Chip
                        key={`${label}-${i}`}
                        style={{ background: row.color, color: 'white', marginRight: 8 }}
                        variant='outlined'
                        size='small'
                        label={`${values.length - 3} More ...`}
                        onClick={handleExpand(row.label)}
                      />
                    </LightTooltip>
                  ) : isExpandable && i > 3 && values.length > 4 && state[row.label] !== true ? (
                    <div key={`${label}-${i}`}></div>
                  ) : (
                    <LightTooltip title={isEmpty(tooltip) ? '' : tooltip}>
                      <Chip
                        key={`${label}-${i}`}
                        style={{ background: row.color, color: 'white', marginRight: 8 }}
                        variant='outlined'
                        size='small'
                        label={withReplacement(label)}
                      />
                    </LightTooltip>
                  )}
                </div>
              ))}
            </Grid>
          </Grid>
        );
      })}
      {isExpandable && (
        <DialogButton
          style={{ marginLeft: -4, marginTop: 8 }}
          variant='link'
          color='primary'
          size='small'
          tooltip=''
          underline='always'
          onClick={handleToggleExpand}
        >
          {`${expand ? 'Hide' : `Show  ${categoryArray.length - filtered.length}`} More`}
        </DialogButton>
      )}
    </>
  );
}
