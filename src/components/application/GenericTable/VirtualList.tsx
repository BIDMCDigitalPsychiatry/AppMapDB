import * as React from 'react';
import { useTheme } from '@material-ui/core';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import Component from '@reactions/component';
import { evalFunc } from '../../../helpers';
import { CellMeasurer, CellMeasurerCache, List } from 'react-virtualized';

export interface VirtualListProps {
  name?: string;
  height?: number;
  columns?: any[] | ((props?) => any[]);
  data?: any[];
  rowHeight?: number;
}

export default function VirtualList(props: VirtualListProps) {
  const { layout } = useTheme() as any;
  const { rowHeight = layout.tableRowHeight, data, columns, height } = props;

  const sortinjectedcolumns = evalFunc(columns, props);

  return (
    <div style={{ height: height }}>
      <Component initialState={{ selectedRowIds: [] }}>
        {({ state }) => {
          const selectedRowIds = state.selectedRowIds;
          const length = selectedRowIds.length;
          const adjustedheight = length > 0 ? height - layout.multiselectbarheight - layout.contentrowspacing : height;
          return (
            <AutoSizer>
              {({ width }) => <DynamicList data={data} rowHeight={rowHeight} width={width as any} height={adjustedheight} columns={sortinjectedcolumns} />}
            </AutoSizer>
          );
        }}
      </Component>
    </div>
  );
}

const DynamicList = props => {
  const { height, width, data, columns, rowHeight = 50, getClassName } = props as any;

  const handleRefresh = () => {
    setCache(
      new CellMeasurerCache({
        fixedWidth: true,
        minHeight: rowHeight
      })
    );
  };

  React.useEffect(() => {
    setCache(
      new CellMeasurerCache({
        fixedWidth: true,
        minHeight: rowHeight
      })
    );
  }, [data, columns, getClassName, height, rowHeight, width]);

  const [cache, setCache] = React.useState(
    new CellMeasurerCache({
      fixedWidth: true,
      minHeight: props.rowHeight ?? 50
    })
  );

  const _rowRenderer = ({ index, key, parent, style }) => {
    const classNames = getClassName && getClassName({ columnIndex: 0, rowIndex: index });
    return (
      <CellMeasurer cache={cache} columnIndex={0} key={key} rowIndex={index} parent={parent}>
        {({ measure, registerChild }) => (
          <div ref={registerChild} className={classNames} style={style}>
            {columns[0].cell({ ...data[index], handleRefresh }, columns[0])}
          </div>
        )}
      </CellMeasurer>
    );
  };

  return (
    <List
      deferredMeasurementCache={cache}
      height={height}
      overscanRowCount={0}
      rowCount={data.length}
      rowHeight={cache.rowHeight}
      rowRenderer={_rowRenderer}
      width={width}
    />
  );
};
