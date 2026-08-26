import * as React from 'react';
import { GlobalStyles, useTheme } from '@mui/material';
import { lato, notoSans } from '../../fonts';

/*
 * Custom CSS baseline (the app's take on MUI's CssBaseline), rendered through
 * emotion's GlobalStyles since the JSS/@mui/styles retirement. The @font-face
 * registrations moved here from the theme's MuiCssBaseline override — they
 * only ever existed there to ride JSS's @global merging, which is gone.
 */

export const html = {
  WebkitFontSmoothing: 'antialiased', // Antialiasing.
  MozOsxFontSmoothing: 'grayscale' // Antialiasing.
  //boxSizing: 'border-box', // Custom, remove box sizing as it affects child layout height calculations
};

export const body = theme => ({
  color: theme.palette.text.primary,
  ...theme.typography.body2,
  backgroundColor: theme.palette.background.default,
  '@media print': {
    // Save printer ink.
    backgroundColor: theme.palette.common.white
  }
});

export default function CssBaseline({ children = null }) {
  const theme = useTheme();
  return (
    <React.Fragment>
      {/* One GlobalStyles per @font-face: emotion (unlike JSS) collapses an
          array under a single '@font-face' key into one rule, silently
          dropping the rest — which unregisters Lato sitewide. */}
      <GlobalStyles styles={{ '@font-face': lato } as any} />
      <GlobalStyles styles={{ '@font-face': notoSans } as any} />
      <GlobalStyles
        styles={{
          html,
          '*, *::before, *::after': {
            boxSizing: 'inherit'
          },
          'strong, b': {
            fontWeight: theme.typography.fontWeightBold
          },
          body: {
            margin: 0, // Remove the margin in all browsers.
            ...body(theme),
            // Add support for document.body.requestFullScreen().
            // Other elements, if background transparent, are not supported.
            '&::backdrop': {
              backgroundColor: theme.palette.background.default
            }
          }
        }}
      />
      {children}
    </React.Fragment>
  );
}
