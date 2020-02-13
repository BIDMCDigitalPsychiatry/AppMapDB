import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import logo from '../../../../images/logo.png';
import * as Icons from '@material-ui/icons';
import Application, { ClinicalFoundations, Costs, Platforms, Privacies } from '../../../../database/models/Application';
import OutlinedDiv from '../../../general/OutlinedDiv/OutlinedDiv';
import { Features } from '../Applications/table';
import RatingsColumn from '../Applications/RatingsColumn';

function StyledRadio({ checked = false }) {
  const Icon = checked ? Icons.RadioButtonChecked : Icons.RadioButtonUnchecked;
  return <Icon color='action' fontSize='small' style={{ height: 14 }} />;
}

interface AppSummaryProps {
  ratingIds: string[];
  rating: number;
}

export default function AppSummary({
  _id,
  name,
  company,
  platforms = [],
  costs = [],
  privacies = [],
  features = [],
  clinicalFoundation,
  ratingIds = [],
  rating
}: Application & AppSummaryProps) {
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
          <Grid item xs={12} style={{ maxWidth: 140 }}>
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
                { title: 'Privacy', items: Privacies, values: privacies },
                { title: 'Clinical Foundation', items: ClinicalFoundations, values: [clinicalFoundation] }
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
}
