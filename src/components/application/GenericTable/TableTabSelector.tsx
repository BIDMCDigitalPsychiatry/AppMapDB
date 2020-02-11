import * as React from 'react';
import { connect } from 'react-redux';
import { AppState } from '../../../store';
import TabSelector, { TabSelectorItem } from '../../general/TabSelector/TabSelector';

export interface ComponentProps {
  name?: string; //Unique name
  tab?: string; //Selected tab
  tabs?: TabSelectorItem[];
  orientation?: string;
  onChange?: (tab: string) => void;
  classes?: any;
}

const TableTabSelector = ({ tabs, tab, orientation }: ComponentProps) => <TabSelector tab={tab} tabs={tabs} orientation={orientation} />;

const mapStateToProps = (state: AppState, ownProp: ComponentProps): ComponentProps => {
  const storeTable = state.table[ownProp.name];
  return {
    ...ownProp,
    name: ownProp.name,
    tab: ownProp.tab || (storeTable && storeTable.tab), //Use provide value, then store value or default to 'All' if neither are provided
    orientation: state.layout.height > state.layout.width ? 'potrait' : 'landscape'
  };
};

export default connect(mapStateToProps)(TableTabSelector);
