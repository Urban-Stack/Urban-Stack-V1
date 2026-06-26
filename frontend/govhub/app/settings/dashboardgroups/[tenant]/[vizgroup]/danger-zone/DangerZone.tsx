'use client';
import { UdpDangerZoneDialog, UdpToast } from 'udp-ui/components';
import { useParams, useRouter } from 'next/navigation';
import { deleteVizGroup } from './actions';

const DangerZone = () => {
  const _params = useParams<{ tenant: string; vizgroup: string }>();
  const tenant = _params.tenant;
  const vizgroup = _params.vizgroup;

  const successToast = UdpToast(
    'Dashboard-Gruppe erfolgreich gelöscht',
    'success',
  );
  const errorToast = UdpToast(
    'Dashboard-Gruppe konnte nicht gelöscht werden',
    'error',
  );

  const router = useRouter();

  const callback = () =>
    deleteVizGroup(tenant, vizgroup)
      .then((result) => {
        if (!result.errors) {
          router.replace('/settings/dashboardgroups');
          successToast();
        } else {
          throw Error('GraphQL Error!');
        }
      })
      .catch(() => {
        errorToast();
      });

  return (
    <UdpDangerZoneDialog
      deleteCallback={callback}
      headlineText={`Hier können Sie die Dashboard-Gruppe "${vizgroup}" löschen`}
      explainerText={
        'Alle Daten, die in der Dashboard-Gruppe enthalten sind, werden dauerhaft gelöscht! Diese Aktion kann nicht rückgängig gemacht werden!'
      }
      labelText='Geben Sie hier zur Bestätigung den Namen der Dashboard-Gruppe ein, die Sie löschen wollen.'
      resourceName={vizgroup}
      className='max-w-[500px]'
    />
  );
};

export default DangerZone;
