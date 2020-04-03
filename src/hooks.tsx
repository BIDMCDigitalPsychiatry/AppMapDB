import { useTheme, useMediaQuery } from '@material-ui/core';
import { useSelector } from 'react-redux';

export const useFullScreen = (size = 'sm' as any) => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down(size));
};

export const useSignedIn = () => {
  const isEmpty = useSelector((s: any) => s.firebase.auth.isEmpty);
  const isLoaded = useSelector((s: any) => s.firebase.auth.isLoaded);
  return isLoaded && !isEmpty ? true : false;
};
