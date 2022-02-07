import React from 'react';
import { evalFunc } from '../../../../helpers';
import GenericStepperCard from '../GenericCardStepper';
import steps from './steps';
import { setMappedValue } from '../helpers';
import * as Icons from '@material-ui/icons';
import { Button, Collapse, createStyles, Divider, Grid, makeStyles, Typography } from '@material-ui/core';
import { variableFilters } from '../../../pages/Home';

export const title = 'Interactive Search';

const useStyles = makeStyles(({ palette }: any) =>
  createStyles({
    primaryButton: {
      borderRadius: 7,
      color: palette.common.white,
      background: palette.primary.dark,
      minWidth: 160,
      height: 40,
      '&:hover': {
        background: palette.primary.main
      }
    },
    primaryMainButton: {
      borderRadius: 7,
      color: palette.common.white,
      background: palette.primary.main,
      minWidth: 160,
      height: 40,
      '&:hover': {
        background: palette.primary.dark
      }
    },
    primaryText: {
      fontSize: 30,
      fontWeight: 900,
      color: palette.primary.dark
    },
    container: {
      color: palette.primary.dark,
      background: palette.primary.light
    },
    tabButton: {
      padding: 8,
      textAlign: 'center',
      background: palette.primary.dark,
      color: 'white',
      width: '100%',
      cursor: 'pointer',
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
      '&:hover': {
        background: palette.primary.main
      }
    }
  })
);

const FieldActions = ({ handleNext, handleBack, handleSubmit, handleCancel, activeStep }) => {
  const classes = useStyles();
  return (
    <Grid container justify='center' spacing={4} style={{ marginTop: 16, marginBottom: 0 }}>
      {activeStep > 0 && (
        <Grid item>
          <Button className={classes.primaryMainButton} onClick={handleBack} disabled={activeStep === 0}>
            <Icons.KeyboardArrowLeft />
            Back
          </Button>
        </Grid>
      )}
      {activeStep !== steps.length - 1 && (
        <Grid item>
          <Button className={classes.primaryMainButton} onClick={handleNext}>
            Next
            <Icons.KeyboardArrowRight />
          </Button>
        </Grid>
      )}
      <Grid item>
        <Button className={classes.primaryButton} onClick={handleSubmit}>
          Search Now
        </Button>
      </Grid>
    </Grid>
  );
};

export const internalKeys = ['Free', 'YesNoPrivacy', 'YesNoFunctionality'];

export default function InteractiveSearchCard({ id = title, onClose = undefined, state, setState, handleSearch, ...other }) {
  const [open, setOpen] = React.useState(false);
  // This monitors the Free field to determine how to set the appropriate cost field
  const handleChange = React.useCallback(
    vals => {
      setState(prev => {
        const { Free = [], YesNoPrivacy = [], YesNoFunctionality = [] } = evalFunc(vals, prev);
        const isFree = Free.findIndex(i => i === true) > -1;
        const isPrivacy = YesNoPrivacy.findIndex(i => i === true) > -1;
        const isFunctionality = YesNoFunctionality.findIndex(i => i === true) > -1;

        const conditionalMapping = {
          Cost: isFree,
          Privacy: isPrivacy,
          Functionalities: isFunctionality
        };

        return variableFilters.reduce(
          (t, c) => (t = setMappedValue({ field: { id: c.key }, value: conditionalMapping[c.key] ? c.availableFilters : [], prev: t })),
          { ...prev }
        );
      });
    },
    [setState]
  );

  const handleOpen = () => {
    setOpen(!open);
  };

  const classes = useStyles();

  return (
    <>
      <Collapse in={open}>
        <div className={classes.container}>
          <Divider />
          <GenericStepperCard
            id={id}
            submitLabel='Search'
            SubmitIcon={Icons.Search}
            onSubmit={handleSearch}
            onChange={handleChange}
            steps={steps}
            onClose={onClose}
            open={true}
            title={null}
            values={state}
            setValues={setState}
            showActions={false}
            elevation={0}
            FieldActions={props => <FieldActions handleCancel={handleOpen} {...props} />}
            disableInitialize={true}
            {...other}
          />
        </div>
      </Collapse>
      <Grid container alignItems='center' style={{ background: 'transparent' }} justify='center'>
        <Grid item alignContent='center' style={{ width: 320 }}>
          <div color='primary' className={classes.tabButton} onClick={handleOpen}>
            <Typography>{open ? 'Close wizard' : `Not sure? Try the interactive wizard!`}</Typography>
          </div>
        </Grid>
      </Grid>
    </>
  );
}
