import * as React from 'react';
import { Grid, Typography, Box } from '@material-ui/core';
import logo from '../../../images/logo.png';
import NewWindowLink from './NewWindowLink';

export interface AndroidStoreProps {
  title: string; //DC Universe - The Ultimate DC Membership"
  description: string;
  descriptionHTML: string;
  summary: string; // "Where DC fans can find the best movies, original programming, comics, &amp; more."
  installs: string; // "1,000,000+"
  minInstalls: number; // 1000000
  score: number; // 4.094255
  scoreText: string; // "4.1"
  ratings: number; // 11187
  reviews: number; // 5077
  histogram: object; //  {1: 1395, 2: 461, 3: 843, 4: 1476, 5: 7009}
  price: number; // 0
  free: boolean; // true
  currency: string; // "USD"
  priceText: string; // "Free"
  offersIAP: boolean; // true
  IAPRange: string; // "$3.99 - $74.99 per item"
  size: string; // "49M"
  androidVersion: string; // "5.0"
  androidVersionText: string; // "5.0 and up
  developer: string; //'Google LLC';
  developerId: string; //'5700313618786177705';
  developerEmail: string; //'translate-android-support@google.com';
  developerWebsite: string; //'http://support.google.com/translate';
  developerAddress: string; //'1600 Amphitheatre Parkway, Mountain View 94043';
  privacyPolicy: string; //'http://www.google.com/policies/privacy/';
  developerInternalID: string; //'5700313618786177705';
  genre: string; //'Tools';
  genreId: string; //'TOOLS';
  familyGenre: string; //undefined;
  familyGenreId: string; //undefined;
  icon: string; //'https://lh3.googleusercontent.com/ZrNeuKthBirZN7rrXPN1JmUbaG8ICy3kZSHt-WgSnREsJzo2txzCzjIoChlevMIQEA';
  headerImage: string; //'https://lh3.googleusercontent.com/e4Sfy0cOmqpike76V6N6n-tDVbtbmt6MxbnbkKBZ_7hPHZRfsCeZhMBZK8eFDoDa1Vf-';
  screenshots: string[]; //['https://lh3.googleusercontent.com/dar060xShkqnJjWC2j_EazWBpLo28X4IUWCYXZgS2iXes7W99LkpnrvIak6vz88xFQ','https://lh3.googleusercontent.com/VnzidUTSWK_yhpNK0uqTSfpVgow5CsZOnBdN3hIpTxODdlZg1VH1K4fEiCrdUQEZCV0'];
  video: string; //undefined;
  videoImage: string; //undefined;
  contentRating: string; // 'Everyone';
  contentRatingDescription: string; //undefined;
  adSupported: boolean; //false;
  released: any; //undefined;
  updated: number; //1576868577000;
  version: string; //'Varies with device';
  recentChanges: string; //'Improved offline translations with upgraded language downloads';
  comments: string[];
  editorsChoice: boolean; //true;
  appId: string; //'com.google.android.apps.translate';
  url: string; //'https://play.google.com/store/apps/details?id=com.google.android.apps.translate&hl=en&gl=us';
}

const AndroidStore = ({ value = {} as AndroidStoreProps }) => {
  const { icon = logo, title, developer, description, installs, offersIAP, free, adSupported, url } = value;

  return (
    <>
      <Grid container spacing={2}>
        <Grid item>
          <img style={{ height: 100 }} src={icon} alt='logo' />
        </Grid>
        <Grid item xs>
          <Grid container>
            <Grid item xs={12}>
              <Typography variant='h5'>{title}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography color='textSecondary'>{developer}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography color='textSecondary' variant='caption'>
                {installs} Installs {offersIAP && ' | In-App Purchases'} {free && ' | Free'} {adSupported && ' | Ad Supported'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <NewWindowLink url={url} label={'Open in Google Play Store'} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Box mt={2}>
        <Typography>{description}</Typography>
      </Box>
    </>
  );
};

export default AndroidStore;
