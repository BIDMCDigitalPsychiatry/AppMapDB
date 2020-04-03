import * as React from 'react';
import { Route, Switch } from 'react-router';
import RatingProcess from '../pages/RatingProcess';
import Apps from '../pages/Apps';
import { publicUrl } from '../../helpers';
import PlayGround from './PlayGround';
import Home from '../pages/Home';
import FrameworkQuestions from '../pages/FrameworkQuestions';
import RateNewAppIntro from '../pages/RateNewAppIntro';
import RateNewApp from '../pages/RateNewApp';

const Routes = () => (
  <Switch>
    <Route exact path={'/'} component={Home} />
    <Route exact path={publicUrl('/')} component={Home} />
    <Route exact path={publicUrl('/FrameworkQuestions')} component={FrameworkQuestions} />
    <Route exact path={publicUrl('/Apps')} component={Apps} />
    <Route exact path={publicUrl('/Rating')} component={RatingProcess} />
    <Route exact path={publicUrl('/RateNewApp')} component={RateNewApp} />
    <Route exact path={publicUrl('/RateNewAppIntro')} component={RateNewAppIntro} />
    <Route exact path={publicUrl('/PlayGround')} component={PlayGround} />
  </Switch>
);

export default Routes;
