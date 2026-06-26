/* c8 ignore start */
import { mkMetadata } from '@/app/meta';
import DangerZone from './DangerZone';

export const generateMetadata = mkMetadata({ pageName: 'Danger Zone' });

const DangerZonePage = () => <DangerZone />;

export default DangerZonePage;
