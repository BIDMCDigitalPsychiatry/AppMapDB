import React from 'react';
import { Box, Button, Container, Grid, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import PlusIcon from '../../icons/Plus';
import SearchIcon from '../../icons/Search';
import { useDefaultValues } from '../../../database/models/Post';
import { useHandleChangeRoute } from '../../layout/hooks';
import CommunityToolbar from './CommunityToolbar';
import * as Icons from '@mui/icons-material';
import { searchPosts, sortPosts } from './helpers';
import { useIsAdmin } from '../../../hooks';
import { usePosts } from '../../../database/usePosts';
import { bool, publicUrl } from '../../../helpers';
import useSortOptions from '../../../utils/useSortOptions';
import { NewsForum } from '../../application/GenericTable/NewsForum/table';

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

const NewsForumList = ({ category = 'News' }) => {
  const classes = useStyles({});
  const { posts, handleRefresh } = usePosts();

  const { sortOption, handleToggleSortDirection, sortLabel, SortOptionIcon } = useSortOptions();

  const [search, setSearch] = React.useState('');
  const [showArchived, setShowArchived] = React.useState(false);
  const isAdmin = useIsAdmin();

  const handleSearch = React.useCallback(event => setSearch(event?.target?.value), [setSearch]);
  const handleClearSearch = React.useCallback(() => setSearch(''), [setSearch]);

  const handleChangeRoute = useHandleChangeRoute();

  React.useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleToggleShowArchived = (): void => {
    setShowArchived(prev => !prev);
  };

  const values = useDefaultValues({ category });

  const ArchiveIcon = !showArchived ? Icons.VisibilityOff : Icons.Visibility;

  const filtered = sortPosts(
    searchPosts(
      Object.keys(posts)
        .filter(
          k => (isAdmin || (!isAdmin && !bool(posts[k]?.adminOnly))) && posts[k].category === category && (showArchived ? posts[k].deleted : !posts[k].deleted)
        )
        .map(k => posts[k]),
      search
    ),
    sortOption
  );

  return (
    <Container maxWidth='lg'>
      <CommunityToolbar
        title={category}
        subtitle='Keep up to date with the latest news and community resources.'
        buttons={
          isAdmin
            ? [
                {
                  label: 'Add new post',
                  onClick: handleChangeRoute(publicUrl('/Community'), prev => ({ ...prev, subRoute: 'create', values })),
                  startIcon: <PlusIcon fontSize='small' />
                }
              ]
            : []
        }
      />

      <Box py={0}>
        <Grid container justifyContent='space-between' alignItems='center'>
          <Grid item>
            <Box style={{ width: 500 }}>
              <TextField
                onChange={handleSearch}
                value={search}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <SearchIcon fontSize='small' />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position='start'>
                      <IconButton style={{ padding: 8, marginRight: -16 }} onClick={handleClearSearch} size='large'>
                        <Icons.Clear fontSize='small' />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                size='small'
                placeholder='Search posts'
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
              <Grid item>
                <Button color='primary' onClick={handleToggleSortDirection} size='small' startIcon={<SortOptionIcon fontSize='small' />} variant='text'>
                  {sortLabel}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Box mt={2} mb={2}>
          <Grid container>
            {showArchived && (
              <Grid item xs={12} className={classes.archiveBanner}>
                <Typography variant='h6' style={{ color: 'white' }}>
                  {`Viewing Archived Posts`}
                </Typography>
              </Grid>
            )}
            {filtered.length === 0 ? (
              <Box m={3}>
                <Typography variant='h6' color='textSecondary' align='center'>
                  {`There are no ${showArchived ? 'archived posts' : 'posts'} to view at this time.`}
                </Typography>
              </Box>
            ) : (
              <NewsForum data={filtered} />
            )}
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default NewsForumList;
