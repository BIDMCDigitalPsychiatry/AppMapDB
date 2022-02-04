export interface Team {
  _id: string;
  title: string;
  subTitle: string;
  shortDescription?: string;
  image?: string;
  sortKey?: string;
  created?: number;
  updated?: number;
  deleted?: boolean;
}

export const useDefaultValues = (props = undefined) => {
  return {
    created: new Date().getTime(),
    ...props
  };
};
