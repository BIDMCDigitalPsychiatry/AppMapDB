import * as React from 'react';
import TabSelectorTextToolBar from '../../general/TabSelector/TabSelectorTextToolBar';

const tabs = [
  { id: 'News', route: '/connect', routeState: { subRoute: 'list', cateogory: 'News' } },
  { id: 'Forum', route: '/connect', routeState: { subRoute: 'list', category: 'Forum' } },
  { id: 'Calendar', route: '/connect', routeState: { subRoute: 'calendar' } }
].filter(t => t);

const BlogLayoutSelector = props => {
  return <TabSelectorTextToolBar id='BlogLayoutSelector' tabs={tabs} {...props} />;
};

export default BlogLayoutSelector;
