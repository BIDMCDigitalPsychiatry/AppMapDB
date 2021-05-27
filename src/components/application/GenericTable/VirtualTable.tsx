import * as React from 'react';
import * as Icons from '@material-ui/icons';
import { makeStyles, useTheme, Typography, Collapse, Checkbox, Grid, createStyles } from '@material-ui/core';
import MuiTable from 'mui-virtualized-table';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import Component from '@reactions/component';
import classNames from 'classnames';
import * as TableStore from './store';
import { SortComparator } from './helpers';
import { evalFunc } from '../../../helpers';

export interface VirtualTableProps {
  name?: string;
  height?: number;
  checkbox?: boolean;
  hover?: boolean;
  onCellClick?: (event, props) => any;
  onHeaderClick?: (event, props) => any;
  isCellHovered?: (column, rowData, hoveredColumn, hoveredRowData) => boolean;
  select?: boolean;
  columns?: any[] | ((props?) => any[]);
  data?: any[];
  MultiSelectToolbar?: any;
  rounded?: boolean;
  rowHeight?: number;
  includeHeaders?: boolean;
  fixedRowCount?: number;
  fixedColumnCount?: number;
  showScroll?: boolean;
  rowDivider?: boolean;
}

const gridStyle = {
  border: 0,
  'scrollbar-width': 'none' /* Firefox 64 */
};

const sharedTableStyle = {
  border: 0,
  '& .topLeftGrid': gridStyle,
  '& .topRightGrid': gridStyle,
  '& .bottomLeftGrid': gridStyle
};

const tableStyle = {
  ...sharedTableStyle,
  '& .bottomRightGrid': {
    border: 0,
    // Hide scrollbars on Chrome/Safari/IE
    '&::-webkit-scrollbar': {
      display: 'none'
    },
    'scrollbar-width': 'none' /* Firefox 64 */,
    '-ms-overflow-style': 'none' as any,
    '-webkit-overflow-scrolling': 'auto',
    '&::-webkit-overflow-scrolling': 'auto'
  }
};

export const tableScrollStyle = ({ palette }) => ({
  ...sharedTableStyle,
  '& .bottomRightGrid': {
    '&::-webkit-scrollbar': {
      display: 'auto',
      width: 6,
      height: 6
    },
    '&::-webkit-scrollbar-thumb': {
      // Works on chrome only
      backgroundColor: palette.primary.light,
      borderRadius: 25
    },
    border: 0,
    '-ms-overflow-style': 'none' as any,
    '-webkit-overflow-scrolling': 'auto',
    '&::-webkit-overflow-scrolling': 'auto'
  }
});

const useStyles = makeStyles(({ palette, spacing, layout }: any) =>
  createStyles({
    table: {
      ...tableStyle
    },
    tableRounded: {
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
      ...tableStyle
    },
    tableScroll: {
      ...tableScrollStyle({ palette })
    },
    tableScrollRounded: {
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
      ...tableScrollStyle({ palette })
    },
    cellHovered: {
      backgroundColor: palette.primary.light
    },
    cellSelected: {
      color: palette.common.white + ' !important',
      backgroundColor: palette.primary.main
    },
    checkbox: {
      paddingLeft: 0,
      paddingRight: 0
    },
    checkboxIcon: {
      backgroundColor: palette.common.white
    },
    selectedHeader: {
      paddingLeft: spacing(1),
      paddingRight: spacing(1),
      color: palette.common.white,
      backgroundColor: palette.primary.main,
      height: layout.multiselectbarheight,
      marginBottom: layout.contentrowspacing
    },
    cell: {
      //color: palette.secondary.main,
    },
    collapse: {
      background: palette.grey[400]
    }
  })
);

//If a row data function exists, it returns the results of that, otherwise just the row id
export function getRowData(selectedRowIds, data) {
  return selectedRowIds
    .map(rid => data.find(d => d.id === rid))
    .filter(row => row)
    .map(row => (row.getRowData ? { ...row.getRowData(row) } : { id: row.id }));
}

