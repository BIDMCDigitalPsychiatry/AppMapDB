import * as React from 'react';
import { Grid, Typography, Box } from '@material-ui/core';
import logo from '../../../images/logo.png';

export interface AppleStoreProps {
  id: number; // 363590051
  appId: string; //"com.netflix.Netflix"
  title: string; //"Netflix"
  url: string; //"https://apps.apple.com/us/app/netflix/id363590051?uo=4"
  description: string; //"Looking for the most talked about TV shows and movies from the around the world? They’re all on Netflix.↵↵We’ve got award-winning series, movies, documentaries, and stand-up specials. And with the mobile app, you get Netflix while you travel, commute, or just take a break.↵↵What you’ll love about Netflix:↵↵• We add TV shows and movies all the time. Browse new titles or search for your favorites, and stream videos right on your device.↵• The more you watch, the better Netflix gets at recommending TV shows and movies you’ll love.↵• Create up to five profiles for an account. Profiles give different members of your household their own personalized Netflix.↵• Enjoy a safe watching experience just for kids with family-friendly entertainment.↵• Preview quick videos of our series and movies and get notifications for new episodes and releases.↵• Save your data. Download titles to your mobile device and watch offline, wherever you are.↵↵Privacy policy: https://help.netflix.com/legal/privacy↵Terms of use: https://help.netflix.com/legal/termsofuse"
  icon: string; //"https://is5-ssl.mzstatic.com/image/thumb/Purple114/v4/40/c2/82/40c28204-e3f5-65ec-b630-27b3f9a12876/source/512x512bb.jpg"
  genres: string[]; //(2) ["Entertainment", "Lifestyle"]
  genreIds: string[]; //(2) ["6016", "6012"]
  primaryGenre: string; //"Entertainment"
  primaryGenreId: number; //6016
  contentRating: string; //"12+"
  languages: string[]; //(27) ["AR", "CS", "DA", "NL", "EN", "FI", "FR", "DE", "EL", "HE", "HU", "ID", "IT", "JA", "KO", "NB", "PL", "PT", "RO", "ZH", "ES", "SW", "SV", "TH", "ZH", "TR", "VI"]
  size: string; //"80943104"
  requiredOsVersion: string; //"12.0"
  released: string; //"2010-04-01T20:41:34Z"
  updated: string; //"2020-02-18T17:01:38Z"
  releaseNotes: string; //"Someone eyeing your Netflix app on the bus? Make sure it’s the latest and greatest. Get the update for our best experience yet.↵↵And in this release, we fixed bugs and made performance improvements. Just for you."
  version: string; //"12.19.0"
  price: number; //0
  currency: string; //"USD"
  free: boolean; //true
  developerId: number; //363590054
  developer: string; //"Netflix, Inc."
  developerUrl: string; //"https://apps.apple.com/us/developer/netflix-inc/id363590054?uo=4"
  developerWebsite: string; //"http://www.netflix.com"
  score: number; //3.5
  reviews: number; //482090
  currentVersionScore: number; //4.5
  currentVersionReviews: number; //11
  screenshots: string[]; // (7) ["https://is4-ssl.mzstatic.com/image/thumb/Purple113…-faa4-d287f3c84ecc/mzl.klttrelm.jpg/392x696bb.jpg", "https://is1-ssl.mzstatic.com/image/thumb/Purple113…-a538-e044cc67e890/mzl.kkxqrlen.jpg/392x696bb.jpg", "https://is4-ssl.mzstatic.com/image/thumb/Purple113…-362a-ebe6a289fe9a/mzl.bhjzwljf.jpg/392x696bb.jpg", "https://is5-ssl.mzstatic.com/image/thumb/Purple113…-cf21-f489edaf985b/mzl.vrbxsewe.jpg/392x696bb.jpg", "https://is2-ssl.mzstatic.com/image/thumb/Purple113…-844a-49783496f3b8/mzl.oizywyce.jpg/392x696bb.jpg", "https://is4-ssl.mzstatic.com/image/thumb/Purple113…-903d-12e656b3262c/mzl.ymutaeih.jpg/392x696bb.jpg", "https://is3-ssl.mzstatic.com/image/thumb/Purple123…-8200-4114e18b57cb/mzl.sodmwfvq.jpg/392x696bb.jpg"]
  ipadScreenshots: string[]; //(7) ["https://is5-ssl.mzstatic.com/image/thumb/Purple123…-9321-50a2f379b1e2/mzl.sqrdwpkl.jpg/552x414bb.jpg", "https://is2-ssl.mzstatic.com/image/thumb/Purple113…-f630-e0b7483b6545/mzl.lkqzxhbq.jpg/552x414bb.jpg", "https://is2-ssl.mzstatic.com/image/thumb/Purple123…-c649-ee63fabb7fef/mzl.ynnrdwrt.jpg/552x414bb.jpg", "https://is1-ssl.mzstatic.com/image/thumb/Purple113…-6e07-7e7b06983299/mzl.pqocidkz.jpg/552x414bb.jpg", "https://is4-ssl.mzstatic.com/image/thumb/Purple123…-1d13-0aa5aa149391/mzl.jindmgfn.jpg/552x414bb.jpg", "https://is2-ssl.mzstatic.com/image/thumb/Purple123…-3a9a-74c6131acfea/mzl.jmqdchhm.jpg/552x414bb.jpg", "https://is4-ssl.mzstatic.com/image/thumb/Purple123…-0310-13463628cd5b/mzl.pxlctvjo.jpg/552x414bb.jpg"]
  appletvScreenshots: string[];
  supportedDevices: string; //(51) ["iPhone5s-iPhone5s", "iPadAir-iPadAir", "iPadAirCellular-iPadAirCellular", "iPadMiniRetina-iPadMiniRetina", "iPadMiniRetinaCellular-iPadMiniRetinaCellular", "iPhone6-iPhone6", "iPhone6Plus-iPhone6Plus", "iPadAir2-iPadAir2", "iPadAir2Cellular-iPadAir2Cellular", "iPadMini3-iPadMini3", "iPadMini3Cellular-iPadMini3Cellular", "iPodTouchSixthGen-iPodTouchSixthGen", "iPhone6s-iPhone6s", "iPhone6sPlus-iPhone6sPlus", "iPadMini4-iPadMini4", "iPadMini4Cellular-iPadMini4Cellular", "iPadPro-iPadPro", "iPadProCellular-iPadProCellular", "iPadPro97-iPadPro97", "iPadPro97Cellular-iPadPro97Cellular", "iPhoneSE-iPhoneSE", "iPhone7-iPhone7", "iPhone7Plus-iPhone7Plus", "iPad611-iPad611", "iPad612-iPad612", "iPad71-iPad71", "iPad72-iPad72", "iPad73-iPad73", "iPad74-iPad74", "iPhone8-iPhone8", "iPhone8Plus-iPhone8Plus", "iPhoneX-iPhoneX", "iPad75-iPad75", "iPad76-iPad76", "iPhoneXS-iPhoneXS", "iPhoneXSMax-iPhoneXSMax", "iPhoneXR-iPhoneXR", "iPad812-iPad812", "iPad834-iPad834", "iPad856-iPad856", "iPad878-iPad878", "iPadMini5-iPadMini5", "iPadMini5Cellular-iPadMini5Cellular", "iPadAir3-iPadAir3", "iPadAir3Cellular-iPadAir3Cellular", "iPodTouchSeventhGen-iPodTouchSeventhGen", "iPhone11-iPhone11", "iPhone11Pro-iPhone11Pro", "iPadSeventhGen-iPadSeventhGen", "iPadSeventhGenCellular-iPadSeventhGenCellular", "iPhone11ProMax-iPhone11ProMax"]
}

const AppleStore = ({ value = {} as AppleStoreProps, forceErrorMargin = false, error = undefined, initialValue = undefined, ...other }) => {
  console.log(value);
  const { icon = logo, title, developer, description, free } = value;
  return (
    <>
      <Grid container spacing={2}>
        <Grid item>
          <img style={{ height: 100 }} src={icon} alt='logo' />
        </Grid>
        <Grid item xs>
          <Typography variant='h5'>{title}</Typography>
          <Typography color='textSecondary'>{developer}</Typography>
          <Typography color='textSecondary' variant='caption'>
            {free && 'Free'}
          </Typography>
        </Grid>
      </Grid>
      <Box mt={2}>
        <Typography>{description}</Typography>
      </Box>
    </>
  );
};

export default AppleStore;
