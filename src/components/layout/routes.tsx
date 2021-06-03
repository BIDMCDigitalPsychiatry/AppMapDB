import { Route, Switch } from 'react-router';
import RatingProcess from '../pages/RatingProcess';
import Apps from '../pages/Apps';
import AppsV2 from '../pages/AppsV2';
import MyRatings from '../pages/MyRatings/MyRatings';
import { publicUrl } from '../../helpers';
import PlayGround from './PlayGround';
import Home from '../pages/Home';
import HomeV2 from '../pages/HomeV2';
import FrameworkQuestions from '../pages/FrameworkQuestions';
import FrameworkQuestionsV2 from '../pages/FrameWorkQuestionsV2/FrameworkQuestionsV2';
import News from '../pages/News/News';
import NewsV2 from '../pages/News/NewsV2';
import RateNewAppIntro from '../pages/RateNewAppIntro';
import RateNewApp from '../pages/RateNewApp';
import RateNewAppV2, { RateExistingApp } from '../pages/RateNewApp/RateNewAppV2';
import ViewApp from '../pages/ViewApp';
import VersionComponent from './VersionComponent';
import RateAnApp from '../pages/RateAnApp';
import Admin from '../pages/Admin/Admin';
import Article from '../pages/News/Article';
import BlogLayout from '../application/Blog/BlogLayout';

const Routes = () => (
  <Switch>
    <Route exact path={'/'} component={VersionComponent({ V1: Home, V2: HomeV2 })} />
    <Route exact path={publicUrl('/')} component={VersionComponent({ V1: Home, V2: HomeV2 })} />
    <Route exact path={publicUrl('/Admin')} component={Admin} />
    <Route exact path={publicUrl('/MyRatings')} component={MyRatings} />
    <Route exact path={publicUrl('/Home')} component={VersionComponent({ V1: Home, V2: HomeV2 })} />
    <Route exact path={publicUrl('/FrameworkQuestions')} component={VersionComponent({ V1: FrameworkQuestions, V2: FrameworkQuestionsV2 })} />
    <Route exact path={publicUrl('/News')} component={VersionComponent({ V1: News, V2: NewsV2 })} />
    <Route exact path={publicUrl('/Article')} component={Article} />
    <Route exact path={publicUrl('/Apps')} component={VersionComponent({ V1: Apps, V2: AppsV2 })} />
    <Route exact path={publicUrl('/Rating')} component={RatingProcess} />
    <Route exact path={publicUrl('/RateNewApp')} component={VersionComponent({ V1: RateNewApp, V2: RateNewAppV2 })} />
    <Route exact path={publicUrl('/RateExistingApp')} component={RateExistingApp} />
    <Route exact path={publicUrl('/RateAnApp')} component={RateAnApp} />
    <Route exact path={publicUrl('/RateNewAppIntro')} component={RateNewAppIntro} />
    <Route exact path={publicUrl('/ViewApp')} component={ViewApp} />
    <Route exact path={publicUrl('/blog')} component={BlogLayout} />
    <Route exact path={publicUrl('/PlayGround')} component={PlayGround} />
  </Switch>
);

export default Routes;
