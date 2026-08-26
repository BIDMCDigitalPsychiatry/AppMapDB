import { Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';
import Routes from './routes';
import { ConnectedRouter } from 'connected-react-router';
import { AppState } from '../../store';
import { connect } from 'react-redux';
import Layout from './Layout';
import useLogRocketUser from './useLogRocketUser';
import VersionSelector from './VersionSelector';
import PwaLayout from '../pwa/PwaLayout';
import Pwa from '../pwa/Pwa';
import { publicUrl } from '../../helpers';

export interface AppRouterProps {
  history?: any;
}

function AppRouter(props: AppRouterProps) {
  const { history } = props;
  useLogRocketUser();
  var pathname = window.location?.pathname;
  const isPwa = pathname?.toLowerCase()?.startsWith('/pwa') ? true : false;

  return (
    // @ts-ignore
    <ConnectedRouter history={history}>
      {isPwa ? (
        <PwaLayout>
          <Pwa />
        </PwaLayout>
      ) : (
        <VersionSelector>
          <Layout>
            {/* Fallback for the lazy-loaded route chunks (see routes.tsx) */}
            <Suspense
              fallback={
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                  <CircularProgress />
                </Box>
              }
            >
              <Routes />
            </Suspense>
          </Layout>
        </VersionSelector>
      )}
    </ConnectedRouter>
  );
}

const mapStateToProps = (state: AppState, ownProp: AppRouterProps): AppRouterProps => {
  var history = ownProp.history;
  const location = state && state.router && state.router.location; //location from redux store (previously persisted location)
  // Honor an explicit deep link: only restore the persisted location when the
  // browser arrived at the root. Unconditionally overriding meant a URL like
  // /RegisteredUsers (opened in a new tab) was silently replaced by wherever
  // the user last was.
  const browserPath = history?.location?.pathname;
  const atRoot = !browserPath || browserPath === '/' || browserPath === publicUrl('/');
  history.location = atRoot && location ? location : history.location;
  return { history };
};

export default connect(mapStateToProps)(AppRouter);
