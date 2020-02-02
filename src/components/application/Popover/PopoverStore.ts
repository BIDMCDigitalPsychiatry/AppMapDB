import React from 'react';
import { Reducer } from 'redux';
import { useDispatch } from 'react-redux';

export type State = Popover[];
const defaultState = [];

export interface Popover {
  id: string; //Unique identifier of popover
  anchorEl: () => any; //Anchor element for popover. Indicates the open/close status and which element the popover belongs to
  props?: any; //Any extra props needed for the popover
}

interface IPopoverOpen {
  type: 'OPEN_POPOVER';
  id: string;
  anchorEl: any;
  props?: any;
}
interface IPopoverClose {
  type: 'CLOSE_POPOVER';
  id: string;
}

type KnownAction = IPopoverOpen | IPopoverClose;

export const useOpenPopover = () => {
  const dispatch = useDispatch();
  return React.useCallback(
    (id: string, anchorEl: any, props?: any) => dispatch(actionCreators.AOpenPopover(id, anchorEl, props)),
    [dispatch]
  );
};

export const useClosePopover = () => {
  const dispatch = useDispatch();
  return React.useCallback((id: string) => dispatch(actionCreators.AClosePopover(id)), [dispatch]);
};

export const actionCreators = {
  AOpenPopover: (id: string, anchorEl: any, props?: any) =>
    ({ type: 'OPEN_POPOVER', id, anchorEl, props } as IPopoverOpen),
  AClosePopover: (id: string) => ({ type: 'CLOSE_POPOVER', id } as IPopoverClose),
};

export const reducer: Reducer<State> = (state: State, action: KnownAction | any) => {
  let newState = !state ? defaultState : state;
  switch (action.type) {
    case 'OPEN_POPOVER':
      newState[action.id] = { anchorEl: action.anchorEl, ...action.props };
      //newState[action.id] = { anchorEl: action.anchorEl };
      return newState;
    case 'CLOSE_POPOVER':
      newState[action.id] = { anchorEl: null };
      return newState;
    default:
  }
  return newState || defaultState;
};
