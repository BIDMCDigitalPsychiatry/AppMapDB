import { createMuiTheme, Theme } from '@material-ui/core/styles';
import { notoSans, lato } from './fonts';

export const googlePlayProxyUrl = 'https://ke22op7ylg.execute-api.us-east-1.amazonaws.com/default/app-map-db';
//export const googlePlayProxyUrl = 'https://us-central1-greenlink.cloudfunctions.net/function-1';

const basetheme = createMuiTheme({});
export const beta = true;

const shared = {
  palette: {
    type: 'light'
  },
  layout: {
    drawerPaths: ['/Apps'], // Routes where the drawer should be shown
    leftDrawerWidth: 280, //The width of the left nav drawer
    toolbarheight: 64, //The height of the top toolbar
    contentpadding: 8, //The padding around the inner layout content
    contentrowspacing: 2, //the spacing between each row of content (toolbar, filterbar, table, etc)
    tablefooterheight: 20, //The height of the table footer
    tablefilterbarheight: 52, //The height of the table filter selector (category selector)
    tabletoolbarheight: basetheme.spacing(5.5) * 2, // The height of the top bar on the table, also the height of the secondary tabselector
    tableRowHeight: basetheme.spacing(6), // Height of table rows
    footerheight: 24, //The height of the bottom toolbar
    progressSize: 80, // size of the circulatr progress indicator shown when dialogs are submitting
    tabheight: 116, // Height of the nav pills tab section
    footerHeight: 186 //v2 footer
  },
  overrides: {
    MuiTooltip: {
      // Name of the component ⚛️ / style sheet
      tooltip: {
        // Name of the rule
        maxWidth: 700
      }
    },
    MuiTypography: {
      // Name of the component ⚛️ / style sheet
      h6: {
        lineHeight: 1.2
      },
      subtitle1: {
        // Name of the rule
        lineHeight: 1.4
        //background: basetheme.palette.background.default,
      }
    },
    MuiDialogTitle: {
      // Name of the component ⚛️ / style sheet
      root: {
        // Name of the rule
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 12,
        paddingBottom: 12
        //background: basetheme.palette.background.default,
      }
    },
    MuiDialogActions: {
      // Name of the component ⚛️ / style sheet
      root: {
        // Name of the rule
        background: basetheme.palette.grey[100],

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        flex: '0 0 auto',
        margin: 0,
        padding: '8px 4px'
        //padding: 0,
      }
    },
    MuiListItemIcon: {
      root: {
        color: basetheme.palette.grey[100]
      }
    }
  }
} as Theme & any;

const sharedV2 = {
  ...shared,
  palette: {
    ...shared.palette,
    primary: {
      main: '#2278CF',
      light: '#38B6FF',
      dark: '#0C4476'
    },
    secondary: {
      main: '#737373',
      light: '#F2F2F2',
      dark: '#2C2A2C'
    }
  },
  typography: {
    fontFamily: 'Lato',
    button: {
      textTransform: 'none'
    }
  },
  overrides: {
    ...shared.overrides,
    MuiCssBaseline: {
      '@global': {
        '@font-face': [lato, notoSans]
      }
    }
  }
} as Theme & any;

export const adminTheme = createMuiTheme({
  ...shared,
  palette: {
    ...shared.palette,
    primary: {
      main: '#c62828',
      light: '#ff5f52',
      dark: '#8e0000'
    },
    secondary: {
      main: '#388e3c',
      light: '#6abf69',
      dark: '#00600f'
    }
  }
});

export const adminThemeV2 = createMuiTheme({
  ...sharedV2,
  palette: {
    ...sharedV2.palette,
    primary: {
      main: '#c62828',
      light: '#ff5f52',
      dark: '#8e0000'
    },
    secondary: {
      main: '#388e3c',
      light: '#6abf69',
      dark: '#00600f'
    }
  }
});

export const theme = createMuiTheme(shared);
export const themeV2 = createMuiTheme(sharedV2);
