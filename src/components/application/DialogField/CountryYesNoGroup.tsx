import * as React from 'react';
import YesNoGroup from './YesNoGroup';
import { tables } from '../../../database/dbConfig';
import { getAppCountries } from '../../../database/models/Application';

// Country Availability answers. Apps rated before this question existed have no countries answer yet,
// so show the answers derived from the legacy Canada use until the rater changes them.
const CountryYesNoGroup = ({ value = undefined, values = undefined, ...other }) => {
  const application = values?.[tables.applications] ?? {};
  const effective = Array.isArray(value) ? value : getAppCountries({ ...application, countries: undefined });
  return <YesNoGroup value={effective} {...other} />;
};

export default CountryYesNoGroup;
