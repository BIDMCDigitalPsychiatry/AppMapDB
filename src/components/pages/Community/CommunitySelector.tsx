import * as React from 'react';
import TabSelectorTextToolBarNew from '../../general/TabSelector/TabSelectorTextToolBarNew';

export const id = 'CommunitySelector';
const CommunitySelector = ({ subRoute, ...other }) => {
  //const handleCalendarLink = useHandleLink('https://www.sodpsych.org/events');

  const tabs = [
    { id: 'News', route: '/Community', routeState: { subRoute: 'list', cateogory: 'News' } },
    { id: 'Forum', route: '/Community', routeState: { subRoute: 'list', category: 'Forum' } },
    //{ id: 'Calendar', route: '/Community', routeState: { subRoute: 'calendar' }, onClick: handleCalendarLink },
    { id: 'Team', route: '/Community', routeState: { subRoute: 'team' }, altRoutes: ['viewTeamMember', 'createTeamMember', 'editTeamMember', 'viewTeamMember'] }
  ].filter(t => t);

  return <TabSelectorTextToolBarNew id={id} tabs={tabs} />;
};

export default CommunitySelector;
