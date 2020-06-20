import React from 'react';
import { Grid } from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import Application, {
  Costs,
  Platforms,
  Functionalities,
  FunctionalityQuestions,
  ClinicalFoundations,
  ClinicalFoundationQuestions,
  Features,
  Inputs,
  Outputs,
  Uses,
  PrivacyQuestions,
  Privacies,
  Engagements,
  EngagementQuestions,
  Conditions,
  DeveloperTypes,
  DeveloperTypeQuestions
} from '../../../../database/models/Application';
import AppSummary from './AppSummary';
import RatingsColumn from './RatingsColumn';
import { Typography } from '@material-ui/core';
import { getDayTimeFromTimestamp } from '../../../../helpers';
import { makeStyles, createStyles } from '@material-ui/core';

const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    hover: {
      '&:hover': {
        cursor: 'pointer',
        background: palette.primary.main,
        color: palette.common.white
      }
    }
  })
);

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

const isLabelMatch = (label, items, values = []) => {
  var item = items.find(i => i.value === label || i.label === label || i.short === label);  
  return item ? values.includes(item.short) || values.includes(item.value) || values.includes(label) : values.includes(label);
};

const buildRadiosWithLabels = (items, labels, values, paddingRight = undefined) => {  
  return (
    <Grid container style={{ paddingRight }}>
      {labels.map((label, index) => (
        <Grid item xs key={index}>
          <CenterRadio checked={isLabelMatch(label, items, values)} />
        </Grid>
      ))}
    </Grid>
  );
};

const DeveloperTypeLabels = DeveloperTypes.map(t => {
  var s = DeveloperTypeQuestions.find(fq => fq.value === t);
  return s ? (s.short ? s.short : s.value) : t;
});

const FunctionalityLabels = Functionalities.map(t => {
  var s = FunctionalityQuestions.find(fq => fq.value === t);
  return s ? (s.short ? s.short : s.value) : t;
});

const PrivacyLabels = Privacies.map(t => {
  var s = PrivacyQuestions.find(fq => fq.value === t);
  return s ? (s.short ? s.short : s.value) : t;
});

const ClinicalFoundationLabels = ClinicalFoundations.map(t => {
  var s = ClinicalFoundationQuestions.find(fq => fq.value === t);
  return s ? (s.short ? s.short : s.value) : t;
});

const EngagementLabels = Engagements.map(t => {
  var s = EngagementQuestions.find(fq => fq.value === t);
  return s ? (s.short ? s.short : s.value) : t;
});

const PlatformRadios = pinned => ({ platforms = [] }: Application) => buildRadios(sortPinned(Platforms, 'platforms', pinned), platforms);

const UsesRadios = pinned => ({ uses = [] }: Application) => buildRadios(sortPinned(Uses, 'uses', pinned), uses);

const DeveloperTypeRadios = pinned => ({ developerTypes = [] }: Application) =>
buildRadiosWithLabels(DeveloperTypeQuestions, sortPinned(DeveloperTypeLabels, 'developerTypes', pinned), developerTypes);

const CostRadios = pinned => ({ costs = [] }) => buildRadios(sortPinned(Costs, 'cost', pinned), costs);

const ConditionRadios = pinned => ({ conditions = [] }: Application) => buildRadios(sortPinned(Conditions, 'conditions', pinned), conditions);

const EngagementRadios = pinned => ({ engagements = [] }: Application) => buildRadiosWithLabels(EngagementQuestions, sortPinned(EngagementLabels, 'engagements', pinned), engagements);

const FunctionalityRadios = pinned => ({ functionalities = [] }: Application) =>
  buildRadiosWithLabels(FunctionalityQuestions, sortPinned(FunctionalityLabels, 'functionality', pinned), functionalities);

const ClinicalFoundationRadios = pinned => ({ clinicalFoundations = [] }: Application) =>
buildRadiosWithLabels(ClinicalFoundationQuestions, sortPinned(ClinicalFoundationLabels, 'clinicalFoundations', pinned), clinicalFoundations);

const PrivacyRadios = pinned => ({ privacies = [] }: Application) => buildRadiosWithLabels(PrivacyQuestions, sortPinned(PrivacyLabels, 'privacies', pinned), privacies);

const FeaturesRadios = pinned => ({ features = [] }) => buildRadios(sortPinned(Features, 'features', pinned), features, 16);

const InputRadios = pinned => ({ inputs = [] }: Application) => buildRadios(sortPinned(Inputs, 'inputs', pinned), inputs);

