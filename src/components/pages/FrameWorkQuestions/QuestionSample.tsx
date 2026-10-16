import * as React from 'react';
import { Grid, Typography, useTheme } from '@mui/material';
import { useT } from '../../../i18n';

export default function QuestionSample({ title, color = 'white', background, rows = [] }) {
  const t = useT();
  const theme = useTheme();

  return (
    <Grid container>
      <Grid item>
        <Typography style={{ background, borderRadius: 8, padding: '4px 8px', color }}>{t(title)}</Typography>
      </Grid>
      <Grid item xs={12}>
        <ul style={{ marginLeft: -24, fontSize: 12, fontWeight: 700, color: theme.palette.text.secondary }}>
          <Grid container spacing={1}>
            {rows.map((text, i) => (
              <Grid key={`qs-${i}`} item xs={12}>
                <li>
                  <Typography style={{ fontWeight: 700, fontSize: 14 }} color='textSecondary'>
                    {t(text)}
                  </Typography>
                </li>
              </Grid>
            ))}
          </Grid>
        </ul>
      </Grid>
    </Grid>
  );
}
