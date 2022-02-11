import * as React from 'react';
import { triggerResize, isEmpty } from '../../../helpers';
import { Tabs, Tab, Typography, Container } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import useTabSelector from '../../application/Selector/useTabSelector';
import { useLocation } from 'react-router';

export interface ComponentProps {
  id?: string;
  tab?: string;
  tabs?: TabSelectorItem[];
  orientation?: string;
  rounded?: boolean;
  wrapped?: boolean;
  minHeight?: number;
  onChange?: any;
  classes?: any;
}

const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    root: ({ rounded }) => ({
      borderRadius: rounded ? undefined : 0,
      padding: 0
    }),
    tabs: ({ minHeight }: any) => ({
      minHeight,
      borderRadius: 'inherit'
    }),
    indicator: {
      background: palette.primary.light,
      height: 4,
      marginBottom: 4,
      borderRadius: 'inherit'
    },
    labelIcon: ({ minHeight }: any) => ({
      zIndex: 1,
      minHeight
    }),
    tabroot: ({ minHeight }: any) => ({
      padding: 0,
      zIndex: 1,
      minWidth: 0,
      minHeight
    }),
    wrapper: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      flexDirection: 'column',
      borderRadius: 'inherit'
    }
  })
);

export interface TabSelectorItem {
  id: string;
  label?: string;
  icon?: any;
  route?: any;
  Component?: any;
}

const TabSelectorToolBar = ({ id, tabs = [], orientation, wrapped, minHeight = 64, rounded = true, onChange }: ComponentProps) => {
  const classes = useStyles({ minHeight, rounded });

  const [tabSelector, setTabSelector] = useTabSelector(id);
  const selected = tabSelector.value;

  const { pathname } = useLocation();

  const tabId = tabs[0] && tabs[0].id;
  const tabRoute = tabs.find(t => t.id === selected)?.route;
  const tabToSelect = pathname !== tabRoute && tabs.find(t => t.route === pathname);

  React.useEffect(() => {
    isEmpty(selected) && setTabSelector({ value: tabId }); // Select the first tab by default when empty
    tabToSelect && setTabSelector({ value: tabToSelect.id });
    triggerResize();
  }, [setTabSelector, selected, tabId, tabToSelect]);

  React.useEffect(() => {
    triggerResize(); //User has roated the device, so trigger a resize so the indicator updates correctly
  }, [orientation]);

  const handleChange = React.useCallback(
    (event, value) => {
      setTabSelector({ value });
      onChange && onChange(value);
    },
    [setTabSelector, onChange]
  );

  const { value = tabs[0].id } = tabSelector;

  return (
    <Container className={classes.root}>
      <Tabs variant='fullWidth' className={classes.tabs} scrollButtons={false} value={value} onChange={handleChange} classes={{ indicator: classes.indicator }}>
        {!tabs ? (
          <></>
        ) : (
          tabs.map(t => (
            <Tab
              key={t.id}
              classes={{
                root: classes.tabroot,
                labelIcon: classes.labelIcon,
                //wrapper: classes.wrapper,
                wrapped: classes.labelIcon
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
    </Container>
  );
};

export default TabSelectorToolBar;
