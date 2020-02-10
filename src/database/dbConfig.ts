import Nano from 'nano';

export const databaseAddress = 'https://db3.lamp.digital/';

const nano = Nano(databaseAddress);

export const tables = {
  applications: 'applications',
  ratings: 'ratings',
  ix_app_ratings: 'ix_app_ratings' // local table index for storing app id -> rating id mappings for performance reasons
};

const DB = {
  applications: nano.db.use(`${tables.applications}_${process.env.NODE_ENV}`),
  ratings: nano.db.use(`${tables.ratings}_${process.env.NODE_ENV}`)
};

export default DB;
