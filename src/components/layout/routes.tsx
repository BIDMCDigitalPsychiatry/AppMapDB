import * as React from 'react';
import { Route, Switch } from 'react-router';
import RatingProcess from '../pages/RatingProcess';
import Framework from '../pages/Framework';
import Apps from '../pages/Apps';
import { publicUrl } from '../../helpers';

const Routes = () => (
  <Switch>
    <Route exact path={publicUrl('/')} component={Apps} />
    <Route exact path={publicUrl('/Apps')} component={Apps} />
    <Route exact path={publicUrl('/Framework')} component={Framework} />
    <Route exact path={publicUrl('/Rating')} component={RatingProcess} />
  </Switch>
);

export default Routes;
