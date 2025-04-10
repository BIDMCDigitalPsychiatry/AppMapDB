import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import { renderDialogModule } from '../../GenericDialog/DialogButton';
import * as RateNewAppDialog from '../../GenericDialog/RateNewApp/RateNewAppDialog';
import ApplicationGrid from './ApplicationsGrid';
import { useHandleExport } from '../../../../database/hooks';
import { useIsAdmin } from '../../../../hooks';
import ApplicationsGridItem from './ApplicationsGridItem';
import { useHandleChangeRoute } from '../../../layout/hooks';
import { publicUrl } from '../../../../helpers';
import TourStep from '../../../pages/Tour/TourStep';
import * as RateNewAppDialogAdminEdit from '../../GenericDialog/RateNewApp/RateNewAppDialogAdminEdit';

const name = 'Applications';
export const extraExportColumns = [
  { name: 'description', header: 'description' },
  { name: 'iosLink', header: 'iosLink' },
  { name: 'androidLink', header: 'androidLink' },
  { name: 'webLink', header: 'webLink' }
];
export const defaultProps: GenericTableContainerProps = {
  isGrid: true,
  GridItem: ApplicationsGridItem,
  name,
  dialogs: [renderDialogModule(RateNewAppDialog), renderDialogModule(RateNewAppDialogAdminEdit)],
  columns: [{ name: 'app', header: 'Application', Cell: ApplicationGrid }],
  toolbar: false,
  footer: true,
  search: false
};

export const ApplicationsGrid = ({ data, HeaderComponent = undefined, ...other }) => {
  const { columns, ...remaining } = defaultProps;
  const exportColumns = [{ name: '_id', header: '_id' }, ...(columns as any), ...extraExportColumns];
  const handleExport = useHandleExport(data, exportColumns);
  const isAdmin = useIsAdmin();
  const handleChangeRoute = useHandleChangeRoute();
  return (
    <>
      {HeaderComponent && <HeaderComponent onExport={isAdmin && handleExport} />}
      <TourStep id={6} onPrev={handleChangeRoute(publicUrl('/Home'))}>
        <GenericTableContainer {...remaining} columns={columns} data={data} showScroll={true} {...other} />
      </TourStep>
    </>
  );
};
