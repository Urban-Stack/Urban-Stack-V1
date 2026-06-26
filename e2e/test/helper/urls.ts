export const URL_SUFFIX = process.env.TARGET_URL_SUFFIX ?? '.data-hub.local';

function makeUrl(deployment: string) {
	return `https://${deployment}${URL_SUFFIX}/`;
}

export function sharedApp(tenant: string, name: string) {
	return `https://${name}.${tenant}${URL_SUFFIX}`;
}

export const MQTT_INTERNAL = `tcp://${process.env.STAGE}-udh-platform-testmqtt`;

export const KEYCLOAK = makeUrl('login');
export const RESOURCE_API = `${KEYCLOAK}realms/udh/data-hub/`;
export const UGH = makeUrl('govhub');
export const UCH = makeUrl('citizenhub');
export const DISCOURSE = makeUrl('community');
export const CLICKHOUSE = makeUrl('clickhouse');
export const SUPERSET = makeUrl('superset');
export const LIGHTNING = makeUrl('lightning');
export const API = makeUrl('api');
export const MQTT = `wss://mqtt${URL_SUFFIX}:443`;
export const JUPYTERHUB = makeUrl('jupyterhub');
export const STORAGE = makeUrl('storage');
export const CKAN = makeUrl('ckan');
export const CITYTOOLS = makeUrl('citytools');
export const DOCS = makeUrl('docs');
export const MAILHOG = makeUrl('mailhog');
export const NIFI = makeUrl('nifi');
export const CITIZENHUB = makeUrl('citizenhub');