export default function VirtualTable(props: VirtualTableProps) {
  const classes = useStyles(props);
  const { layout } = useTheme() as any;
  const {
    name,
    includeHeaders = true,
    fixedRowCount = 1,
    fixedColumnCount = 0,
    rowHeight = layout.tableRowHeight,
    rounded = false,
    hover,
    onCellClick = undefined,
    onHeaderClick = undefined,
    isCellHovered = undefined,
    select,
    checkbox,
    data,
    height,
    columns,
    MultiSelectToolbar,
    showScroll = false,
    rowDivider = true
  } = props;

  const table: TableStore.Table = TableStore.useTable(name);
  const tableUpdate = TableStore.useTableUpdate();

  const handleSort = (column, sort: SortComparator) => {
    table &&
      tableUpdate({
        id: table.id,
        orderBy: column,
        orderDirection: table.orderDirection === 'asc' ? 'desc' : 'asc',
        sortComparator: sort
      });
  };

  const sortinjectedcolumns = evalFunc(columns, props).map(c => ({
    ...c,
    onHeaderClick: c.sort
      ? (event, props) => {
          handleSort(c.name, c.sort);
          onHeaderClick && onHeaderClick(event, props);
        }
      : onHeaderClick
  })); //;== true && handleSort() }));
  return (
    <div style={{ height: height }}>
      <Component initialState={{ selectedRowIds: [] }}>
        {({ state, setState }) => {
          const selectedRowIds = state.selectedRowIds;
          const length = selectedRowIds.length;
          const itemtxt = length === 0 ? '' : length === 1 ? length + ' item' : length + ' items';
          const adjustedheight = length > 0 ? height - layout.multiselectbarheight - layout.contentrowspacing : height;
          return (
            <AutoSizer>
              {({ width }) => (
                <>
                  <div style={{ width: width }}>
                    <Collapse className={classes.collapse} in={length > 0}>
                      <Grid className={classes.selectedHeader} container direction='row' justify='space-between' alignItems='center' spacing={0}>
                        <Grid item xs zeroMinWidth>
                          <Typography noWrap color='inherit' variant='h5'>
                            {itemtxt}
                          </Typography>
                        </Grid>
                        <Grid item xs>
                          <Grid container justify='flex-end' alignItems='center' alignContent='center'>
                            <Grid item>{length > 0 && MultiSelectToolbar && <MultiSelectToolbar rowData={getRowData(selectedRowIds, data)} />}</Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Collapse>
                  </div>
                  <MuiTable
                    cellProps={{
                      size: 'small',
                      style: { paddingLeft: 16, paddingRight: 0, borderBottom: rowDivider === false ? 0 : undefined }
                    }}
                    classes={{
                      table: showScroll
                        ? classNames(classes.tableScroll, rounded && classes.tableScrollRounded)
                        : classNames(classes.table, rounded && classes.tableRounded),
                      cellHovered: classes.cellHovered,
                      cellSelected: classes.cellSelected,
                      cell: classes.cell
                    }}
                    fixedRowCount={fixedRowCount}
                    fixedColumnCount={fixedColumnCount}
                    width={width}
                    height={adjustedheight}
                    rowHeight={rowHeight}
                    includeHeaders={includeHeaders}
                    orderBy={table && table.orderBy}
                    orderDirection={table ? table.orderDirection : 'asc'}
                    data={data}
                    columns={
                      checkbox
                        ? [
                            {
                              name: 'checkbox',
                              header: (
                                <Checkbox
                                  checkedIcon={<Icons.CheckBox className={classes.checkboxIcon} color='primary' />}
                                  indeterminateIcon={<Icons.IndeterminateCheckBox className={classes.checkboxIcon} color='primary' />}
                                  checked={state.selectedRowIds.filter(rid => data.find(d => d.id === rid)).length > 0}
                                  onChange={e =>
                                    setState(prevState => {
                                      if (prevState.selectedRowIds.filter(rid => data.find(d => d.id === rid)).length === data.length) {
                                        // deselect all
                                        return { selectedRowIds: [] };
                                      } else {
                                        // select all
                                        return {
                                          selectedRowIds: data.map(d => d.id)
                                        };
                                      }
                                    })
                                  }
                                  {...(state.selectedRowIds.filter(rid => data.find(d => d.id === rid)).length > 0 &&
                                    state.selectedRowIds.filter(rid => data.find(d => d.id === rid)).length !== data.length && {
                                      indeterminate: true,
                                      color: 'default'
                                    })}
                                />
                              ),
                              cell: rowData => (
                                <Checkbox
                                  checkedIcon={<Icons.CheckBox className={classes.checkboxIcon} color='primary' />}
                                  checked={state.selectedRowIds.filter(rid => data.find(d => d.id === rid)).some(id => rowData.id === id)}
                                />
                              ),
                              cellProps: {
                                style: { paddingLeft: 8, paddingRight: 0 }
                              },
                              width: 48
                            },
                            ...sortinjectedcolumns
                          ]
                        : sortinjectedcolumns
                    }
                    isCellSelected={select ? (column, rowData) => state.selectedRowIds.some(id => rowData && rowData.id === id) : undefined}
                    isCellHovered={
                      isCellHovered || hover
                        ? (column, rowData, hoveredColumn, hoveredRowData) =>
                            isCellHovered
                              ? isCellHovered(column, rowData, hoveredColumn, hoveredRowData)
                              : rowData && rowData.id && rowData.id === hoveredRowData.id
                        : undefined
                    }
                    onHeaderClick={onHeaderClick}
                    onCellClick={
                      onCellClick
                        ? onCellClick
                        : select
                        ? (event, { column, rowData }) => {
                            setState(prevState => {
                              if (prevState.selectedRowIds.some(id => rowData.id === id)) {
                                // remove
                                return {
                                  selectedRowIds: prevState.selectedRowIds.filter(id => id !== rowData.id)
                                };
                              } else {
                                // add
                                return {
                                  selectedRowIds: [...prevState.selectedRowIds, rowData.id]
                                };
                              }
                            });
                          }
                        : undefined
                    }
                    style={{ backgroundColor: 'white' }}
                  />
                </>
              )}
            </AutoSizer>
          );
        }}
      </Component>
    </div>
  );
}
