import { createTheme, Theme, adaptV4Theme } from '@mui/material/styles';
import { notoSans, lato } from './fonts';
import { blue, cyan, deepOrange, red, green, grey, indigo, lime, pink, purple, yellow } from '@mui/material/colors';
import { onlyUnique } from './helpers';
import {
  ClinicalFoundationQuestions,
  CostQuestions,
  DeveloperTypeQuestions,
  EngagementQuestions,
  TreatmentApproachQuestions,
  FeatureQuestions,
  FunctionalityQuestions,
  InputQuestions,
  OutputQuestions,
  PrivacyQuestions,
  UseQuestions
} from './database/models/Application';

export const googlePlayProxyUrl = 'https://ke22op7ylg.execute-api.us-east-1.amazonaws.com/default/app-map-db';
//export const googlePlayProxyUrl = 'https://us-central1-greenlink.cloudfunctions.net/function-1';

const basetheme = createTheme(adaptV4Theme({}));
export const beta = true;

const themeProps = {
  palette: {
    mode: 'light',
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
  layout: {
    drawerPaths: ['/Apps', '/Home', '/', ''], // Routes where the drawer should be shown
    leftDrawerWidth: 296, //The width of the left nav drawer
    toolbarheight: 64, //The height of the top toolbar
    contentpadding: 8, //The padding around the inner layout content
    contentrowspacing: 2, //the spacing between each row of content (toolbar, filterbar, table, etc)
    tablefooterheight: 20, //The height of the table footer
    tablefilterbarheight: 52, //The height of the table filter selector (category selector)
    tabletoolbarheight: 88, // The height of the top bar on the table, also the height of the secondary tabselector
    tableRowHeight: 48, // Height of table rows
    footerheight: 24, //The height of the bottom toolbar
    progressSize: 80, // size of the circulatr progress indicator shown when dialogs are submitting
    tabheight: 116, // Height of the nav pills tab section
    footerHeight: 186 //v2 footer
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        '@font-face': [lato, notoSans]
      }
    },
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

export const adminTheme = createTheme(
  adaptV4Theme({
    ...themeProps,
    palette: {
      ...themeProps.palette,
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
  })
);

/* ---------------------------------------------------------------------------
 * Public-facing theme — modernized refresh of the existing brand (same
 * primary blue + Lato, updated shape/typography/component styling).
 *
 * Admin mode intentionally does NOT get this: useLayoutTheme (helpers.tsx)
 * returns adminTheme above, which is still built from the legacy themeProps,
 * so volunteer/admin screens render exactly as before.
 * ------------------------------------------------------------------------- */
const publicThemeProps = {
  ...themeProps,
  palette: {
    ...themeProps.palette,
    background: {
      default: '#F7F9FC',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#1F2937',
      secondary: '#5B6472'
    },
    divider: '#E5EAF0'
  },
  shape: {
    borderRadius: 10
  },
  typography: {
    ...themeProps.typography,
    fontWeightMedium: 600,
    h1: { fontWeight: 700, fontSize: '2.25rem', lineHeight: 1.2 },
    h2: { fontWeight: 700, fontSize: '1.875rem', lineHeight: 1.25 },
    h3: { fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.3 },
    h4: { fontWeight: 700, fontSize: '1.25rem', lineHeight: 1.35 },
    h5: { fontWeight: 700, fontSize: '1.125rem', lineHeight: 1.4 },
    h6: { fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 },
    subtitle1: { lineHeight: 1.4 },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.55 }
  },
  overrides: {
    ...themeProps.overrides,
    MuiButton: {
      root: {
        borderRadius: 8,
        fontWeight: 600,
        paddingLeft: 16,
        paddingRight: 16
      },
      contained: {
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 2px 6px rgba(16, 24, 40, 0.15)'
        }
      }
    },
    MuiPaper: {
      rounded: {
        borderRadius: 12
      }
    },
    MuiCard: {
      root: {
        borderRadius: 14,
        border: '1px solid #E5EAF0',
        boxShadow: '0 1px 3px rgba(16, 24, 40, 0.06)'
      }
    },
    MuiChip: {
      root: {
        borderRadius: 8,
        fontWeight: 500
      }
    },
    MuiOutlinedInput: {
      root: {
        borderRadius: 10
      }
    },
    MuiTab: {
      root: {
        textTransform: 'none',
        fontWeight: 600
      }
    },
    MuiTooltip: {
      tooltip: {
        maxWidth: 700,
        borderRadius: 8,
        fontSize: '0.8rem',
        padding: '8px 12px',
        backgroundColor: 'rgba(31, 41, 55, 0.96)'
      }
    }
  }
} as Theme & any;

