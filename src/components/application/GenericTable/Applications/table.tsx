import React from 'react';
import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import * as selectors from './selectors';
import { Grid } from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import { TableFilterDialogButton, renderDialogModule } from '../../GenericDialog/DialogButton';
import * as FilterPopover from '../../GenericPopover/Filter';
import Application, { Costs, Platforms, Functionalities, FunctionalityQuestions, Features, Inputs, Outputs } from '../../../../database/models/Application';
import * as RateNewAppDialog from '../../GenericDialog/RateNewApp/RateNewAppDialog';
import AppSummary from './AppSummary';
import RatingsColumn from './RatingsColumn';
import ViewModeButton from './ViewModeButton';
import { Typography } from '@material-ui/core';
import { getDayTimeFromTimestamp } from '../../../../helpers';
import { useSignedIn } from '../../../../hooks';

export const name = 'Applications';
const center = text => <div style={{ textAlign: 'center' }}>{text}</div>;

export const CenterRadio = ({ checked = false }) => {
  const Icon = checked ? Icons.RadioButtonChecked : Icons.RadioButtonUnchecked;
  return center(<Icon color='action' fontSize='small' />);
};

const LastUpdated = ({ updated }) => (
  <Typography variant='body2' color='textSecondary'>
    {updated ? getDayTimeFromTimestamp(updated) : ''}
  </Typography>
);

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
const InputRadios = ({ inputs = [] }: Application) => buildRadios(Inputs, inputs);
const OutputRadios = ({ outputs = [] }: Application) => buildRadios(Outputs, outputs);

const defaultProps: GenericTableContainerProps = {
  name,
  dialogs: [renderDialogModule(RateNewAppDialog)],
  columns: [
    { name: 'app', header: 'Application', minWidth: 300, Cell: AppSummary },
    { name: 'updated', header: 'Last Updated', width: 165, Cell: LastUpdated },
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
      width: 700,
      header: (
        <>
          <Grid container>
            <Grid item xs={12}>
              <Grid container justify='center'>
                Functionality
              </Grid>
            </Grid>
            {Functionalities.map(t => {
              var s = FunctionalityQuestions.find(fq => fq.value === t);
              var label = s ? (s.short ? s.short : s.value) : t;
              return (
                <Grid item xs key={label}>
                  {center(label)}
                </Grid>
              );
            })}
          </Grid>
        </>
      ),
      Cell: FunctionalityRadios
    },
    {
      name: 'cost',
      width: 462,
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
      width: 3500,
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
    },
    {
      name: 'inputs',
      width: 850,
      header: (
        <>
          <Grid container>
            <Grid item xs={12}>
              <Grid container justify='center'>
                Inputs
              </Grid>
            </Grid>
            {Inputs.map(t => (
              <Grid item xs key={t}>
                {center(t)}
              </Grid>
            ))}
          </Grid>
        </>
      ),
      Cell: InputRadios
    },
    {
      name: 'outputs',
      width: 1000,
      header: (
        <>
          <Grid container>
            <Grid item xs={12}>
              <Grid container justify='center'>
                Outputs
              </Grid>
            </Grid>
            {Outputs.map(t => (
              <Grid item xs key={t}>
                {center(t)}
              </Grid>
            ))}
          </Grid>
        </>
      ),
      Cell: OutputRadios
    }
  ],
  toolbar: true,
  selector: selectors.from_database,
  footer: true,
  search: true,
  buttons: [<ViewModeButton mode='table' />, <TableFilterDialogButton Module={FilterPopover} table={name} />]
};

export const Applications = props => {
  var { columns = [] } = defaultProps;
  const signedIn = useSignedIn();
  columns = signedIn ? columns : (columns as []).filter((c: any) => c.name !== 'rating');
  return <GenericTableContainer {...defaultProps} columns={columns} showScroll={true} {...props} />;
};
