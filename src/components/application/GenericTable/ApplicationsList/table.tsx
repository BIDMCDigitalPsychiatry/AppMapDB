import React from 'react';
import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import * as selectors from '../Applications/selectors';
import { Grid, Typography } from '@material-ui/core';
import logo from '../../../../images/logo.png';
import * as Icons from '@material-ui/icons';
import { useWidth, useViewMode } from '../../../layout/store';
import DialogButton, { TableFilterDialogButton, renderDialogModule } from '../../GenericDialog/DialogButton';
import * as FilterPopover from '../../GenericPopover/Filter';
import * as GettingStartedDialog from '../../GenericDialog/GettingStarted';
import Application, { ClinicalFoundations, Costs, Platforms, Privacies } from '../../../../database/models/Application';
import OutlinedDiv from '../../../general/OutlinedDiv/OutlinedDiv';
import * as RateAppDialog from '../../GenericDialog/RateApp';
import { RatingsColumn, Features } from '../Applications/table';

function StyledRadio({ checked = false }) {
  const Icon = checked ? Icons.RadioButtonChecked : Icons.RadioButtonUnchecked;
  return <Icon color='action' fontSize='small' style={{ height: 14 }} />;
}

const AppSummary = ({
  _id,
  name,
  company,
  platforms = [],
  costs = [],
  privicies = [],
  features = [],
  clincialFoundation,
  ratingIds = [],
  rating
}: Application & any) => {
  return (
    <Grid container justify='space-around' alignItems='center' spacing={2}>
      <Grid item xs style={{ minWidth: 250 }}>
        <Grid container justify='center'>
          <Grid item xs={12}>
            <Typography align='center' variant='h6' color='textPrimary'>
              {name}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography align='center' variant='body2' color='textPrimary'>
              {company}
            </Typography>
          </Grid>
          <Grid item xs={12} style={{ maxWidth: 130 }}>
            <RatingsColumn _id={_id} rating={rating} ratingIds={ratingIds} />
          </Grid>
          <Grid item xs={12}>
            <Typography align='center'>
              <img style={{ height: 160 }} src={logo} alt='logo' />
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={9}>
        <Grid container justify='center'>
          <Grid item xs={3}>
            <Grid container>
              {[
                { title: 'Platforms', items: Platforms, values: platforms },
                { title: 'Cost', items: Costs, values: costs }
              ].map(g => (
                <Grid item xs={12} key={g.title}>
                  <OutlinedDiv width={180} label={g.title} marginTop={16} marginBottom={24}>
                    {(g.items as []).map(item => (
                      <Grid container key={item} spacing={1} style={{ marginLeft: 1 }}>
                        <Grid item>
                          <StyledRadio checked={g.values.includes(item)} />
                        </Grid>
                        <Grid item>
                          <Typography variant='body2'>{item}</Typography>
                        </Grid>
                      </Grid>
                    ))}
                  </OutlinedDiv>
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Grid item xs={3}>
            <Grid container>
              {[
                {
                  title: 'Features',
                  items: Features,
                  values: features
                }
              ].map(g => (
                <Grid item key={g.title}>
                  <OutlinedDiv width={180} label={g.title} marginTop={16} marginBottom={24}>
                    {(g.items as []).map(item => (
                      <Grid container key={item} spacing={1} style={{ marginLeft: 1 }}>
                        <Grid item>
                          <StyledRadio checked={g.values.includes(item)} />
                        </Grid>
                        <Grid item>
                          <Typography variant='body2'>{item}</Typography>
                        </Grid>
                      </Grid>
                    ))}
                  </OutlinedDiv>
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Grid item xs={3}>
            <Grid container>
              {[
                { title: 'Privacy', items: Privacies, values: privicies },
                { title: 'Clinical Foundation', items: ClinicalFoundations, values: [clincialFoundation] }
              ].map(g => (
                <Grid item xs={12} key={g.title}>
                  <OutlinedDiv width={220} label={g.title} marginTop={16} marginBottom={24}>
                    {(g.items as []).map(item => (
                      <Grid container key={item} spacing={1} style={{ marginLeft: 1 }}>
                        <Grid item>
                          <StyledRadio checked={g.values.includes(item)} />
                        </Grid>
                        <Grid item>
                          <Typography variant='body2'>{item}</Typography>
                        </Grid>
                      </Grid>
                    ))}
                  </OutlinedDiv>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export const ViewModeButton = ({ mode = 'list' }) => {
  const [, setViewMode] = useViewMode() as any;
  const handleClick = React.useCallback(() => setViewMode(mode === 'list' ? 'table' : 'list'), [mode, setViewMode]);
  return (
    <DialogButton Icon={mode === 'list' ? Icons.List : Icons.ViewList} tooltip={`Switch to ${mode === 'list' ? 'Table' : 'List'} View`} onClick={handleClick} />
  );
};

const name = 'Applications';
const defaultProps: GenericTableContainerProps = {
  name,
  dialogs: [renderDialogModule(RateAppDialog)],
  columns: [{ name: 'app', header: 'Application', minWidth: 1300, Cell: AppSummary }],
  toolbar: true,
  selector: selectors.from_database,
  footer: true,
  search: true,
  includeHeaders: false,
  fixedRowCount: 0,
  rowHeight: 280,
  buttons: [
    <TableFilterDialogButton Module={FilterPopover} table={name} />,
    <ViewModeButton />,
    <DialogButton Module={GettingStartedDialog} Icon={Icons.Help} tooltip='Help Getting Started' />
  ]
};

export const ApplicationsList = props => {
  const width = useWidth();
  return <GenericTableContainer {...defaultProps} showScroll={width < 2000 ? true : false} {...props} />;
};
