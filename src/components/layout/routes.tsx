import { lazy } from 'react';
import { Route, Switch } from 'react-router';
import Apps from '../pages/Apps';
import ViewApp from '../pages/ViewApp';
import { publicUrl } from '../../helpers';

/*
 * Route-level code splitting (PLAN_MODERNIZATION.md §3): the public library
 * (Apps) and the app detail page stay in the main bundle — they are the
 * landing experience. Everything else (admin tools, rating wizard, community,
 * surveys) loads on navigation, so first paint doesn't ship code most
 * visitors never use. The upstream <Suspense> in AppRouter shows the
 * existing fallback while a chunk loads.
 */
const RatingProcess = lazy(() => import('../pages/RatingProcess'));
const MyRatings = lazy(() => import('../pages/MyRatings/MyRatings'));
const PlayGround = lazy(() => import('./PlayGround'));
const FrameworkQuestions = lazy(() => import('../pages/FrameWorkQuestions/FrameworkQuestions'));
const RateNewAppIntro = lazy(() => import('../pages/RateNewAppIntro'));
const RateNewApp = lazy(() => import('../pages/RateNewApp/RateNewApp'));
const RateExistingApp = lazy(() => import('../pages/RateNewApp/RateNewApp').then(m => ({ default: m.RateExistingApp })));
const RateAnApp = lazy(() => import('../pages/RateAnApp'));
const Admin = lazy(() => import('../pages/Admin/Admin'));
const RegisteredUsers = lazy(() => import('../pages/Admin/RegisteredUsers'));
const CommunityLayout = lazy(() => import('../pages/Community/CommunityLayout'));
const Survey = lazy(() => import('../pages/Survey/Survey'));
const SurveyFollowUp = lazy(() => import('../pages/Survey/SurveyFollowUp'));

const Routes = () => {
  return (
    <Switch>
      <Route exact path={'/'} children={<Apps />} />
      <Route exact path={publicUrl('/')} children={<Apps />} />
      <Route exact path={publicUrl('/Home')} children={<Apps />} />
      <Route exact path={publicUrl('/Admin')} children={<Admin />} />
      <Route exact path={publicUrl('/RegisteredUsers')} children={<RegisteredUsers />} />
      <Route exact path={publicUrl('/MyRatings')} children={<MyRatings />} />
      <Route exact path={publicUrl('/FrameworkQuestions')} children={<FrameworkQuestions />} />
      <Route exact path={publicUrl('/Apps')} children={<Apps />} />
      <Route exact path={publicUrl('/Rating')} children={<RatingProcess />} />
      <Route exact path={publicUrl('/RateNewApp')} children={<RateNewApp />} />
      <Route exact path={publicUrl('/RateExistingApp')} children={<RateExistingApp />} />
      <Route exact path={publicUrl('/RateAnApp')} children={<RateAnApp />} />
      <Route exact path={publicUrl('/RateNewAppIntro')} children={<RateNewAppIntro />} />
      <Route exact path={publicUrl('/ViewApp')} children={<ViewApp />} />
      <Route exact path={publicUrl('/Community')} children={<CommunityLayout />} />
      <Route exact path={publicUrl('/Survey')} children={<Survey />} />
      <Route exact path={publicUrl('/SurveyFollowUp')} children={<SurveyFollowUp />} />
      <Route exact path={publicUrl('/PlayGround')} children={<PlayGround />} />
    </Switch>
  );
};

export default Routes;
