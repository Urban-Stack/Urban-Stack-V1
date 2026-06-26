/* c8 ignore start */
'use client';

import React, { useEffect } from 'react';

interface AppIframeLoginProps {
  supersetBaseUrl: string;
}

/**
 * This component uses an iframe to log in to Superset and obtains a session cookie.
 *
 * @param supersetBaseUrl Superset base URL
 */
const AppSupersetLogin: React.FC<AppIframeLoginProps> = ({
  supersetBaseUrl,
}) => {
  useEffect(() => {
    const SUPERSET_IFRAME_ID = 'superset-login-iframe';
    const existsIframe = !!document.getElementById(SUPERSET_IFRAME_ID);

    if (existsIframe) return;

    // create hidden iframe
    const iframe = document.createElement('iframe');
    iframe.src = supersetBaseUrl;

    /* comment/uncomment for debugging */
    iframe.style.display = 'none';
    // iframe.width = '1000';
    // iframe.height = '500';

    iframe.id = SUPERSET_IFRAME_ID;
    document.body.appendChild(iframe);
  }, [supersetBaseUrl]);

  return <></>;
};

export default AppSupersetLogin;
