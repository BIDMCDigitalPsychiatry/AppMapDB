import * as React from 'react';
import { Route, Switch } from 'react-router';
import RatingProcess from '../pages/RatingProcess';
import Framework from '../pages/Framework';
import Apps from '../pages/Apps';

const Routes = () => (
  <Switch>
    <Route exact path='/' component={Apps} />
    <Route exact path='/Apps' component={Apps} />
    <Route exact path='/Framework' component={Framework} />
    <Route exact path='/Rating' component={RatingProcess} />
  </Switch>
);

export default Routes;
