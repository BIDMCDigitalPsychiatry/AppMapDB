import * as React from 'react';
import { useHandleLink } from '../../../hooks';
import TabSelectorTextToolBar from '../../general/TabSelector/TabSelectorTextToolBar';

const BlogLayoutSelector = props => {
  const handleCalendarLink = useHandleLink('https://www.sodpsych.org/events');

  const tabs = [
    { id: 'News', route: '/Community', routeState: { subRoute: 'list', cateogory: 'News' } },
    { id: 'Forum', route: '/Community', routeState: { subRoute: 'list', category: 'Forum' } },
    { id: 'Calendar', route: '/Community', routeState: { subRoute: 'calendar' }, onClick: handleCalendarLink },
    { id: 'Team', route: '/Community', routeState: { subRoute: 'team' } }
  ].filter(t => t);

  return <TabSelectorTextToolBar id='BlogLayoutSelector' tabs={tabs} {...props} />;
};

export default BlogLayoutSelector;
