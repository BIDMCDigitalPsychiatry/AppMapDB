import React from 'react';
import { Box, Container, Divider } from '@mui/material';
import * as Icons from '@mui/icons-material';
import CreateForm from '../../pages/Community/CreateForm';
import { useHandleChangeRoute } from '../../layout/hooks';
import CommunityToolbar from './CommunityToolbar';
import useValues from './useValues';
import { publicUrl } from '../../../helpers';

const Edit = ({ values: Values }) => {
  const handleChangeRoute = useHandleChangeRoute();
  const { values, setValues, errors, handleSave } = useValues({ type: 'edit', values: Values });

  return (
    <Container maxWidth='lg'>
      <CommunityToolbar
        title='Edit Post'
        showGreeting={true}
        buttons={[
          {
            label: 'Cancel',
            onClick: handleChangeRoute(publicUrl('/Community'), prev => ({ ...prev, subRoute: 'list' })),
            color: 'secondary'
          },
          {
            label: 'Publish Changes',
            startIcon: <Icons.Save />,
            onClick: handleSave,
            variant: 'contained'
          }
        ]}
      />
      <Divider />
      <Box style={{ paddingTop: 48, paddingBottom: 48 }}>
        <CreateForm values={values} setValues={setValues} errors={errors} />
      </Box>
    </Container>
  );
};

export default Edit;
