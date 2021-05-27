import React from 'react';
import { Typography } from '@material-ui/core';
import { isEmpty } from '../../../../helpers';
import DialogButton from '../../GenericDialog/DialogButton';

export default function ExpandableDescription({
  variant = 'caption' as any,
  maxDescription = 1000,
  androidStore = undefined,
  appleStore = undefined,
  handleRefresh = undefined
}) {
  const [expand, setExpand] = React.useState(false);

  const handleToggleExpand = React.useCallback(() => {
    setExpand(prev => !prev);
    handleRefresh && handleRefresh();
  }, [setExpand, handleRefresh]);

  var description = !isEmpty(appleStore?.description) ? appleStore.description : androidStore?.description;
  const isExpandable = description?.length > maxDescription;
  var collapsedDescription = undefined;
  if (expand === false && isExpandable) {
    collapsedDescription = description.substring(0, maxDescription) + '...  ';
  }

  return isExpandable ? (
    <>
      <Typography variant={variant}>{expand ? description : collapsedDescription}</Typography>
      <DialogButton variant='link' color='primary' size='small' tooltip='' underline='always' onClick={handleToggleExpand}>
        {expand ? 'Hide More' : `Show More`}
      </DialogButton>
    </>
  ) : (
    <Typography variant={variant}>{description}</Typography>
  );
}
