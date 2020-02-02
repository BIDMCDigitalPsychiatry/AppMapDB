import { tableFilter } from '../tablehelpers';
import { AppState } from '../../../../store';
import { GenericTableContainerProps } from '../GenericTableContainer';

const testData = index => [
  {
    name: 'Example App ' + index,
    company: 'Company 123',
    ios: 'true',
    android: true,
    offline: true,
    accessibility: false,
    free: false,
    purchases: true,
    subscription: true,
    trackModd: false,
    trackMedication: true,
    journaling: true,
    peerSupport: true,
    cbt: true,
    functionality: 'test 123',
    cost: 'test 1234',
    features: 'test 12345',
    getValues: () => ({ name: 'Example App ' + index, company: 'Company 123' })
  },
  {
    name: 'Another App ' + index + '0',
    company: 'App Company XYZ',
    ios: false,
    android: true,
    offline: false,
    accessibility: false,
    free: false,
    purchases: true,
    subscription: true,
    trackModd: true,
    trackMedication: true,
    journaling: false,
    peerSupport: true,
    cbt: true,    
    getValues: () => ({ name: 'Another App ' + index + '0', company: 'Company XYZ' })
  }
];

const getTestData = () => {
  var data = [];
  for (var i = 0; i < 500; i++) {
    data = data.concat(testData(i));
  }
  return data;
};

export const from_database = (state: AppState, props: GenericTableContainerProps) => {
  var data = getTestData();
  return tableFilter(data, state, props);
};
