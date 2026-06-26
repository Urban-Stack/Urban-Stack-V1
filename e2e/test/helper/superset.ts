import axios, { Axios } from 'axios';
import { SUPERSET } from './urls';

let _supersetClient: Axios;
export async function supersetClient() {
	if (_supersetClient) return _supersetClient;
	const accessToken = (
		await axios.post(`${SUPERSET}api/v1/security/login`, {
			provider: 'db',
			username: 'admin',
			password: process.env.SUPERSET_PASSWORD
		})
	).data.access_token;
	const tmpClient = new Axios({ headers: { Authorization: `Bearer ${accessToken}` } });
	const csrfResponse = await tmpClient.get<string>(`${SUPERSET}api/v1/security/csrf_token/`);
	const csrfCookie = csrfResponse.headers['set-cookie'][0].split(';')[0];
	const csrfToken = JSON.parse(csrfResponse.data).result;
	_supersetClient = new Axios({
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'X-CSRFToken': csrfToken,
			Cookie: csrfCookie,
			'Content-Type': 'application/json'
		}
	});
	return _supersetClient;
}
