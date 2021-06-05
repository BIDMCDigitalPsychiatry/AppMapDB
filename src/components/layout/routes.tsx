import { Route, Switch } from 'react-router';
import RatingProcess from '../pages/RatingProcess';
import AppsV2 from '../pages/AppsV2';
import MyRatings from '../pages/MyRatings/MyRatings';
import { publicUrl } from '../../helpers';
import PlayGround from './PlayGround';
import HomeV2 from '../pages/HomeV2';
import FrameworkQuestionsV2 from '../pages/FrameWorkQuestionsV2/FrameworkQuestionsV2';
import RateNewAppIntro from '../pages/RateNewAppIntro';
import RateNewAppV2, { RateExistingApp } from '../pages/RateNewApp/RateNewAppV2';
import ViewApp from '../pages/ViewApp';
import RateAnApp from '../pages/RateAnApp';
import Admin from '../pages/Admin/Admin';
import BlogLayout from '../application/Blog/BlogLayout';

const Routes = () => (
  <Switch>
    <Route exact path={'/'} component={HomeV2} />
    <Route exact path={publicUrl('/')} component={HomeV2} />
    <Route exact path={publicUrl('/Admin')} component={Admin} />
    <Route exact path={publicUrl('/MyRatings')} component={MyRatings} />
    <Route exact path={publicUrl('/Home')} component={HomeV2} />
    <Route exact path={publicUrl('/FrameworkQuestions')} component={FrameworkQuestionsV2} />
    <Route exact path={publicUrl('/Apps')} component={AppsV2} />
    <Route exact path={publicUrl('/Rating')} component={RatingProcess} />
    <Route exact path={publicUrl('/RateNewApp')} component={RateNewAppV2} />
    <Route exact path={publicUrl('/RateExistingApp')} component={RateExistingApp} />
    <Route exact path={publicUrl('/RateAnApp')} component={RateAnApp} />
    <Route exact path={publicUrl('/RateNewAppIntro')} component={RateNewAppIntro} />
    <Route exact path={publicUrl('/ViewApp')} component={ViewApp} />
    <Route exact path={publicUrl('/blog')} component={BlogLayout} />
    <Route exact path={publicUrl('/PlayGround')} component={PlayGround} />
  </Switch>
);

export default Routes;
