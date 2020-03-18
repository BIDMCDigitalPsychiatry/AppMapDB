import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import TableToolbar, { TableToolbarProps } from './TableToolbar';
import { GenericTableProps } from './GenericTable';
import TableTabSelector from './TableTabSelector';
import { Paper, CircularProgress, useTheme } from '@material-ui/core';
import { evalFunc } from '../../../helpers';
import { useHeight, useAppBarHeight } from '../../layout/store';
import { TabSelectorItem } from '../../general/TabSelector/TabSelector';

const GenericTable = React.lazy(() => import('./GenericTable'));

export interface TabSelectorProps {
  tabs?: TabSelectorItem[];
  onChangeTab?: (tab: string, props: GenericTableContainerProps) => void;
}

export interface GenericTableContainerProps extends TabSelectorProps, GenericTableProps, TableToolbarProps {
  square?: boolean;
  toolbar?: boolean;
  stacked?: boolean | number;
  loading?: boolean;
  toolbarplaceholder?: string;
  title?: string;
  search?: boolean;
  getfiles?: boolean;
  back?: boolean;
  domainData?: boolean;
  domainLogs?: boolean;
  dialogs?: any[];
  showScroll?: boolean;
  FilterContainer?: any;
}

const injectValues = (Component, { getValues, handleRefresh }) => <Component {...getValues()} handleRefresh={handleRefresh} />;

export default function GenericTableContainer(props: GenericTableContainerProps) {
  const {
    name,
    square,
    height: Height,
    toolbar,
    stacked,
    toolbarplaceholder,
    title,
    search,
    tabs,
    columns: Columns,
    showicon = false,
    loading,
    buttons,
    dialogs = [],
    onChangeTab,
    Icon,
    FilterContainer,
    ...tableProps
  } = props;

  const { layout } = useTheme();
  const layoutHeight = useHeight();
  const height = Height ? Height : layoutHeight;
  const columns = evalFunc(Columns, props);

  const applyCellRenderers = (columns: any) => {
    columns &&
      columns.forEach((column: any) => {
        if (column.renderCell) {
          //Column has a custom render, so apply it to the virtual table cell render callback
          column.cell = (row: any, col: any) => column.renderCell(row.getValues ? row.getValues() : row, column);
        } else if (column.Cell) {
          column.cell = (row: any, col: any) => injectValues(column.Cell, row); // Inject values via getValues()
        }
      });
  };

  const handleTabChange = (value: any) => {
    onChangeTab && onChangeTab(value, props);
  };

  applyCellRenderers(columns); //Apply any custom cell renderers that are needed

  const _toolbar = toolbar && (
    <TableToolbar
      name={name}
      search={search != null ? search : true}
      title={title ? title : name ? name : ''}
      square={square}
      inputplaceholder={toolbarplaceholder}
      showicon={showicon}
      buttons={evalFunc(buttons, props)}
      Icon={Icon}
    />
  );
  var filterbar = tabs && <TableTabSelector name={name} tabs={tabs} onChange={handleTabChange} />;

  const rows = [
    { id: 'fc', component: FilterContainer, height: layout.tabletoolbarheight },
    { id: 'toolbar', component: _toolbar, height: layout.tabletoolbarheight },
    {
      id: 'filterbar',
      component: filterbar,
      height: layout.tablefilterbarheight
    }
  ].filter(x => x.component); //Remove any null components

  const appBarHeight = useAppBarHeight();

  const componentsOnPage = [
    appBarHeight,
    layout.contentpadding, // Top content padding
    stacked ? layout.tablefilterbarheight + layout.contentrowspacing : 0,
    layout.tabletoolbarheight + layout.contentrowspacing,
    layout.contentpadding, // Bottom content padding
    layout.footerheight
  ];

  var calculatedheight = height - componentsOnPage.reduce((t, c) => t + c, 0);

  if (typeof stacked === 'number') {
    calculatedheight -= stacked;
  }

  const spinner = (
    <Paper elevation={0} style={{ height: calculatedheight }}>
      <Grid container style={{ height: calculatedheight }} direction='column' alignItems='center' justify='center' spacing={0}>
        <Grid item>
          <CircularProgress color='primary' size={calculatedheight / 6} thickness={3} />
        </Grid>
      </Grid>
    </Paper>
  );

  const table = (
    <React.Suspense fallback={spinner}>
      {loading ? spinner : <GenericTable name={name} height={calculatedheight} columns={columns} placeholder={!buttons && ' '} {...tableProps} />}
    </React.Suspense>
  );

  rows.push({ id: 'table', component: table, height: calculatedheight });

  return (
    <>
      {dialogs.map((d, i) => (
        <div key={i}>{d}</div>
      ))}
      <Grid container>
        {rows.map((r, i) => (
          <Grid key={r.id} item xs={12} style={{ paddingBottom: i === rows.length - 1 ? 0 : layout.contentrowspacing }}>
            {r.component}
          </Grid>
        ))}
      </Grid>
    </>
  );
}
