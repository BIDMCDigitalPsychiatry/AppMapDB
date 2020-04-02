import React from 'react';
import { publicUrl, evalFunc } from '../../../../helpers';
import GenericStepperCard from '../GenericCardStepper';
import steps from './steps';
import { useHandleChangeRoute } from '../../../layout/hooks';
import { setMappedValue } from '../helpers';
import * as Icons from '@material-ui/icons';
import { Button, Grid } from '@material-ui/core';

export const title = 'Interactive Search';
const buttonWidth = 180;

const FieldActions = ({ handleNext, handleBack, handleSubmit, activeStep }) => {
  return (
    <Grid container justify='center' spacing={4} style={{ marginTop: 16 }}>
      {activeStep > 0 && (
        <Grid item>
          <Button style={{ width: buttonWidth }} onClick={handleBack} variant='outlined' disabled={activeStep === 0}>
            <Icons.KeyboardArrowLeft />
            Go Back
          </Button>
        </Grid>
      )}
      {activeStep !== steps.length - 1 && (
        <Grid item>
          <Button style={{ width: buttonWidth }} color='primary' variant='outlined' onClick={handleNext}>
            Next
            <Icons.KeyboardArrowRight />
          </Button>
        </Grid>
      )}
      <Grid item>
        <Button style={{ width: buttonWidth }} color='primary' variant='outlined' onClick={handleSubmit}>
          Search Now
          <Icons.Search style={{ marginLeft: 4 }} />
        </Button>
      </Grid>
    </Grid>
  );
};

export type ComponentProps =
  | {
      id?: string;
      onClose?: () => any;
    }
  | any;

export default function InteractiveSearchCard({ id = title, onClose, setValues, ...other }: ComponentProps) {
  const handleChangeRoute = useHandleChangeRoute();

  // This monitors the Free field to determine how to set the appropriate cost field
  const handleChange = React.useCallback(
    vals => {
      setValues(prev => {
        const { Free = [] } = evalFunc(vals, prev);
        const isFree = Free.findIndex(i => i === true) > -1;
        return setMappedValue({ field: { id: 'Cost' }, value: isFree ? ['Totally Free'] : [], prev: { ...prev } });
      });
    },
    [setValues]
  );

  return (
    <GenericStepperCard
      id={id}
      submitLabel='Search'
      SubmitIcon={Icons.Search}
      onSubmit={handleChangeRoute(publicUrl('/Apps'))}
      onChange={handleChange}
      steps={steps}
      onClose={onClose}
      open={true}
      title={null}
      setValues={setValues}
      showActions={false}
      elevation={0}
      FieldActions={FieldActions}
      {...other}
    />
  );
}
