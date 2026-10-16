import RateNewAppDialog from './RateNewAppDialog';
import { tx } from '../../../../i18n';

export const title = tx('View/Edit App (Admin)'); // also the dialog-state id: tx keeps it English

export default function RateNewAppDialogAdminEdit({ id = title, ...remaining }) {
  return <RateNewAppDialog id={id} {...remaining} isAdminEdit={true} />;
}
