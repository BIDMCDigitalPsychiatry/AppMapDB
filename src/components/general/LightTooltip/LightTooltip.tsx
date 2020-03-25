import { Tooltip, withStyles, Theme } from '@material-ui/core';

const LightTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[1]
  }
}))(Tooltip);

export default LightTooltip;
