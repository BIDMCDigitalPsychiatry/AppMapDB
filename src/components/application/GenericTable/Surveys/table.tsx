import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import { useColumns } from './columns';
import { useSurveyData } from './selectors';
import { Box } from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import { makeStyles, createStyles, Grid, Button } from '@material-ui/core';
import { useHandleExport } from '../../../../database/hooks';
import { tables } from '../../../../database/dbConfig';

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
  const data = useSurveyData(name);
  const classes = useStyles();

  const handleExport = useHandleExport(data, columns);

  const handleClick = () => handleExport(false, tables.surveys);

  const height = Height - 48;
  return (
    <>
      <Box p={1}>
        <Grid container spacing={1} justify='flex-end'>
          <Grid item>
            <Button size='small' className={classes.primaryButton} onClick={handleClick}>
              <Icons.GetApp style={{ marginRight: 4 }} />
              Export Surveys Database
            </Button>
          </Grid>
        </Grid>
      </Box>
      <GenericTableContainer {...defaultApplicationsProps} data={data} columns={columns} showScroll={true} height={height} {...other} />
    </>
  );
};
