import React from 'react';
import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import * as selectors from './selectors';
import { Grid } from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import DialogButton, { TableFilterDialogButton, renderDialogModule } from '../../GenericDialog/DialogButton';
import * as GettingStartedDialog from '../../GenericDialog/GettingStarted';
import * as FilterPopover from '../../GenericPopover/Filter';
import Application, { Costs, Platforms, Functionalities, Features as AllFeatures } from '../../../../database/models/Application';
import * as RateAppDialog from '../../GenericDialog/RateApp';
import * as AppReviewsDialog from '../../GenericDialog/AppReviews';
import AppSummary from './AppSummary';
import RatingsColumn from './RatingsColumn';
import ViewModeButton from './ViewModeButton';

export const name = 'Applications';
const center = text => <div style={{ textAlign: 'center' }}>{text}</div>;

export const Features = AllFeatures.filter((f, i) => i < 9);

export const CenterRadio = ({ checked = false }) => {
  const Icon = checked ? Icons.RadioButtonChecked : Icons.RadioButtonUnchecked;
  return center(<Icon color='action' fontSize='small' />);
};

const buildRadios = (items, values, paddingRight = undefined) => (
  <Grid container style={{ paddingRight }}>
    {items.map((i, index) => (
      <Grid item xs key={index}>
        <CenterRadio checked={values.includes(i)} />
      </Grid>
    ))}
  </Grid>
);

const PlatformRadios = ({ platforms = [] }: Application) => buildRadios(Platforms, platforms);
const FunctionalityRadios = ({ functionalities = [] }: Application) => buildRadios(Functionalities, functionalities);
const CostRadios = ({ costs = [] }) => buildRadios(Costs, costs);
const FeaturesRadios = ({ features = [] }) => buildRadios(Features, features, 16);

const defaultProps: GenericTableContainerProps = {
  name,
  dialogs: [renderDialogModule(RateAppDialog), renderDialogModule(AppReviewsDialog)],
  columns: [
    { name: 'app', header: 'Application', minWidth: 300, Cell: AppSummary },
    { name: 'rating', header: 'Rating', width: 156, Cell: RatingsColumn },
    {
      name: 'platforms',
      width: 140,
      header: (
        <>
          <Grid container>
            <Grid item xs={12}>
              <Grid container justify='center'>
                Platforms
              </Grid>
            </Grid>
            {Platforms.map(t => (
              <Grid item xs key={t}>
                {center(t)}
              </Grid>
            ))}
          </Grid>
        </>
      ),
      Cell: PlatformRadios
    },
    {
      name: 'functionality',
      width: 140,
      header: (
        <>
          <Grid container>
            <Grid item xs={12}>
              <Grid container justify='center'>
                Functionality
              </Grid>
            </Grid>
            {Functionalities.map(t => (
              <Grid item xs key={t}>
                {center(t)}
              </Grid>
            ))}
          </Grid>
        </>
      ),
      Cell: FunctionalityRadios
    },
    {
      name: 'cost',
      width: 370,
      header: (
        <>
          <Grid container>
            <Grid item xs={12}>
              <Grid container justify='center'>
                Cost
              </Grid>
            </Grid>
            {Costs.map(t => (
              <Grid item xs key={t}>
                {center(t)}
              </Grid>
            ))}
          </Grid>
        </>
      ),
      Cell: CostRadios
    },
    {
      name: 'features',
      width: 830,
      header: (
        <>
          <Grid container style={{ paddingRight: 16 }}>
            <Grid item xs={12}>
              <Grid container justify='center'>
                Features
              </Grid>
            </Grid>
            {Features.map(t => (
              <Grid item xs key={t}>
                {center(t)}
              </Grid>
            ))}
          </Grid>
        </>
      ),
      Cell: FeaturesRadios
    }
  ],
  toolbar: true,
  selector: selectors.from_database,
  footer: true,
  search: true,
  buttons: [
    <TableFilterDialogButton Module={FilterPopover} table={name} />,
    <ViewModeButton mode='table' />,
    <DialogButton Module={GettingStartedDialog} Icon={Icons.Help} tooltip='Help Getting Started' />
  ]
};

export const Applications = props => <GenericTableContainer {...defaultProps} showScroll={true} {...props} />;
