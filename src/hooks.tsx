import { useTheme, useMediaQuery } from '@material-ui/core';

export const useFullScreen = () => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('sm'));
};
