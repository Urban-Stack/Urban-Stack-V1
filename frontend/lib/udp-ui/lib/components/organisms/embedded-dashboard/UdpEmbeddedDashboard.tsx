const HIDE_TOP_NAVIGATION = 1;

export const SUPERSET_DASHBOARD_TITLE = 'superset-dashboard';

interface AppDashboardProps {
  supersetBaseUrl: string;
  slug: string;
  editMode?: boolean;
  className?: string;
}

/**
 * Embedded Superset dashboard.
 *
 * @param supersetBaseUrl Superset base URL
 * @param slug            slug of the dashboard to embed
 * @param editMode        `true` in order to show this dashboard in edit mode - `false` otherwise
 * @param className       class name for this dashboard
 * @constructor
 */
const UdpEmbeddedDashboard = ({
  supersetBaseUrl,
  slug,
  editMode = false,
  className,
}: AppDashboardProps) => {
  const queryParams = new URLSearchParams({
    standalone: String(HIDE_TOP_NAVIGATION),
    edit: String(editMode),
  });
  return (
    <div className={className}>
      <iframe
        title={SUPERSET_DASHBOARD_TITLE}
        className={'size-full rounded-xl'}
        src={`${supersetBaseUrl}/superset/dashboard/${slug}/?${queryParams}`}
      />
    </div>
  );
};

export default UdpEmbeddedDashboard;
