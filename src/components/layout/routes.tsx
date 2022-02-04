import { Route, Switch } from 'react-router';
import RatingProcess from '../pages/RatingProcess';
import Apps from '../pages/Apps';
import MyRatings from '../pages/MyRatings/MyRatings';
import { publicUrl } from '../../helpers';
import PlayGround from './PlayGround';
import Home from '../pages/Home';
import FrameworkQuestions from '../pages/FrameWorkQuestions/FrameworkQuestions';
import RateNewAppIntro from '../pages/RateNewAppIntro';
import RateNewApp, { RateExistingApp } from '../pages/RateNewApp/RateNewApp';
import ViewApp from '../pages/ViewApp';
import RateAnApp from '../pages/RateAnApp';
import Admin from '../pages/Admin/Admin';
import BlogLayout from '../application/Blog/BlogLayout';
import Survey from '../pages/Survey/Survey';
import SurveyFollowUp from '../pages/Survey/SurveyFollowUp';

const Routes = () => (
  <Switch>
    <Route exact path={'/'} component={Home} />
    <Route exact path={publicUrl('/')} component={Home} />
    <Route exact path={publicUrl('/Home')} component={Home} />
    <Route exact path={publicUrl('/Admin')} component={Admin} />
    <Route exact path={publicUrl('/MyRatings')} component={MyRatings} />
    <Route exact path={publicUrl('/FrameworkQuestions')} component={FrameworkQuestions} />
    <Route exact path={publicUrl('/Apps')} component={Apps} />
    <Route exact path={publicUrl('/Rating')} component={RatingProcess} />
    <Route exact path={publicUrl('/RateNewApp')} component={RateNewApp} />
    <Route exact path={publicUrl('/RateExistingApp')} component={RateExistingApp} />
    <Route exact path={publicUrl('/RateAnApp')} component={RateAnApp} />
    <Route exact path={publicUrl('/RateNewAppIntro')} component={RateNewAppIntro} />
    <Route exact path={publicUrl('/ViewApp')} component={ViewApp} />
    <Route exact path={publicUrl('/Community')} component={BlogLayout} />
    <Route exact path={publicUrl('/Survey')} component={Survey} />
    <Route exact path={publicUrl('/SurveyFollowUp')} component={SurveyFollowUp} />
    <Route exact path={publicUrl('/PlayGround')} component={PlayGround} />
  </Switch>
);

export default Routes;
