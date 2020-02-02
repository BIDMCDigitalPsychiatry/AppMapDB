import * as React from 'react';
import { triggerResize, isEmpty } from '../../../helpers';
import { Tabs, Tab, Paper, Typography, createStyles, makeStyles } from '@material-ui/core';
import { useTabSelector } from '../../application/Selector/SelectorStore';

export interface ComponentProps {
  id?: string;
  tab?: string;
  tabs?: TabSelectorItem[];
  orientation?: string;
  rounded?: boolean;
  wrapped?: boolean;
  minHeight?: number;
  classes?: any;
}

const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    root: ({ rounded }) => ({
      background: palette.grey[600],
      borderRadius: rounded ? undefined : 0,
    }),
    tabs: ({ minHeight }: any) => ({
      minHeight,
      borderRadius: 'inherit',
    }),
    indicator: {
      background: palette.primary.main,
      height: '100%',
      zIndex: 0,
      borderRadius: 'inherit',
    },
    labelIcon: ({ minHeight }: any) => ({
      color: palette.common.white,
      zIndex: 1,
      minHeight,
    }),
    tabroot: ({ minHeight }: any) => ({
      padding: 0,
      color: palette.common.white,
      zIndex: 1,
      minWidth: 24,
      minHeight,
    }),
    wrapper: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      flexDirection: 'column',
      borderRadius: 'inherit',
    },
  })
);

export interface TabSelectorItem {
  id: string;
  label?: string;
  icon?: any;
  Component?: any;
}

const TabSelector = ({ id, tabs = [], orientation, wrapped, minHeight = 52, rounded = true }: ComponentProps) => {
  const classes = useStyles({ minHeight, rounded });

  const [tabSelector, setTabSelector] = useTabSelector(id);
  const selected = tabSelector.value;

  const tabId = tabs[0] && tabs[0].id;
  React.useEffect(() => {
    isEmpty(selected) && setTabSelector({ value: tabId }); // Select the first tab by default when empty
    triggerResize();
  }, [setTabSelector, selected, tabId]);

  React.useEffect(() => {
    triggerResize(); //User has roated the device, so trigger a resize so the indicator updates correctly
  }, [orientation]);

  const handleChange = React.useCallback(
    (event, value) => {
      setTabSelector({ value });
    },
    [setTabSelector]
  );

  const { value = tabs[0].id } = tabSelector;

  return (
    <Paper className={classes.root}>
      <Tabs
        variant='fullWidth'
        className={classes.tabs}
        scrollButtons='off'
        value={value}
        onChange={handleChange}
        classes={{ indicator: classes.indicator }}
      >
        {!tabs ? (
          <></>
        ) : (
          tabs.map(t => (
            <Tab
              key={t.id}
              classes={{
                root: classes.tabroot,
                labelIcon: classes.labelIcon,
                wrapper: classes.wrapper,
                wrapped: classes.labelIcon,
              }}
              icon={t.icon && <t.icon style={{ marginBottom: 0 }} />}
              value={t.id}
              wrapped={wrapped}
              label={
                <Typography variant='caption' style={{ maxWidth: `calc(100% - ${2}px)` }} noWrap={!wrapped}>
                  {t.label ? t.label : t.id}
                </Typography>
              }
            />
          ))
        )}
      </Tabs>
    </Paper>
  );
};

export default TabSelector;
