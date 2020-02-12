import Nano from 'nano';

export default interface Rating extends Nano.MaybeDocument {
  appId: string;
  name: string; // Name of user
  review: string;
  rating: string;
  time: number;
}