const OutputRadios = pinned => ({ outputs = [] }: Application) => buildRadios(sortPinned(Outputs, 'outputs', pinned), outputs);

const sortPinned = (columns, column, pinned) => {
  const pinnedColumns = pinned[column] ?? [];
  const remainingColumns = columns.filter(name => !pinnedColumns.includes(name));
  return [...pinnedColumns, ...remainingColumns];
};

export const useColumns = () => {
  const [pinned, setPinned] = React.useState({});
  const classes = useStyles();

  const handlePinColumn = React.useCallback(
    (column, subcolumn) => event => {
      event.stopPropagation();
      setPinned(prev => ({ ...prev, [column]: [subcolumn, ...(prev[column] ?? []).filter(c => c !== subcolumn)] }));
    },
    [setPinned]
  );

  const columns = [
    { name: 'app', header: 'Application', minWidth: 300, Cell: AppSummary, hoverable: false },
    { name: 'updated', header: 'Last Updated', width: 165, Cell: LastUpdated, hoverable: false },
    { name: 'rating', header: 'Rating', width: 300, Cell: RatingsColumn, hoverable: false },
    {
      name: 'platforms',
      width: 140,
      header: (
        <>
          <Grid container>
            <Grid item xs={12} className={classes.hover} onClick={handlePinColumn('root', 'platforms')}>
              <Grid container justify='center'>
                Platforms
              </Grid>
            </Grid>
            {sortPinned(Platforms, 'platforms', pinned).map(label => (
              <Grid item xs key={label} onClick={handlePinColumn('platforms', label)} className={classes.hover}>
                {center(label)}
              </Grid>
            ))}
          </Grid>
        </>
      ),
      Cell: PlatformRadios(pinned)
    },
    {
      name: 'developerType',
      width: 350,
      header: (
        <>
          <Grid container>
            <Grid item xs={12} className={classes.hover} onClick={handlePinColumn('root', 'developerType')}>
              <Grid container justify='center'>
                Developer Type
              </Grid>
            </Grid>
            {sortPinned(DeveloperTypeLabels, 'developerType', pinned).map(label => (
              <Grid item xs key={label} onClick={handlePinColumn('developerType', label)} className={classes.hover}>
                {center(label)}
              </Grid>
            ))}
          </Grid>
        </>
      ),
      Cell: DeveloperTypeRadios(pinned)
    },
    {
      name: 'cost',
      width: 462,
      header: (
        <>
          <Grid container>
            <Grid item xs={12} className={classes.hover} onClick={handlePinColumn('root', 'cost')}>
              <Grid container justify='center'>
                Cost
              </Grid>
            </Grid>
            {sortPinned(Costs, 'cost', pinned).map(label => (
              <Grid item xs key={label} onClick={handlePinColumn('cost', label)} className={classes.hover}>
                {center(label)}
              </Grid>
            ))}
          </Grid>
        </>
      ),
      Cell: CostRadios(pinned)
    },
    {
      name: 'functionality',
      width: 490,
      header: (
        <>
          <Grid container>
            <Grid item xs={12}>
              <Grid container justify='center' className={classes.hover} onClick={handlePinColumn('root', 'functionality')}>
                Access
              </Grid>
            </Grid>
            {sortPinned(FunctionalityLabels, 'functionality', pinned).map(label => (
              <Grid item xs key={label} onClick={handlePinColumn('functionality', label)} className={classes.hover}>
                {center(label)}
              </Grid>
            ))}
          </Grid>
        </>
      ),
      Cell: FunctionalityRadios(pinned)
    },
    {
      name: 'privacies',
      width: 1800,
      header: (
        <>
          <Grid container>
            <Grid item xs={12}>
              <Grid container justify='center' onClick={handlePinColumn('root', 'privacies')} className={classes.hover}>
                Privacies
              </Grid>
            </Grid>
            {sortPinned(PrivacyLabels, 'privacies', pinned).map(label => (
              <Grid item xs key={label} onClick={handlePinColumn('privacies', label)} className={classes.hover}>
                {center(label)}
              </Grid>
            ))}
          </Grid>
        </>
      ),
      Cell: PrivacyRadios(pinned)
    },
    {
      name: 'clinicalFoundations',
      width: 650,
      header: (
        <>
          <Grid container>
            <Grid item xs={12}>
              <Grid container justify='center' onClick={handlePinColumn('root', 'clinicalFoundations')} className={classes.hover}>
                Clinical Foundations
              </Grid>
            </Grid>
            {sortPinned(ClinicalFoundationLabels, 'clinicalFoundations', pinned).map(label => (
              <Grid item xs key={label} onClick={handlePinColumn('clinicalFoundations', label)} className={classes.hover}>
                {center(label)}
              </Grid>
            ))}
          </Grid>
        </>
      ),
      Cell: ClinicalFoundationRadios(pinned)
    },
    {
      name: 'features',
      width: 3500,
      header: (
        <>
          <Grid container style={{ paddingRight: 16 }}>
            <Grid item xs={12} className={classes.hover} onClick={handlePinColumn('root', 'features')}>
              <Grid container justify='center'>
                Features
              </Grid>
            </Grid>
            {sortPinned(Features, 'features', pinned).map(t => (
              <Grid item xs key={t} onClick={handlePinColumn('features', t)} className={classes.hover}>
                {center(t)}
              </Grid>
            ))}
          </Grid>
        </>
      ),
      Cell: FeaturesRadios(pinned)
    },
    {
      name: 'conditions',
      width: 850,
      header: (
        <>
          <Grid container>
            <Grid item xs={12} className={classes.hover} onClick={handlePinColumn('root', 'conditions')}>
              <Grid container justify='center'>
                Supported Conditions
              </Grid>
            </Grid>
            {sortPinned(Conditions, 'conditions', pinned).map(t => (
              <Grid item xs key={t} onClick={handlePinColumn('conditions', t)} className={classes.hover}>
                {center(t)}
              </Grid>
            ))}
          </Grid>
        </>
      ),
      Cell: ConditionRadios(pinned)
    },
    {
      name: 'engagements',
      width: 1500,
      header: (
        <>
          <Grid container>
            <Grid item xs={12}>
              <Grid container justify='center' className={classes.hover} onClick={handlePinColumn('root', 'engagements')}>
                Engagements
              </Grid>
            </Grid>
            {sortPinned(EngagementLabels, 'engagements', pinned).map(label => (
              <Grid item xs key={label} onClick={handlePinColumn('engagements', label)} className={classes.hover}>
                {center(label)}
              </Grid>
            ))}
          </Grid>
        </>
      ),
      Cell: EngagementRadios(pinned)
    },
    {
      name: 'inputs',
      width: 850,
      header: (
        <>
          <Grid container>
            <Grid item xs={12}>
              <Grid container justify='center' className={classes.hover} onClick={handlePinColumn('root', 'inputs')}>
                Inputs
              </Grid>
            </Grid>
            {sortPinned(Inputs, 'inputs', pinned).map(t => (
              <Grid item xs key={t} onClick={handlePinColumn('inputs', t)} className={classes.hover}>
                {center(t)}
              </Grid>
            ))}
          </Grid>
        </>
      ),
      Cell: InputRadios(pinned)
    },
    {
      name: 'outputs',
      width: 1000,
      header: (
        <>
          <Grid container>
            <Grid item xs={12}>
              <Grid container justify='center' className={classes.hover} onClick={handlePinColumn('root', 'outputs')}>
                Outputs
              </Grid>
            </Grid>
            {sortPinned(Outputs, 'outputs', pinned).map(t => (
              <Grid item xs key={t} onClick={handlePinColumn('outputs', t)} className={classes.hover}>
                {center(t)}
              </Grid>
            ))}
          </Grid>
        </>
      ),
      Cell: OutputRadios(pinned)
    },
    {
      name: 'uses',
      width: 200,
      header: (
        <>
          <Grid container>
            <Grid item xs={12}>
              <Grid container justify='center' className={classes.hover} onClick={handlePinColumn('root', 'uses')}>
                Uses
              </Grid>
            </Grid>
            {sortPinned(Uses, 'uses', pinned).map(t => (
              <Grid item xs key={t} onClick={handlePinColumn('uses', t)} className={classes.hover}>
                {center(t)}
              </Grid>
            ))}
          </Grid>
        </>
      ),
      Cell: UsesRadios(pinned)
    }
  ];

  const staticColumns = columns.filter(c => c.hoverable === false);
  const dynamicColumns = columns.filter(c => c.hoverable !== false);

  const pinnedColumns = (pinned['root'] ?? []).map(name => dynamicColumns.find(c => c.name === name));
  const remainingColumns = dynamicColumns.filter(c => !(pinned['root'] ?? []).includes(c.name));

  const mergedColumns = [...staticColumns, ...pinnedColumns, ...remainingColumns].map(c => ({
    ...c,
    onHeaderClick: false
  }));

  // console.log({ pinned, root: pinned['root'], staticColumns, dynamicColumns, pinnedColumns, remainingColumns, mergedColumns });

  return mergedColumns;
};