export const theme = createTheme(adaptV4Theme(publicThemeProps));

const colorLevel = 700;

export const categories = {
  Cost: {
    label: 'Cost',
    color: green[colorLevel],
    values: ({ costs = [] }) => costs.filter(onlyUnique),
    valueItems: ({ costs = [] }) => costs.filter(onlyUnique).map(label => ({ label, tooltip: CostQuestions.find(cq => cq.value === label)?.tooltip }))
  },
  Privacy: {
    label: 'Privacy',
    color: pink[400],
    values: ({ privacies = [] }) => privacies.filter(onlyUnique),
    valueItems: ({ privacies = [] }) =>
      privacies.filter(onlyUnique).map(label => ({ label, tooltip: PrivacyQuestions.find(cq => cq.value === label)?.tooltip }))
  },
  ClinicalFoundations: {
    label: 'Clinical Foundation',
    color: indigo[colorLevel],
    values: ({ clinicalFoundations = [] }) => clinicalFoundations.filter(onlyUnique),
    valueItems: ({ clinicalFoundations = [] }) =>
      clinicalFoundations.filter(onlyUnique).map(label => ({ label, tooltip: ClinicalFoundationQuestions.find(cq => cq.value === label)?.tooltip }))
  },
  TreatmentApproaches: {
    label: 'Treatment Approach',
    color: red[colorLevel],
    values: ({ treatmentApproaches = [] }) => treatmentApproaches.filter(onlyUnique),
    valueItems: ({ treatmentApproaches = [] }) =>
      treatmentApproaches.filter(onlyUnique).map(label => ({ label, tooltip: TreatmentApproachQuestions.find(cq => cq.value === label)?.tooltip }))
  },
  Features: {
    label: 'Features',
    color: green[colorLevel],
    values: ({ features = [] }) => features.filter(onlyUnique),
    valueItems: ({ features = [] }) => features.filter(onlyUnique).map(label => ({ label, tooltip: FeatureQuestions.find(cq => cq.value === label)?.tooltip }))
  },
  Conditions: {
    label: 'Conditions Supported',
    color: purple[colorLevel],
    values: ({ conditions = [] }) => conditions.filter(onlyUnique),
    valueItems: ({ conditions = [] }) => conditions.filter(onlyUnique).map(label => ({ label }))
  },
  Engagements: {
    label: 'Engagements',
    color: lime[colorLevel],
    values: ({ engagements = [] }) => engagements.filter(onlyUnique),
    valueItems: ({ engagements = [] }) =>
      engagements.filter(onlyUnique).map(label => ({ label, tooltip: EngagementQuestions.find(cq => cq.value === label)?.tooltip }))
  },
  Inputs: {
    label: 'Inputs',
    color: yellow[colorLevel],
    values: ({ inputs = [] }) => inputs.filter(onlyUnique),
    valueItems: ({ inputs = [] }) => inputs.filter(onlyUnique).map(label => ({ label, tooltip: InputQuestions.find(cq => cq.value === label)?.tooltip }))
  },
  Outputs: {
    label: 'Outputs',
    color: deepOrange[400],
    values: ({ outputs = [] }) => outputs.filter(onlyUnique),
    valueItems: ({ outputs = [] }) => outputs.filter(onlyUnique).map(label => ({ label, tooltip: OutputQuestions.find(cq => cq.value === label)?.tooltip }))
  },
  Uses: {
    label: 'Uses',
    color: cyan[colorLevel],
    values: ({ uses = [] }) => uses.filter(onlyUnique),
    valueItems: ({ uses = [] }) => uses.filter(onlyUnique).map(label => ({ label, tooltip: UseQuestions.find(cq => cq.value === label)?.tooltip }))
  },
  DeveloperTypes: {
    label: 'Developer Types',
    color: grey[colorLevel],
    values: ({ developerTypes = [] }) => developerTypes.filter(onlyUnique),
    valueItems: ({ developerTypes = [] }) =>
      developerTypes.filter(onlyUnique).map(label => ({ label, tooltip: (DeveloperTypeQuestions as any).find(cq => cq.value === label)?.tooltip }))
  },
  Functionalities: {
    label: 'Access',
    color: blue[colorLevel],
    values: ({ functionalities = [] }) => functionalities.filter(onlyUnique),
    valueItems: ({ functionalities = [] }) =>
      functionalities.filter(onlyUnique).map(label => ({ label, tooltip: FunctionalityQuestions.find(cq => cq.value === label)?.tooltip }))
  }
};

export const categoryArray = Object.keys(categories).map(k => categories[k]);
