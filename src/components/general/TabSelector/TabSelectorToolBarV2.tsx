import * as React from 'react';
import { triggerResize, isEmpty } from '../../../helpers';
import { Tabs, Tab, Typography, createStyles, makeStyles, Container } from '@material-ui/core';
import useTabSelector from '../../application/Selector/useTabSelector';
import { useLocation } from 'react-router';
import { useChangeRoute } from '../../layout/hooks';

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
      marginBottom: 4,
      height: 4,
      zIndex: 0,
      borderRadius: 5
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

const TabSelectorToolBarV2 = ({ id, tabs = [], orientation, wrapped, minHeight = 64, rounded = true, onChange }: ComponentProps) => {
  const classes = useStyles({ minHeight, rounded });

  const [tabSelector, setTabSelector] = useTabSelector(id);
  const selected = tabSelector.value;

  const { pathname } = useLocation();

  const tabId = tabs[0] && tabs[0].id;
  const tabRoute = tabs.find(t => t.id === selected)?.route;
  const tabToSelect = pathname !== tabRoute && tabs.find(t => t.route === pathname);

  const changeRoute = useChangeRoute();

  React.useEffect(() => {
    if (tabToSelect === undefined) {
      setTabSelector({ value: tabToSelect });
    } else {
      isEmpty(selected) && setTabSelector({ value: tabId }); // Select the first tab by default when empty
      tabToSelect && setTabSelector({ value: tabToSelect.id });
    }
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

  const { value = undefined } = tabSelector;

  const handleClick = React.useCallback(
    (route, state, onClick = undefined) =>
      () => {
        changeRoute(route, state);
        onClick && onClick();
      },
    [changeRoute]
  );

  return (
    <Container className={classes.root}>
      <Tabs variant='fullWidth' className={classes.tabs} scrollButtons='off' value={value} onChange={handleChange} classes={{ indicator: classes.indicator }}>
        {!tabs ? (
          <></>
        ) : (
          tabs.map((t: any) => (
            <Tab
              key={t.id}
              onClick={handleClick(t.route, t?.routeState, t?.onClick)}
              classes={{
                root: classes.tabroot,
                labelIcon: classes.labelIcon,
                wrapper: classes.wrapper,
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

export default TabSelectorToolBarV2;
