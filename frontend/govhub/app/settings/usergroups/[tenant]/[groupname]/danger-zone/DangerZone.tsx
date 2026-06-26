'use client';

import { UdpDangerZoneDialog, UdpToast } from 'udp-ui/components';
import { useParams, useRouter } from 'next/navigation';
import { deleteUserGroup } from '@/app/settings/usergroups/actions';
import { UserGroup } from '@/app/_lib/resource-api/usergroups/usergroups';

const DangerZone = () => {
  const _params = useParams<{ tenant: string; groupname: string }>();
  const tenant = _params.tenant;
  const group = _params.groupname;

  const successToast = UdpToast(
    'Benutzergruppe erfolgreich gelöscht',
    'success',
  );
  const errorToast = UdpToast(
    'Benutzergruppe konnte nicht gelöscht werden',
    'error',
  );
  const router = useRouter();

  const callback = () =>
    deleteUserGroup({ tenant: tenant, name: group } as UserGroup)
      .then((result) => {
        if (!result.errors) {
          router.replace('/settings/usergroups');
          successToast();
        } else {
          throw Error('GraphQl Error!');
        }
      })
      .catch(() => {
        errorToast();
      });

  return (
    <UdpDangerZoneDialog
      deleteCallback={callback}
      headlineText={`Hier können Sie die Benutzergruppe "${group}" des Mandanten "${tenant}" löschen`}
      explainerText={
        'Die Benutzergruppe, sowie die Verbindungen zwischen der Gruppe und aller ihrer Mitglieder, werden dauerhaft gelöscht! Diese Aktion kann nicht rückgängig gemacht werden!'
      }
      labelText='Geben Sie hier zur Bestätigung den Namen der Benutzergruppe ein, die Sie löschen wollen.'
      resourceName={group}
      className='max-w-[600px]'
    />
  );
};

export default DangerZone;
