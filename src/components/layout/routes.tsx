import { Route, Switch } from 'react-router';
import RatingProcess from '../pages/RatingProcess';
import Apps from '../pages/Apps';
import MyRatings from '../pages/MyRatings/MyRatings';
import { publicUrl } from '../../helpers';
import PlayGround from './PlayGround';
import FrameworkQuestions from '../pages/FrameWorkQuestions/FrameworkQuestions';
import RateNewAppIntro from '../pages/RateNewAppIntro';
import RateNewApp, { RateExistingApp } from '../pages/RateNewApp/RateNewApp';
import ViewApp from '../pages/ViewApp';
import RateAnApp from '../pages/RateAnApp';
import Admin from '../pages/Admin/Admin';
import CommunityLayout from '../pages/Community/CommunityLayout';
import Survey from '../pages/Survey/Survey';
import SurveyFollowUp from '../pages/Survey/SurveyFollowUp';

const Routes = () => {
  return (
    <Switch>
      <Route exact path={'/'} children={<Apps />} />
      <Route exact path={publicUrl('/')} children={<Apps />} />
      <Route exact path={publicUrl('/Home')} children={<Apps />} />
      <Route exact path={publicUrl('/Admin')} children={<Admin />} />
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
