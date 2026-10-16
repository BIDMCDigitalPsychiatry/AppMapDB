import { Box, Container, Divider } from '@mui/material';
import * as Icons from '@mui/icons-material';
import { useHandleChangeRoute } from '../../layout/hooks';
import useValues from './useValues';
import { publicUrl } from '../../../helpers';
import TeamMemberCreateForm from './TeamMemberCreateForm';
import CommunityToolbar from '../Community/CommunityToolbar';
import { tx } from '../../../i18n';

const TeamMemberCreate = () => {
  const handleChangeRoute = useHandleChangeRoute();
  const { values, setValues, errors, loading, handleSave } = useValues({ type: 'create' });

  return (
    <Container maxWidth='lg'>
      <CommunityToolbar
        title={tx('Create Team Member')}
        showGreeting={true}
        buttons={[
          {
            label: tx('Cancel'),
            onClick: handleChangeRoute(publicUrl('/Community'), prev => ({ ...prev, subRoute: 'team' })),
            color: 'secondary',
            disabled: loading
          },
          {
            label: tx('Publish Changes'),
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

export default TeamMemberCreate;
