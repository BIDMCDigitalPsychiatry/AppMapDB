import RateNewAppDialog from './RateNewAppDialog';

export const title = 'View/Edit App (Admin)';

export default function RateNewAppDialogAdminEdit({ id = title, ...remaining }) {
  return <RateNewAppDialog id={id} {...remaining} isAdminEdit={true} />;
}
