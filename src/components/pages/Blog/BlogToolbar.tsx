import { Button, createStyles, Grid, makeStyles, Toolbar, Typography } from '@material-ui/core';
import { useUserEmail } from '../../layout/hooks';

const spacing = 3;

const useStyles = makeStyles(({ palette }) =>
  createStyles({
    primaryHeaderText: {
      fontWeight: 900,
      color: palette.primary.dark,
      fontSize: 30
    }
  })
);

const BlogToolbar = ({ title = undefined, subtitle = undefined, showGreeting = false, buttons = [] }) => {
  const email = useUserEmail();
  const classes = useStyles();

  const SubTitle = showGreeting ? (
    <Typography variant='body2'>{email ? `Hello, ${email}` : 'Hello'}</Typography>
  ) : subtitle ? (
    <Typography variant='body2'>{subtitle}</Typography>
  ) : (
    <></>
  );

  return (
    <Toolbar disableGutters style={{ paddingBottom: 16 }}>
      <Grid alignItems='center' container justify='space-between' spacing={spacing}>
        <Grid item>
          {title && (
            <Typography color='textPrimary' variant='h4' className={classes.primaryHeaderText}>
              {title}
            </Typography>
          )}
          {SubTitle}
        </Grid>
        <Grid item>
          <Grid container spacing={spacing}>
            {buttons.map(({ label, color = 'primary', size = 'large', startIcon = undefined, variant = 'outlined', onClick = undefined, ...other }: any) => (
              <Grid item>
                <Button color={color} size={size} startIcon={startIcon} onClick={onClick} variant='outlined' {...other}>
                  {label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Toolbar>
  );
};

export default BlogToolbar;
