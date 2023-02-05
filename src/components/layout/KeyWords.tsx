import * as React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import pkg from '../../../package.json';

const useStyles = makeStyles(() => ({
  keyWords: {
    backgroundColor: 'white',
    color: 'white',
    fontSize: 6,
    height: 0,
    width: 0,
    position: 'absolute'
  }
}));

export default function KeyWords() {
  const classes = useStyles({});
  return <div className={classes.keyWords}>{pkg.keyWords}</div>;
}
