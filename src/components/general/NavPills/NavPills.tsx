import * as React from 'react';
import classNames from 'classnames';
import SwipeableViews from 'react-swipeable-views';
import { Tab, Tabs, Grid, makeStyles, createStyles, Divider } from '@material-ui/core';

const useStyles = makeStyles(({ breakpoints, palette, spacing }: any) =>
  createStyles({
    root: {
      overflow: 'visible !important' as any
    },
    rootscrollable: {
      marginTop: '20px',
      marginLeft: -20,
      marginRight: -20,
      paddingLeft: '0',
      marginBottom: '0',
      overflow: 'hidden !important' as any
    },
    flexContainer: {
      [breakpoints.down('xs')]: {
        display: 'flex',
        flexWrap: 'wrap' as any
      }
    },
    displayNone: {
      display: 'none !important'
    },
    fixed: {
      overflowX: 'visible' as any
    },
    horizontalDisplay: {
      display: 'block'
    },
    pills: {
      float: 'left' as any,
      position: 'relative' as any,
      display: 'block' as any,
      borderRadius: '30px' as any,
      minWidth: 0,
      maxWidth: 240,
      height: 100,
      textAlign: 'center' as any,
      transition: 'all .3s' as any,
      opacity: 1,
      margin: spacing(1),
      padding: '0!important',
      color: 'inherit',
      lineHeight: '24px' as any,
      textTransform: 'uppercase' as any
    },
    pillsWithIcons: {
      borderRadius: '20px'
    },
    tabIcon: {
      width: '30px',
      height: '30px',
      display: 'block'
    },
    horizontalPills: {
      width: '100%',
      float: 'none !important' as any,
      '& + button': {
        margin: '10px 0'
      }
    },
    contentWrapper: {},
    primary: {
      '&,&:hover': {
        color: '#FFFFFF',
        backgroundColor: palette.primary.main,
        boxShadow: '0 4px 20px 0px rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(156, 39, 176, 0.4)'
      }
    },
    info: {
      '&,&:hover': {
        color: '#FFFFFF',
        backgroundColor: palette.secondary.main,
        boxShadow: '0 4px 20px 0px rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(76, 175, 80, 0.4)'
      }
    },
    success: {
      '&,&:hover': {
        color: '#FFFFFF',
        backgroundColor: palette.primary.main,
        boxShadow: '0 2px 2px 0 rgba(76, 175, 80, 0.14), 0 3px 1px -2px rgba(76, 175, 80, 0.2), 0 1px 5px 0 rgba(76, 175, 80, 0.12)'
      }
    },
    warning: {
      '&,&:hover': {
        color: '#FFFFFF',
        backgroundColor: palette.error.light,
        boxShadow: '0 4px 20px 0px rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(255, 152, 0, 0.4)'
      }
    },
    danger: {
      '&,&:hover': {
        color: '#FFFFFF',
        backgroundColor: palette.error.main,
        boxShadow: '0 4px 20px 0px rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(255, 152, 0, 0.4)'
      }
    },
    rose: {
      '&,&:hover': {
        color: '#FFFFFF',
        backgroundColor: palette.error.dark,
        boxShadow: '0 4px 20px 0px rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(233, 30, 99, 0.4)'
      }
    },
    alignCenter: {
      alignItems: 'center',
      justifyContent: 'center'
    },
    tabContent: ({ contentHeight }: any) => ({
      height: contentHeight,
      overflowX: 'hidden'
    })
  })
);

interface ComponentProps {
  classes?: any;
  scrollable?: boolean;
  active: number;
  tabs: any;
  color?: any;
  direction?: string;
  horizontal?: any;
  alignCenter: boolean;
  contentHeight?: number;
  contentWidth?: number;
  onChange?: (index: number) => void;
}

export default function NavPills(props: ComponentProps) {
  const { contentHeight = undefined, scrollable, tabs, direction, color, horizontal, alignCenter, onChange, active: Active } = props;
  const [state, setState] = React.useState({ active: Active });
  const handleChange = React.useCallback(
    (event, active) => {
      setState({ active });
      onChange && onChange(active);
    },
    [setState, onChange]
  );

  const handleChangeIndex = React.useCallback(
    index => {
      setState({ active: index });
    },
    [setState]
  );
  const classes = useStyles({ contentHeight });

  const flexContainerClasses = classNames({
    [classes.flexContainer]: true,
    [classes.horizontalDisplay]: horizontal !== undefined
  });

  const tabButtons = (
    <Tabs
      classes={{
        root: classNames(classes.root, scrollable && classes.rootscrollable),
        fixed: classes.fixed,
        flexContainer: flexContainerClasses,
        indicator: classes.displayNone
      }}
      value={state.active}
      onChange={handleChange}
      centered={alignCenter}
      variant={scrollable ? 'scrollable' : 'fullWidth'}
      scrollButtons={scrollable ? 'on' : 'off'}
    >
      {tabs.map((prop, key) => {
        var icon = {};
        if (prop.tabIcon !== undefined) {
          icon['icon'] = <prop.tabIcon className={classes.tabIcon} />;
        }
        const pillsClasses = classNames({
          [classes.pills]: true,
          [classes.horizontalPills]: horizontal !== undefined,
          [classes.pillsWithIcons]: prop.tabIcon !== undefined
        });
        return (
          <Tab
            label={prop.tabButton}
            key={key}
            {...icon}
            classes={{
              root: pillsClasses,
              selected: classes[color]
            }}
          />
        );
      })}
    </Tabs>
  );
  const tabContent = (
    <div className={classes.contentWrapper}>
      <Divider />
      <SwipeableViews axis={direction === 'rtl' ? 'x-reverse' : 'x'} index={state.active} onChangeIndex={handleChangeIndex}>
        {tabs.map((prop, key) => (
          <div className={classes.tabContent} key={key}>
            {prop.tabContent}
          </div>
        ))}
      </SwipeableViews>
    </div>
  );

  return horizontal !== undefined ? (
    <Grid container>
      <Grid item {...horizontal.tabsGrid}>
        {tabButtons}
      </Grid>
      <Grid item {...horizontal.contentGrid}>
        {tabContent}
      </Grid>
    </Grid>
  ) : (
    <>
      {tabButtons}
      {tabContent}
    </>
  );
}
