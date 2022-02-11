import { Button, Grid, Toolbar, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
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

const CommunityToolbar = ({ title = undefined, subtitle = undefined, showGreeting = false, buttons = [] }) => {
  const email = useUserEmail();
  const classes = useStyles();

  const SubTitle = showGreeting ? (
    <Typography variant='body2'>{email ? `Hello, ${email}` : 'Hello'}</Typography>
  ) : subtitle ? (
    <Typography variant='body2'>{subtitle}</Typography>
  ) : (
    <></>
  );

  const showToolbar = title || showGreeting || subtitle || (buttons && buttons.length > 0);

  return (
    <>
      {showToolbar && (
        <Toolbar disableGutters style={{ marginTop: 16, paddingBottom: 16 }}>
          <Grid alignItems='center' container justifyContent='space-between' spacing={spacing}>
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
                {buttons.map(
                  ({ label, color = 'primary', size = 'large', startIcon = undefined, variant = 'outlined', onClick = undefined, ...other }: any) => (
                    <Grid item key={label}>
                      <Button color={color} size={size} startIcon={startIcon} onClick={onClick} variant='outlined' {...other}>
                        {label}
                      </Button>
                    </Grid>
                  )
                )}
              </Grid>
            </Grid>
          </Grid>
        </Toolbar>
      )}
    </>
  );
};

export default CommunityToolbar;
