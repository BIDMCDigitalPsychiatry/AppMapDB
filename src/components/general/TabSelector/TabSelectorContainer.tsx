import * as React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { TabSelectorItem } from './TabSelector';
import useTabSelector from '../../application/Selector/useTabSelector';

export interface ComponentProps {
  id: string;
  tabs: TabSelectorItem[];
  Selector: any;
}

const useStyles = makeStyles(({ palette, layout }: any) =>
  createStyles({
    root: {},
    tablecontainer: {
      paddingTop: layout.contentrowspacing
    }
  })
);

const renderContent = (value, tabs) => {
  const tab = tabs.find(t => t.id === value);
  return tab && tab.Component ? <tab.Component /> : <></>;
};

export default function TabSelectorContainer(props: ComponentProps) {
  const classes = useStyles(props);
  const { id, Selector, tabs = [] } = props;
  const [{ value }] = useTabSelector(id);
  return (
    <>
      <Selector />
      <div className={classes.tablecontainer}>{renderContent(value, tabs)}</div>
    </>
  );
}
