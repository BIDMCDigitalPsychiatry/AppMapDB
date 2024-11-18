import ViewAppDialog from '../../GenericDialog/ViewApp';
import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import ApplicationGrid from './ApplicationsGrid';
import { PwaApplicationsGridItem } from './ApplicationsGridItem';

const name = 'Applications';

const defaultProps: GenericTableContainerProps = {
  isGrid: true,
  GridItem: PwaApplicationsGridItem,
  name,
  columns: [{ name: 'app', header: 'Application', Cell: ApplicationGrid }],
  toolbar: false,
  footer: true,
  search: false
};

export const PwaApplicationsGrid = ({ data, HeaderComponent = undefined, ...other }) => {
  const { columns, ...remaining } = defaultProps;
  return (
    <>
      <ViewAppDialog />
      <GenericTableContainer {...remaining} columns={columns} data={data} showScroll={true} {...other} />
    </>
  );
};
