import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import * as Icons from '@material-ui/icons';
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
  const handleExport = useHandleExport(data, columns);
  const isAdmin = useIsAdmin();

  const width = useWidth();
  const fixedColumnCount = width >= 900 ? 1 : 0;

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
      <GenericTableContainer {...defaultApplicationsProps} data={data} columns={columns} showScroll={true} fixedColumnCount={fixedColumnCount} {...props} />
    </>
  );
};
