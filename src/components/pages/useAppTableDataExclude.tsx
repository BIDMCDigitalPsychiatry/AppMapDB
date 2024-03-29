import * as React from 'react';
import useAppTableData from './useAppTableData';

const excludeParams = {
  FilterExpression: '#exclude <> :exclude', // If rows have the exclude set to true then don't retreive them
  ExpressionAttributeNames: {
    '#exclude': 'exclude'
  },
  ExpressionAttributeValues: {
    ':exclude': true
  }
};

export default function useAppTableDataExclude({ trigger = true } = {}) {
  var { handleRefresh, ...remaining } = useAppTableData({ trigger: false });

  const handleRefreshExclude = React.useCallback(() => {
    handleRefresh({ requestParams: excludeParams });
  }, [handleRefresh]);

  // Replace trigger logic with exclude
  React.useEffect(() => {
    trigger && handleRefreshExclude();
  }, [trigger, handleRefreshExclude]);

  return {
    ...remaining,
    handleRefresh: handleRefreshExclude
  };
}
