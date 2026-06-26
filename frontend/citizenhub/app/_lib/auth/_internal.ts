/**
 * Returns the URL to log out of the Keycloak session and redirects to sign-out callback to end the current session.
 * @throws Error if any of the required environment variables are missing.
 */
export const logoutUrl: (
  baseUrl: string,
  clientId: string,
  redirectUrl: string,
) => string = (baseUrl, clientId, redirectUrl) => {
  const _redirectUrl = encodeURIComponent(redirectUrl);
  return `${baseUrl}/protocol/openid-connect/logout?post_logout_redirect_uri=${_redirectUrl}&client_id=${clientId}`;
};
