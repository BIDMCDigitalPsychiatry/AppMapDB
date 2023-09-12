import * as React from 'react';
import { isEmpty } from '../../helpers';
import useAppTableData from './useAppTableData';

export default function useAppTableDataGroup({ trigger = true, groupId = undefined } = {}) {
  var { handleRefresh, ...remaining } = useAppTableData({ trigger: false });

  const handleRefreshGroup = React.useCallback(
    ({ groupId }) => {
      !isEmpty(groupId)
        ? handleRefresh({
            requestParams: {
              FilterExpression: '#groupId = :groupId or #_id = :_id',
              ExpressionAttributeNames: {
                '#_id': '_id',
                '#groupId': 'groupId'
              },
              ExpressionAttributeValues: {
                ':_id': groupId, // The first item in a group will have the id as the group id, so make sure this is included
                ':groupId': groupId
              }
            }
          })
        : console.error('Empty groupId');
    },
    [handleRefresh]
  );

  // Replace trigger logic with exclude
  React.useEffect(() => {
    trigger && !isEmpty(groupId) && handleRefreshGroup({ groupId });
  }, [trigger, groupId, handleRefreshGroup]);

  return {
    ...remaining,
    handleRefresh: handleRefreshGroup
  };
}
