import * as React from 'react';
import { triggerResize, isEmpty } from '../../../helpers';
import { Tabs, Tab, Typography, Container } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import useTabSelectorValue from '../../application/Selector/useTabSelectorValue';

export interface ComponentProps {
  id?: string;
  value?: string;
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
    })
  })
);

export interface TabSelectorItem {
  id: string;
  label?: string;
  icon?: any;
  route?: any;
  Component?: any;
  onClick?: any;
}

const TabSelectorToolBar = ({ id, value: Value = undefined, tabs = [], orientation, wrapped, minHeight = 64, rounded = true, onChange }: ComponentProps) => {
  const classes = useStyles({ minHeight, rounded });

  const [tsValue, setTabSelector] = useTabSelectorValue(id, tabs[0] && tabs[0].id);

  // Priority: External, interal, else default first tab, support null as well
  const value = Value !== undefined && Value !== '' ? Value : !isEmpty(tsValue) ? tsValue : tabs[0] && tabs[0].id;

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
                wrapped: classes.labelIcon
              }}
              icon={t.icon && <t.icon style={{ marginBottom: 0 }} />}
              value={t.id}
              wrapped={wrapped}
              onClick={t?.onClick && t.onClick}
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
