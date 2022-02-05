import { useSelector } from 'react-redux';
import { AppState } from '../../../store';
import TabSelector, { TabSelectorItem } from '../../general/TabSelector/TabSelector';
import useOrientation from '../../layout/ViewPort/hooks/useOrientation';

export interface ComponentProps {
  name?: string; //Unique name
  tab?: string; //Selected tab
  tabs?: TabSelectorItem[];
  orientation?: string;
  onChange?: (tab: string) => void;
  classes?: any;
}

const TableTabSelector = ({ name, tabs, tab }: ComponentProps) => {
  const orientation = useOrientation();
  const storeTab = useSelector((state: AppState) => state.table[name]?.tab);
  return <TabSelector tab={tab || storeTab} tabs={tabs} orientation={orientation} />;
};

export default TableTabSelector;
