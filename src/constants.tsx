import { createMuiTheme, Theme } from '@material-ui/core/styles';

const basetheme = createMuiTheme({});

export const theme = createMuiTheme({
  layout: {
    toolbarheight: 132, //The height of the top toolbar
    contentpadding: 8, //The padding around the inner layout content
    contentrowspacing: 2, //the spacing between each row of content (toolbar, filterbar, table, etc)
    tablefooterheight: 20, //The height of the table footer
    tablefilterbarheight: 52, //The height of the table filter selector (category selector)
    tabletoolbarheight: basetheme.spacing(5.5), // The height of the top bar on the table, also the height of the secondary tabselector
    tableRowHeight: basetheme.spacing(6), // Height of table rows
    footerheight: 24, //The height of the bottom toolbar
    progressSize: 80, // size of the circulatr progress indicator shown when dialogs are submitting
  },
  overrides: {
    MuiTooltip: {
      // Name of the component ⚛️ / style sheet
      tooltip: {
        // Name of the rule
        maxWidth: 700,
      },
    },
    MuiTypography: {
      // Name of the component ⚛️ / style sheet
      h6: {
        lineHeight: 1.2,
      },
      subtitle1: {
        // Name of the rule
        lineHeight: 1.4,
        //background: basetheme.palette.background.default,
      },
    },
    MuiDialogTitle: {
      // Name of the component ⚛️ / style sheet
      root: {
        // Name of the rule
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 12,
        paddingBottom: 12,
        //background: basetheme.palette.background.default,
      },
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
        padding: '8px 4px',
        //padding: 0,
      },
    },
    MuiListItemIcon: {
      root: {
        color: basetheme.palette.grey[100],
      },
    },
  },
} as Theme & any);
