import NewsForumList from '../../pages/Community/NewsForumList';
import Details from '../../pages/Community/Details';
import Create from '../../pages/Community/Create';
import { useRouteState } from '../../layout/store';
import Edit from '../../pages/Community/Edit';
import { Box, Divider } from '@mui/material';
import CommunityCalendarLayout from '../../pages/Community/CommunityCalendarLayout';
import CommunitySelector from './CommunitySelector';
import TeamMemberCreate from '../../pages/Team/TeamMemberCreate';
import TeamMemberEdit from '../../pages/Team/TeamMemberEdit';
import TeamMemberView from '../../pages/Team/TeamMemberView';
import TeamList from '../../pages/Team/TeamList';

const components = {
  create: Create,
  edit: Edit,
  view: Details,
  list: NewsForumList,
  calendar: CommunityCalendarLayout,
  team: TeamList,
  createTeamMember: TeamMemberCreate,
  editTeamMember: TeamMemberEdit,
  viewTeamMember: TeamMemberView
};

const CommunityLayout = () => {
  const [{ subRoute = 'list', category = 'News', ...other } = {}] = useRouteState();
  const Component = components[subRoute];

  return (
    <Box pt={3}>
      <CommunitySelector category={category} subRoute={subRoute} />
      <Divider style={{ marginTop: 16 }} />
      <Component category={category} {...other} />
    </Box>
  );
};

export default CommunityLayout;
