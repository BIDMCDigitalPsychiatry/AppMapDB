import React from 'react';
import { Box, Button, Container, createStyles, Grid, IconButton, InputAdornment, makeStyles, TextField, Typography } from '@material-ui/core';
import PlusIcon from '../../icons/Plus';
import SearchIcon from '../../icons/Search';
import { useDefaultValues } from '../../../database/models/Team';
import { useHandleChangeRoute } from '../../layout/hooks';
import * as Icons from '@material-ui/icons';
import { searchRows, sortRows } from './helpers';
import { useIsAdmin } from '../../../hooks';
import { bool, publicUrl } from '../../../helpers';
import useSortOptions from '../../hooks/useSortOptions';
import BlogToolbar from '../Blog/BlogToolbar';
import { tables } from '../../../database/dbConfig';
import { useRows } from '../../../database/useRows';
import { TeamMembers } from '../../application/GenericTable/TeamMembers/table';
import TeamMemberGridItem, { TeamMemberGridItemSortKey } from '../../application/GenericTable/TeamMembers/TeamMemberGridItem';

const useStyles = makeStyles(theme =>
  createStyles({
    archiveBanner: {
      padding: 16,
      margin: 24,
      borderRadius: 12,
      color: theme.palette.common.white,
      background: theme.palette.error.main
    }
  })
);

const TeamList = () => {
  const classes = useStyles({});
  const { rows, handleRefresh } = useRows({ table: tables.team });

  const { sortOption } = useSortOptions();

  const [search, setSearch] = React.useState('');
  const [showArchived, setShowArchived] = React.useState(false);
  const [showSortKeys, setShowSortKeys] = React.useState(false);
  const isAdmin = useIsAdmin();

  const handleSearch = React.useCallback(event => setSearch(event?.target?.value), [setSearch]);
  const handleClearSearch = React.useCallback(() => setSearch(''), [setSearch]);

  const handleChangeRoute = useHandleChangeRoute();

  React.useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleToggleShowArchived = (): void => setShowArchived(prev => !prev);
  const handleToggleShowSortKeys = (): void => setShowSortKeys(prev => !prev);

  const values = useDefaultValues();

  const ArchiveIcon = !showArchived ? Icons.VisibilityOff : Icons.Visibility;

  const filtered = sortRows(
    searchRows(
      Object.keys(rows)
        .filter(k => (isAdmin || (!isAdmin && !bool(rows[k]?.adminOnly))) && (showArchived ? rows[k].deleted : !rows[k].deleted))
        .map(k => rows[k]),
      search
    ),
    sortOption
  );

  return (
    <Container maxWidth='lg'>
      <BlogToolbar
        title='Team Members'
        subtitle='Meet our team'
        buttons={
          isAdmin
            ? [
                {
                  label: 'Add new team member',
                  onClick: handleChangeRoute(publicUrl('/Community'), prev => ({ ...prev, subRoute: 'createTeamMember', values })),
                  startIcon: <PlusIcon fontSize='small' />
                }
              ]
            : []
        }
      />
      <Box py={0}>
        <Grid container justify='space-between' alignItems='center'>
          <Grid item>
            <Box style={{ width: 500 }}>
              <TextField
                onChange={handleSearch}
                value={search}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <SearchIcon fontSize='small' />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position='start'>
                      <IconButton style={{ padding: 8, marginRight: -16 }} onClick={handleClearSearch}>
                        <Icons.Clear fontSize='small' />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                size='small'
                placeholder='Search team members'
                variant='outlined'
              />
            </Box>
          </Grid>
          <Grid item>
            <Grid container spacing={2}>
              {isAdmin && (
                <Grid item>
                  <Button color='primary' onClick={handleToggleShowArchived} size='small' startIcon={<ArchiveIcon fontSize='small' />} variant='text'>
                    {showArchived ? 'Hide Archived' : 'Show Archived'}
                  </Button>
                </Grid>
              )}
              {isAdmin && (
                <Grid item>
                  <Button color='primary' onClick={handleToggleShowSortKeys} size='small' startIcon={<ArchiveIcon fontSize='small' />} variant='text'>
                    {showSortKeys ? 'Hide Sort Keys' : 'Show Sort Keys'}
                  </Button>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
        <Box mt={6} mb={6} pl={2} pr={2}>
          <Grid container spacing={6}>
            {showArchived && (
              <Grid item xs={12} className={classes.archiveBanner}>
                <Typography variant='h6' style={{ color: 'white' }}>
                  {`Viewing Archived`}
                </Typography>
              </Grid>
            )}
            {filtered.length === 0 ? (
              <Box m={3}>
                <Typography variant='h6' color='textSecondary' align='center'>
                  {`There are no ${showArchived ? 'archived items' : 'items'} to view at this time.`}
                </Typography>
              </Box>
            ) : (
              <TeamMembers handleRefresh={handleRefresh} data={filtered} GridItem={isAdmin && showSortKeys ? TeamMemberGridItemSortKey : TeamMemberGridItem} />
            )}
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default TeamList;
