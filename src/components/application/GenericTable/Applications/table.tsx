import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import * as Icons from '@mui/icons-material';
import { renderDialogModule } from '../../GenericDialog/DialogButton';
import * as RateNewAppDialog from '../../GenericDialog/RateNewApp/RateNewAppDialog';
import ViewModeButton from './ViewModeButton';
import AdminToggle from './AdminToggle';
import { useColumns } from './columns';
import FilterButton from './FilterButton';
import * as FilterPopover from '../../GenericPopover/Filter';
import { useHandleExport } from '../../../../database/hooks';
import { useIsAdmin } from '../../../../hooks';
import useWidth from '../../../layout/ViewPort/hooks/useWidth';
import { useHandleChangeRoute } from '../../../layout/hooks';
import { publicUrl } from '../../../../helpers';
import TourStep from '../../../pages/Tour/TourStep';

export const name = 'Applications';
const center = text => <div style={{ textAlign: 'center' }}>{text}</div>;

export const CenterRadio = ({ checked = false }) => {
  const Icon = checked ? Icons.RadioButtonChecked : Icons.RadioButtonUnchecked;
  return center(<Icon color='action' fontSize='small' />);
};

export const defaultApplicationsProps: GenericTableContainerProps = {
  name,
  dialogs: [renderDialogModule(RateNewAppDialog)],
  toolbar: false,
  footer: true,
  search: false
};

export const Applications = ({ data, ...props }) => {
  const columns = useColumns();
  const { showButtons = true, HeaderComponent } = props;
  const exportColumns = [{ name: '_id', header: '_id' }, ...columns];
  const handleExport = useHandleExport(data, exportColumns);
  const isAdmin = useIsAdmin();

  const width = useWidth();
  const fixedColumnCount = width >= 900 ? 1 : 0;
  const handleChangeRoute = useHandleChangeRoute();

  return (
    <>
      {HeaderComponent && <HeaderComponent onExport={isAdmin && handleExport} />}
      {showButtons && (
        <>
          <AdminToggle />
          <FilterButton Module={FilterPopover} table={name} />
          <ViewModeButton mode='table' />
        </>
      )}
      <TourStep id={6} onPrev={handleChangeRoute(publicUrl('/Home'))}>
        <GenericTableContainer {...defaultApplicationsProps} data={data} columns={columns} showScroll={true} fixedColumnCount={fixedColumnCount} {...props} />
      </TourStep>
    </>
  );
};
