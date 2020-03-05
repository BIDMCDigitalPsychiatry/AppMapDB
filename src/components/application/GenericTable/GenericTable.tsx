import * as React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../../store';
import TablePlaceHolder from './TablePlaceHolder';
import VirtualTable, { VirtualTableProps } from './VirtualTable';
import { Typography, Divider, useTheme, makeStyles, createStyles, Paper, Grid } from '@material-ui/core';
import VirtualList from './VirtualList';

export interface GenericTableProps extends VirtualTableProps {
  footer?: boolean;
  elevation?: number;
  placeholder?: string | React.ReactNode;
  selector?(state, props): [];
  length?: number;
  isList?: boolean;
}

const useStyles = makeStyles(({ palette, spacing, layout }: any) =>
  createStyles({
    placeholder: {
      padding: spacing(1),
      background: palette.grey[50]
    },
    footer: {
      paddingRight: spacing(1),
      background: palette.grey[200],
      border: 8,
      height: layout.tablefooterheight,
      color: palette.text.hint
    },
    paper: ({ rounded }: any) => ({
      borderBottomLeftRadius: rounded ? 4 : 0,
      borderBottomRightRadius: rounded ? 4 : 0
    })
  })
);

export default function GenericTable(props: GenericTableProps) {
  const { elevation = 4, placeholder, footer, name, selector, data: Data = [], height: Height, isList, ...other } = props;
  const classes = useStyles(props);
  const { layout } = useTheme();
  const data = useSelector((state: AppState) => (selector ? selector(state, props) : Data));
  const length = data && data.length ? data.length : 0;
  const height = footer ? Height - layout.tablefooterheight : Height;

  const VirtualComponent = isList ? VirtualList : VirtualTable;

  return (
    <Paper elevation={elevation} className={classes.paper}>
      {length === 0 ? (
        <Grid style={{ height: height }} container className={classes.placeholder} alignItems='center' justify='center'>
          <Grid item xs>
            <TablePlaceHolder {...props} />
          </Grid>
          <Grid item xs={12} />
        </Grid>
      ) : (
        <VirtualComponent name={name} data={data} height={height} {...other} />
      )}
      {footer && (
        <>
          <Divider />
          <Grid container className={classes.footer} alignContent='center' alignItems='center' justify='flex-end'>
            <Grid item container alignItems='center' justify='flex-end'>
              <Typography align='right' variant='caption'>
                Viewing {length} {name}
              </Typography>
            </Grid>
          </Grid>
        </>
      )}
    </Paper>
  );
}
