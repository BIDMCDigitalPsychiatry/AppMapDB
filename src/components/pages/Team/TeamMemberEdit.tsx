import { Box, Container, Divider } from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import { useHandleChangeRoute } from '../../layout/hooks';
import useValues from './useValues';
import { publicUrl } from '../../../helpers';
import BlogToolbar from '../Blog/BlogToolbar';
import TeamMemberCreateForm from './TeamMemberCreateForm';

const TeamMemberEdit = ({ values: Values }) => {
  const handleChangeRoute = useHandleChangeRoute();
  const { values, setValues, loading, errors, handleSave } = useValues({ type: 'edit', values: Values });

  return (
    <Container maxWidth='lg'>
      <BlogToolbar
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
