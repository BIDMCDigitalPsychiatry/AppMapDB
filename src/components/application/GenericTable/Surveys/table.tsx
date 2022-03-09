import React from 'react';
import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import { useColumns } from './columns';
import { useSurveyData } from './selectors';
import { Box } from '@mui/material';
import * as Icons from '@mui/icons-material';
import { Grid, Button } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import { useSurveyExport } from './useSurveyExport';
import { renderDialogModule } from '../../GenericDialog/DialogButton';
import * as DeleteSurveyDialog from '../../GenericDialog/DeleteSurvey';

export const name = 'Surveys';

export const defaultApplicationsProps: GenericTableContainerProps = {
  name,
  dialogs: [],
  toolbar: false,
  footer: true,
  search: false
};

const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    primaryButtonDisabled: {
      paddingLeft: 8,
      paddingRight: 8,
      borderRadius: 7,
      cursor: 'auto',
      color: palette.common.white,
      background: palette.primary.dark,
      '&:hover': {
        background: palette.primary.dark
      }
    },
    primaryButton: {
      paddingLeft: 8,
      paddingRight: 8,
      borderRadius: 7,
      color: palette.common.white,
      background: palette.primary.main,
      '&:hover': {
        background: palette.primary.dark
      }
    }
  })
);

export const Surveys = ({ height: Height, ...other }) => {
  const columns = useColumns();
  const { data, handleRefresh } = useSurveyData(name);
  const classes = useStyles();

  const [showArchived, setShowArchived] = React.useState(false);
  const handleExport = useSurveyExport(name,showArchived);
  
  const handleShowArchived = () => setShowArchived(prev => !prev);

  const height = Height - 48;

  return (
    <>
      {renderDialogModule({ ...DeleteSurveyDialog, handleRefresh })}
      <Box p={1}>
        <Grid container spacing={1} justifyContent='flex-end'>
          <Grid item>
            <Button size='small' className={classes.primaryButton} onClick={handleShowArchived}>
              <Icons.Delete style={{ marginRight: 4 }} />
              {showArchived ? 'Hide Archived' : 'Show Archived'}
            </Button>
          </Grid>
          <Grid item>
            <Button size='small' className={classes.primaryButton} onClick={handleExport}>
              <Icons.GetApp style={{ marginRight: 4 }} />
              Export Surveys
            </Button>
          </Grid>
        </Grid>
      </Box>
      <GenericTableContainer
        {...defaultApplicationsProps}
        data={data.filter(r => (showArchived ? r.deleted : !r.deleted))}
        columns={columns}
        showScroll={true}
        height={height}
        {...other}
      />
    </>
  );
};
