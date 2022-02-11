import BlogPostList from '../../pages/Blog/BlogPostList';
import BlogPostDetails from '../../pages/Blog/BlogPostDetails';
import BlogPostCreate from '../../pages/Blog/BlogPostCreate';
import { useRouteState } from '../../layout/store';
import BlogPostEdit from '../../pages/Blog/BlogPostEdit';
import { Box, Divider } from '@mui/material';
import BlogCalendar from '../../pages/Blog/BlogCalendar';
import BlogLayoutSelector from './BlogLayoutSelector';
import TeamMemberCreate from '../../pages/Team/TeamMemberCreate';
import TeamMemberEdit from '../../pages/Team/TeamMemberEdit';
import TeamMemberView from '../../pages/Team/TeamMemberView';
import TeamList from '../../pages/Team/TeamList';

const components = {
  create: BlogPostCreate,
  edit: BlogPostEdit,
  view: BlogPostDetails,
  list: BlogPostList,
  calendar: BlogCalendar,
  team: TeamList,
  createTeamMember: TeamMemberCreate,
  editTeamMember: TeamMemberEdit,
  viewTeamMember: TeamMemberView
};

const BlogLayout = () => {
  const [{ subRoute = 'list', category = 'News', ...other } = {}] = useRouteState();
  const BlogComponent = components[subRoute];

  return (
    <Box pt={3}>
      <BlogLayoutSelector category={category} />
      <Divider style={{ marginTop: 16 }} />
      <BlogComponent category={category} {...other} />
    </Box>
  );
};

export default BlogLayout;
