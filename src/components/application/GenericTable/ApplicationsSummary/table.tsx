import GenericTableContainer, { GenericTableContainerProps } from '../GenericTableContainer';
import { renderDialogModule } from '../../GenericDialog/DialogButton';
import * as RateNewAppDialog from '../../GenericDialog/RateNewApp/RateNewAppDialog';
import ApplicationSummary from './ApplicationSummary';
import { useHandleExport } from '../../../../database/hooks';
import { useIsAdmin } from '../../../../hooks';

const name = 'Applications';
export const defaultApplicationsSummaryProps: GenericTableContainerProps = {
  isGrid: true,
  name,
  dialogs: [renderDialogModule(RateNewAppDialog)],
  columns: [{ name: 'app', header: 'Application', Cell: ApplicationSummary }],
  toolbar: false,
  footer: true,
  search: false
};

export const ApplicationsSummary = ({ data, HeaderComponent, ...other }) => {
  const { columns, ...defaultProps } = defaultApplicationsSummaryProps;
  const handleExport = useHandleExport(data, columns);
  const isAdmin = useIsAdmin();
  return (
    <>
      {HeaderComponent && <HeaderComponent onExport={isAdmin && handleExport} />}
      <GenericTableContainer {...defaultProps} columns={columns} data={data} showScroll={true} {...other} />
    </>
  );
};
