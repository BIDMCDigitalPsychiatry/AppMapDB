import React from 'react';
import { useDialogState } from '../useDialogState';
import Application from '../../../../database/models/Application';
import { tables } from '../../../../database/dbConfig';
import { useProcessData } from '../../../../database/useProcessData';
import { uuid, publicUrl, isEmpty } from '../../../../helpers';
import steps from './steps';
import { useChangeRoute } from '../../../layout/hooks';
import GenericStepperDialog from '../GenericStepperDialog';
import { useSelector } from 'react-redux';
import { useApplications } from '../../../../database/useApplications';

export const title = 'View/Edit App';

// Duplicate-group prevention: if the "new" app is already in the library
// (matched by its store package ids), reuse the existing groupId so the
// rating joins that app's lineage instead of creating a second public card.
// (This is how CBT Companion/Dare/Slumber/Welltory ended up duplicated —
// see PLAN_DATABASE_INDEXES.md Phase 0.2.)
export const findExistingGroupId = (apps: Record<string, any>, application: any): string | undefined => {
  const iosId = application?.appleStore?.appId;
  const androidId = application?.androidStore?.appId;
  if (isEmpty(iosId) && isEmpty(androidId)) return undefined;
  for (const k of Object.keys(apps ?? {})) {
    const row = apps[k];
    if ((!isEmpty(iosId) && row?.appleStore?.appId === iosId) || (!isEmpty(androidId) && row?.androidStore?.appId === androidId)) {
      return isEmpty(row.groupId) ? row._id : row.groupId;
    }
  }
  return undefined;
};

export interface ComponentProps {
  id?: string;
  onClose?: () => any;
  isAdminEdit: boolean;
}

export default function RateNewAppDialog({ id = title, onClose, isAdminEdit = false }: ComponentProps) {
  const [{ type }, setDialogState] = useDialogState(id);
  const [_steps, setSteps] = React.useState(steps(type));

  React.useEffect(() => {
    setSteps(steps(type));
  }, [type]);

  const processData = useProcessData();
  const changeRoute = useChangeRoute();

  const email = useSelector((s: any) => s.layout.user?.signInUserSession?.idToken?.payload?.email);
  const uid = useSelector((s: any) => s.layout.user?.username);
  const [apps] = useApplications();

  // If you need to impersonate a user for the edit dialog, use below code:
  //const email = 'wooseok.kwon@vanderbilt.edu';
  //const uid = '4921e472-a03e-4752-a469-2ed3d483f1c3';

  const handleProcessData = (values, Action, handleReset = undefined, draft = false) => {
    const application: Application = values[tables.applications];
    const timestamp = new Date().getTime();

    if (Action === 'c') {
      application._id = uuid(); // If creating a new, generate the id client side so it can be linked to the rating    }
      application.groupId = findExistingGroupId(apps, application) ?? uuid(); // Join the app's existing lineage if it's already in the library; otherwise start a new group
      application.created = timestamp;
      application.approved = false;
    } else if (Action === 'u') {
      // If we are updating an existing entry, we actually create a new row with  link back to the parent
      application.parent = { _id: application._id, _rev: application._rev };
      if (isEmpty(application.groupId)) {
        application.groupId = application._id; // If we don't have a group id yet then use the app id for the first group id so we can still link it to the parent before this wa implemented
      }
      application._id = uuid(); // Create new id so a new row is created
      application._rev = undefined; // reset revision
      application.created = timestamp;
      application.approved = false; // New items should not be approved by default
      Action = 'c'; // Switch action to create for political correctness
    }

    application.updated = timestamp;

    setDialogState(prev => ({ ...prev, loading: true }));

    processData({
      Model: tables.applications,
      Action,
      Data: {
        ...application,
        email: isAdminEdit && !isEmpty(application.email) ? application.email : email, // If admin is editing, keep the original email
        uid,
        draft
      },
      onError: () => setDialogState(prev => ({ ...prev, loading: false, error: 'Error submitting values' })),
      onSuccess: () => {
        handleReset && handleReset();
        changeRoute(publicUrl('/Apps'));
        handleClose();
      }
    });
  };

  const handleSubmit = (values, handleReset) => {
    handleProcessData(values, type === 'Edit' ? 'u' : 'c', handleReset, false);
  };

  const handleClose = React.useCallback(() => {
    setDialogState(prev => ({ ...prev, open: false, submitting: false, errors: {} }));
    onClose && onClose();
  }, [setDialogState, onClose]);

  return <GenericStepperDialog id={id} maxWidth='lg' submitLabel='Save' title={title} onSubmit={handleSubmit} steps={_steps} onClose={onClose} timeout={0} />;
}
