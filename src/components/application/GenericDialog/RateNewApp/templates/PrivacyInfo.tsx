import React from 'react';
import { Grid, Typography, Collapse } from '@mui/material';
import { InjectField } from '../../Fields';
import OutlinedDiv from '../../../../general/OutlinedDiv/OutlinedDiv';
import * as Icons from '@mui/icons-material';
import LightTooltip from '../../../../general/LightTooltip/LightTooltip';
import { ApplicationTabs } from './ApplicationTabs';

export default function PrivacyInfo({ fields, values, mapField, fullWidth, setValues, state, setState, ...props }) {
  const injectField = id => <InjectField id={id} fields={fields} values={values} mapField={mapField} fullWidth={fullWidth} {...props} />;
  const privacies = values.applications.privacies || [];

  return (
    <Grid container justifyContent='center' spacing={3}>
      <Grid item xs style={{ maxWidth: 700 }}>
        <ApplicationTabs state={state} values={values} injectField={injectField} fields={fields} setValues={setValues} setState={setState} />
      </Grid>
      <Grid item xs style={{ minWidth: 280, maxWidth: 550 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {injectField('privacies')}
          </Grid>
          <Grid item xs={12}>
            <Collapse in={privacies.includes('Has Privacy Policy')}>
              <OutlinedDiv label='Privacy Policy Reading Level'>
                <Grid container alignItems='center' justifyContent='space-between' spacing={2}>
                  <Grid item>
                    <Typography>Reading grade level of the privacy policy?</Typography>
                  </Grid>
                  <Grid item>
                    <Grid container justifyContent='flex-end' alignItems='center' spacing={1}>
                      <Grid item>
                        <LightTooltip
                          title={
                            'Flesch-Kincaid grade level: https://readabilityformulas.com/free-readability-formula-tests.php (just copy and paste privacy policy in)'
                          }
                        >
                          <Icons.HelpOutlined fontSize='small' color='primary' />
                        </LightTooltip>
                      </Grid>
                      <Grid item style={{ width: 94 }}>
                        {injectField('readingLevel')}
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </OutlinedDiv>
            </Collapse>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
