import Nano from 'nano';
import Application from './models/Application';

export const databaseAddress = 'https://db3.lamp.digital/';

const nano = Nano(databaseAddress);

export type DataModel = Application;
export type TableName = 'applications' | 'filters';

export const tables = {
  applications: 'applications' as TableName,  
  filters: 'filters' as TableName,  
};

const DB = {
  applications: nano.db.use(`${tables.applications}_${process.env.NODE_ENV}`),  
  filters: nano.db.use(`${tables.filters}`)
};

export default DB;
