import * as React from 'react';
import * as PopoverStore from '../Popover/PopoverStore';
import { Tooltip, Grid, IconButton } from '@material-ui/core';

interface ComponentProps {
  icon?: any;
  tooltip?: string;
  name?: string;
  popoverProps: any;
}

export default function IconButtonPopover({ name, icon, tooltip, popoverProps }: ComponentProps) {
  const openPopover = PopoverStore.useOpenPopover();
  const handlePopover = React.useCallback(
    event => {
      event.stopPropagation();
      //This code seems to work without problems
      //If errors are encountered, then we will need to move the anchorEl into the state instead of declaring it in this function
      //Keep in mind that we only want to pass the function to redux, as passing the entire anchorEl is problematic for the persistor and overall size of the store
      const anchorEl = event.currentTarget;
      openPopover(name, () => anchorEl, { ...popoverProps });
    },
    [name, openPopover, popoverProps]
  );

  return (
    <Tooltip placement='left' disableFocusListener title={tooltip}>
      <Grid container justify='flex-start'>
        <Grid item>
          <IconButton size='small' color='inherit' onClick={handlePopover}>
            {icon}
          </IconButton>
        </Grid>
      </Grid>
    </Tooltip>
  );
}
