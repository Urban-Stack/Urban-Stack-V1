'use client';

import { UdpDangerZoneDialog, UdpToast } from 'udp-ui/components';
import { useParams, useRouter } from 'next/navigation';
import { deleteProject } from './actions';

const DangerZone = () => {
  const _params = useParams<{ tenant: string; projectname: string }>();
  const tenant = _params.tenant;
  const project = _params.projectname;

  const successToast = UdpToast('Projekt erfolgreich gelöscht', 'success');
  const errorToast = UdpToast('Projekt konnte nicht gelöscht werden', 'error');
  const router = useRouter();

  const callback = () =>
    deleteProject(tenant, project)
      .then((result) => {
        if (!result.errors) {
          router.replace('/settings/projects');
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
      headlineText={`Hier können Sie das Projekt "${project}" löschen`}
      explainerText={
        'Alle Daten, die in dem Projekt enthalten sind, werden dauerhaft gelöscht! Diese Aktion kann nicht rückgängig gemacht werden!'
      }
      labelText='Geben Sie hier zur Bestätigung den Namen des Projekts ein, das Sie löschen wollen.'
      resourceName={project}
      className='max-w-[500px]'
    />
  );
};

export default DangerZone;
