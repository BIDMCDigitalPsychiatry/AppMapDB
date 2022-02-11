import React from 'react';
import { Grid, Typography, Collapse } from '@mui/material';
import { InjectField } from '../../Fields';
import OutlinedDiv from '../../../../general/OutlinedDiv/OutlinedDiv';
import LightTooltip from '../../../../general/LightTooltip/LightTooltip';
import * as Icons from '@mui/icons-material';
import { ApplicationTabs } from './ApplicationTabs';

export default function ClinicalFoundationInfo({ fields, values, mapField, fullWidth, setValues, state, setState, ...props }) {
  const injectField = id => <InjectField id={id} fields={fields} values={values} mapField={mapField} fullWidth={fullWidth} {...props} />;
  const clinicalFoundations = values.applications.clinicalFoundations || [];

  return (
    <Grid container justifyContent='center' spacing={3}>
      <Grid item xs style={{ maxWidth: 700 }}>
        <ApplicationTabs state={state} values={values} injectField={injectField} fields={fields} setValues={setValues} setState={setState} />
      </Grid>
      <Grid item xs style={{ minWidth: 280, maxWidth: 600 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {injectField('clinicalFoundations')}
          </Grid>
          <Grid item xs={12}>
            <Collapse in={clinicalFoundations.includes('Supporting Studies')}>
              <OutlinedDiv label='Supporting Studies'>
                {[
                  { id: 'feasibilityStudies', label: 'How many feasibility/usability studies?' },
                  { id: 'feasibilityStudiesLink', label: '', width: 500 },
                  {
                    id: 'feasibilityImpact',
                    label: 'What is the highest feasibility impact factor?',
                    tooltip: `What is the impact factor of the journal in which the feasibility study is published? This can easily be found with a quick google search. If it's not immediately evident, put "0" and assume the journal doesn't have an impact factor.`
                  },
                  { id: 'efficacyStudies', label: 'How many evidence/efficacy studies?' },
                  { id: 'efficacyStudiesLink', label: '', width: 500 },
                  {
                    id: 'efficacyImpact',
                    label: 'What is the highest efficacy impact factor?',
                    tooltip: `What is the impact factor of the journal in which the efficacy study is published? This can easily be found with a quick google search. If it's not immediately evident, put "0" and assume the journal doesn't have an impact factor.`
                  }
                ].map(({ label, id, width = 94, tooltip }) => (
                  <Grid key={id} container alignItems='center' justifyContent='space-between' spacing={2}>
                    <Grid item>
                      <Typography>{label}</Typography>
                    </Grid>
                    <Grid item>
                      <Grid container justifyContent='flex-end' alignItems='center' spacing={1}>
                        {tooltip && (
                          <Grid item>
                            <LightTooltip title={tooltip}>
                              <Icons.HelpOutlined fontSize='small' color='primary' />
                            </LightTooltip>
                          </Grid>
                        )}
                        <Grid item style={{ width }}>
                          {injectField(id)}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                ))}
              </OutlinedDiv>
            </Collapse>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
