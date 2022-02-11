import { Tooltip, Theme } from '@mui/material';

import withStyles from '@mui/styles/withStyles';

const LightTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    ...theme.typography.body2,
    backgroundColor: theme.palette.common.white,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[1]
  }
}))(Tooltip) as any;

export default LightTooltip;
