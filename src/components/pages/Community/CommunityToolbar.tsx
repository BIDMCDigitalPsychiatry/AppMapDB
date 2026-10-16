import { Box, Button, Grid, Toolbar, Typography } from '@mui/material';
import { createStyles } from '../../../styles/jss';
import { makeStyles } from '../../../styles/jss';
import { useUserEmail } from '../../layout/hooks';
import InterestedRateApp from './InterestedRateApp';
import { useT } from '../../../i18n';

const spacing = 3;

const useStyles = makeStyles(({ palette }) =>
  createStyles({
    primaryHeaderText: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
      color: palette.text.primary,
      fontSize: 26
    }
  })
);

const CommunityToolbar = ({ title = undefined, subtitle = undefined, showGreeting = false, buttons = [], showInterested = false }) => {
  const t = useT();
  const email = useUserEmail();
  const classes = useStyles();

  const SubTitle = showGreeting ? (
    <Typography variant='body2'>{email ? t('Hello, {{email}}', { email }) : t('Hello')}</Typography>
  ) : subtitle ? (
    <Typography variant='body2'>{t(subtitle)}</Typography>
  ) : (
    <></>
  );

  const showToolbar = title || showGreeting || subtitle || (buttons && buttons.length > 0);

  return (
    <>
      {showToolbar && (
        <>
          <Toolbar disableGutters style={{ marginTop: 16, paddingBottom: 8, display: 'block' }}>
            <Grid alignItems='center' container justifyContent='space-between' spacing={spacing}>
              <Grid item>
                {title && (
                  <Typography color='textPrimary' variant='h4' className={classes.primaryHeaderText}>
                    {t(title)}
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
                          {t(label)}
                        </Button>
                      </Grid>
                    )
                  )}
                </Grid>
              </Grid>
            </Grid>
            {showInterested && (
              <Box mt={1.5}>
                <InterestedRateApp />
              </Box>
            )}
          </Toolbar>
        </>
      )}
    </>
  );
};

export default CommunityToolbar;
