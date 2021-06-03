import type { FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Box, Divider, Link, Toolbar } from '@material-ui/core';

const BlogNavbar: FC = props => (
  <AppBar elevation={0} style={{ backgroundColor: 'background.paper' }} {...props}>
    <Toolbar style={{ minHeight: 64 }}>
      <RouterLink to='/'>
        {/*<Logo
          sx={{
            height: 40,
            width: 40
          }}
        />*/}
        Logo placeholder
      </RouterLink>
      <Box style={{ flexGrow: 1 }} />
      <Link color='textSecondary' component={RouterLink} to='/' underline='none' variant='body1'>
        Home
      </Link>
      <Link color='textPrimary' component={RouterLink} to='/blog' underline='none' style={{ marginLeft: 16, marginRight: 16 }} variant='body1'>
        Blog
      </Link>
      <Link color='textSecondary' component={RouterLink} to='/contact' underline='none' variant='body1'>
        Contact Us
      </Link>
    </Toolbar>
    <Divider />
  </AppBar>
);

export default BlogNavbar;
