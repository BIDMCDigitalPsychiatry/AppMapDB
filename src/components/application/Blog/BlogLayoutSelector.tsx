import * as React from 'react';
import TabSelectorTextToolBar from '../../general/TabSelector/TabSelectorTextToolBar';

const tabs = [
  { id: 'News', route: '/blog', routeState: { blogLayout: 'list', cateogory: 'News' } },
  { id: 'Announcements', route: '/blog', routeState: { blogLayout: 'list', category: 'Announcements' } },
  { id: 'Educational', route: '/blog', routeState: { blogLayout: 'list', category: 'Educational' } },
  { id: 'Calendar', route: '/calendar', routeState: { blogLayout: 'list', category: 'Calendar' } }
].filter(t => t);

const BlogLayoutSelector = props => {
  return <TabSelectorTextToolBar id='BlogLayoutSelector' tabs={tabs} {...props} />;
};

export default BlogLayoutSelector;
