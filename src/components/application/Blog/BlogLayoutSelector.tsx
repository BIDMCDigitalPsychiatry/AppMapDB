import * as React from 'react';
import TabSelectorTextToolBar from '../../general/TabSelector/TabSelectorTextToolBar';

const tabs = [
  { id: 'News', route: '/blog', routeState: { blogLayout: 'list', cateogory: 'News' } },
  { id: 'Forum', route: '/blog', routeState: { blogLayout: 'list', category: 'Forum' } },
  { id: 'Calendar', route: '/blog', routeState: { blogLayout: 'calendar' } }
].filter(t => t);

const BlogLayoutSelector = props => {
  return <TabSelectorTextToolBar id='BlogLayoutSelector' tabs={tabs} {...props} />;
};

export default BlogLayoutSelector;
