import * as React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../../store';
import * as PopoverStore from './PopoverStore';
import { Popover } from '@material-ui/core';

export interface ComponentPopoverReduxProps {
  id?: string; //unique id or name of this popover
}

export const withComponentPopoverRedux = (PopoverContentToWrap: any, props?: ComponentPopoverReduxProps) => {
  //If the content is a component, then inject the props.  If it is an element, then clone it and then inject the props
  //const wrappedcontent = isReactComponent(PopoverContentToWrap) ? <PopoverContentToWrap {...props} /> : React.cloneElement(PopoverContentToWrap as any, { ...props });
  const wrappedcontent = <PopoverContentToWrap {...props} />;
  return <ComponentPopover {...props}>{wrappedcontent}</ComponentPopover>;
};

export interface ComponentPopoverProps {
  anchorEl?: any; //anchor element, if null the popover is closed
  onClose?: () => void; //callback when closing
  PopoverProps?: any; //properties to pass to the Dialog component
  children?: any;
  childProps?: any;
  classes?: any;
}

//Createas a popover with children and hooks for the name, anchor and onclose
export default function ComponentPopover({
  id,
  children,
  childProps,
  PopoverProps,
  classes,
  onClose,
  ...other
}: ComponentPopoverProps & ComponentPopoverReduxProps) {
  const closePopover = PopoverStore.useClosePopover();

  const popover: any = useSelector((state: AppState) => state.popover[id]);
  const anchorEl = popover && popover.anchorEl && popover.anchorEl();

  const handleOnClose = React.useCallback(
    event => {
      closePopover(id);
      onClose && onClose(); //Execute any other onClose events
    },
    [closePopover, onClose, id]
  );

  //Inject props into children
  const childrenWithProp = React.Children.map(children, child => {
    //Inject onClose intall all children so they can easily close the popover if needed
    //The injected onClose also calls a previously passed in onClose function if it was provided
    return React.cloneElement(child as any, {
      id,
      onClose: handleOnClose,
      rowData: popover && popover.rowData,
      ...other,
    });
  });

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={handleOnClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps={{ square: true }}
      {...PopoverProps}
    >
      {childrenWithProp}
    </Popover>
  );
}
