import React from 'react';
import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import * as selectors from './selectors';
import { Grid, Typography } from '@material-ui/core';
import logo from '../../../../images/logo.png';
import * as Icons from '@material-ui/icons';
import { useWidth } from '../../../layout/LayoutStore';
import DialogButton, { TableFilterDialogButton } from '../../GenericDialog/DialogButton';
import { ViewModeButton } from '../ApplicationsList/table';
import * as GettingStartedDialog from '../../GenericDialog/GettingStarted';
import * as FilterPopover from '../../GenericPopover/Filter';
import Application, { Costs, Platforms, Functionalities, Features } from '../../../../database/models/Application';

export const name = 'Applications';
const center = text => <div style={{ textAlign: 'center' }}>{text}</div>;

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

const AppColumn = ({ name, company }) => {
  return (
    <Grid container alignItems='center'>
      <Grid item>
        <Grid container alignItems='center'>
          <Grid item>
            <img style={{ height: 40 }} src={logo} alt='logo' />
          </Grid>
        </Grid>
      </Grid>
      <Grid item zeroMinWidth xs>
        <Grid container style={{ padding: 4 }}>
          <Grid item xs={12}>
            <Typography noWrap variant='caption' color='textPrimary'>
              {name}
            </Typography>
          </Grid>
          <Grid item xs style={{ paddingLeft: 4 }}>
            <Typography noWrap variant='caption' color='textSecondary'>
              by {company}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};


const defaultProps: GenericTableContainerProps = {
  name,
  columns: [
    { name: 'app', header: 'Application', minWidth: 300, Cell: AppColumn },
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

export const Applications = props => {
  const width = useWidth();
  return <GenericTableContainer {...defaultProps} showScroll={width < 1200 ? true : false} {...props} />;
};
