import * as React from 'react';
import TabSelectorTextToolBarNew from '../../general/TabSelector/TabSelectorTextToolBarNew';
import { tx } from '../../../i18n';

export const id = 'CommunitySelector';
const CommunitySelector = ({ subRoute, ...other }) => {
  //const handleCalendarLink = useHandleLink('https://www.sodpsych.org/events');

  const tabs = [
    { id: tx('News'), route: '/Community', routeState: { subRoute: 'list', category: 'News' } },
    //{ id: 'Calendar', route: '/Community', routeState: { subRoute: 'calendar' }, onClick: handleCalendarLink },
    { id: tx('Team'), route: '/Community', routeState: { subRoute: 'team' }, altRoutes: ['viewTeamMember', 'createTeamMember', 'editTeamMember', 'viewTeamMember'] }
  ].filter(t => t);

  return <TabSelectorTextToolBarNew id={id} tabs={tabs} />;
};

export default CommunitySelector;
