import { Box, Container, Divider } from '@mui/material';
import * as Icons from '@mui/icons-material';
import { useHandleChangeRoute } from '../../layout/hooks';
import useValues from './useValues';
import { publicUrl } from '../../../helpers';
import CommunityToolbar from '../Community/CommunityToolbar';
import TeamMemberCreateForm from './TeamMemberCreateForm';

const TeamMemberEdit = ({ values: Values }) => {
  const handleChangeRoute = useHandleChangeRoute();
  const { values, setValues, loading, errors, handleSave } = useValues({ type: 'edit', values: Values });

  return (
    <Container maxWidth='lg'>
      <CommunityToolbar
        title='Edit Post'
        showGreeting={true}
        buttons={[
          {
            label: 'Cancel',
            onClick: handleChangeRoute(publicUrl('/Community'), prev => ({ ...prev, subRoute: 'team' })),
            color: 'secondary',
            disabled: loading
          },
          {
            label: 'Publish Changes',
            startIcon: <Icons.Save />,
            onClick: handleSave,
            variant: 'contained',
            disabled: loading
          }
        ]}
      />
      <Divider />
      <Box style={{ paddingTop: 48, paddingBottom: 48 }}>
        <TeamMemberCreateForm values={values} setValues={setValues} errors={errors} loading={loading} />
      </Box>
    </Container>
  );
};

export default TeamMemberEdit;
