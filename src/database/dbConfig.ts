import Nano from 'nano';
import Rating from './models/Rating';
import Application from './models/Application';

export const databaseAddress = 'https://db3.lamp.digital/';

const nano = Nano(databaseAddress);

export type DataModel = Application | Rating;
export type TableName = 'applications' | 'ratings' | 'ix_app_ratings';

export const tables = {
  applications: 'applications' as TableName,
  ratings: 'ratings' as TableName,
  ix_app_ratings: 'ix_app_ratings' as TableName // local table index for storing app id -> rating id mappings for performance reasons
};

const DB = {
  applications: nano.db.use(`${tables.applications}_${process.env.NODE_ENV}`),
  ratings: nano.db.use(`${tables.ratings}_${process.env.NODE_ENV}`)
};

export default DB;
