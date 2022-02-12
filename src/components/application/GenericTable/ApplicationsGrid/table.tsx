import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import { renderDialogModule } from '../../GenericDialog/DialogButton';
import * as RateNewAppDialog from '../../GenericDialog/RateNewApp/RateNewAppDialog';
import ApplicationGrid from './ApplicationsGrid';
import { useHandleExport } from '../../../../database/hooks';
import { useIsAdmin } from '../../../../hooks';
import ApplicationsGridItem from './ApplicationsGridItem';

const name = 'Applications';
export const defaultProps: GenericTableContainerProps = {
  isGrid: true,
  GridItem: ApplicationsGridItem,
  name,
  dialogs: [renderDialogModule(RateNewAppDialog)],
  columns: [{ name: 'app', header: 'Application', Cell: ApplicationGrid }],
  toolbar: false,
  footer: true,
  search: false
};

export const ApplicationsGrid = ({ data, HeaderComponent, ...other }) => {
  const { columns, ...remaining } = defaultProps;
  const handleExport = useHandleExport(data, columns);
  const isAdmin = useIsAdmin();
  return (
    <>
      {HeaderComponent && <HeaderComponent onExport={isAdmin && handleExport} />}
      <GenericTableContainer {...remaining} columns={columns} data={data} showScroll={true} {...other} />
    </>
  );
};
