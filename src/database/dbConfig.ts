import Nano from 'nano';

export const databaseAddress = 'https://db3.lamp.digital/';

const nano = Nano(databaseAddress);

export const db = nano.db.use(process.env.NODE_ENV);
