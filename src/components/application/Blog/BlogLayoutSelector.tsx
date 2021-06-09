import * as React from 'react';
import TabSelectorTextToolBar from '../../general/TabSelector/TabSelectorTextToolBar';

const tabs = [
  { id: 'News', route: '/connect', routeState: { blogLayout: 'list', cateogory: 'News' } },
  { id: 'Forum', route: '/connect', routeState: { blogLayout: 'list', category: 'Forum' } },
  { id: 'Calendar', route: '/connect', routeState: { blogLayout: 'calendar' } }
].filter(t => t);

const BlogLayoutSelector = props => {
  return <TabSelectorTextToolBar id='BlogLayoutSelector' tabs={tabs} {...props} />;
};

export default BlogLayoutSelector;
