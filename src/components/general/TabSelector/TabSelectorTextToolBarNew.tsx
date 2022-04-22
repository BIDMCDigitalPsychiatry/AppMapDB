import * as React from 'react';
import { triggerResize, isEmpty } from '../../../helpers';
import { Tabs, Tab, Typography, Container } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { useChangeRoute } from '../../layout/hooks';
import useTabSelectorValue from '../../application/Selector/useTabSelectorValue';

export interface ComponentProps {
  id?: string;
  tab?: string;
  tabs?: TabSelectorItem[];
  orientation?: string;
  labelColor?: any;
  rounded?: boolean;
  wrapped?: boolean;
  minHeight?: number;
  onChange?: any;
  classes?: any;
  value?: string;
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
      background: palette.primary.main,
      marginBottom: 4,
      height: 60,
      zIndex: 0,
      borderRadius: 12
    },
    labelActive: {
      color: 'white'
    },
    label: {
      color: palette.text.primary
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
    })
  })
);

export interface TabSelectorItem {
  id: string;
  label?: string;
  icon?: any;
  route?: any;
  routeState?: any;
  Component?: any;
}

const TabSelectorTextToolBarNew = ({
  id,
  tabs = [],
  labelColor = undefined,
  orientation,
  wrapped,
  minHeight = 64,
  rounded = true,
  onChange,
  value: Value = undefined
}: ComponentProps) => {
  const classes = useStyles({ minHeight, rounded, labelColor });

  const [tsValue, setTabSelector] = useTabSelectorValue(id, tabs[0] && tabs[0].id);

  // Priority: External, interal, else default first tab
  const value = !isEmpty(Value) ? Value : !isEmpty(tsValue) ? tsValue : tabs[0] && tabs[0].id;

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

  const changeRoute = useChangeRoute();

  const handleClick = React.useCallback(
    ({ route = undefined, routeState = undefined, onClick = undefined } = {}) =>
      () => {
        !isEmpty(route) && changeRoute(route, routeState);
        onClick && onClick();
      },
    [changeRoute]
  );

  return (
    <Container className={classes.root}>
      <Tabs variant='fullWidth' className={classes.tabs} scrollButtons={false} value={value} onChange={handleChange} classes={{ indicator: classes.indicator }}>
        {!tabs ? (
          <></>
        ) : (
          tabs.map((t: any) => (
            <Tab
              key={t.id}
              onClick={handleClick(t)}
              classes={{
                root: classes.tabroot,
                labelIcon: classes.labelIcon,
                wrapped: classes.labelIcon
              }}
              icon={t.icon && <t.icon style={{ marginBottom: 0 }} />}
              value={t.id}
              wrapped={wrapped}
              label={
                <Typography
                  className={value === t.id ? classes.labelActive : classes.label}
                  variant='h6'
                  style={{ maxWidth: `calc(100% - ${2}px)` }}
                  noWrap={!wrapped}
                >
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

export default TabSelectorTextToolBarNew;
