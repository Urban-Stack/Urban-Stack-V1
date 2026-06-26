import { getRandomString } from './util';
import { DATA_HUB_ADMIN_PASSWORD } from './keycloak';

export interface TestUserCreation {
	email: string;
	password: string;
	firstName?: string;
	lastName?: string;
}

export interface TestUser extends TestUserCreation {
	id: string;
}

export const grogStrongjaw: () => TestUserCreation = () => {
	return {
		email: `${`grog-${getRandomString(6)}`}@example.com`,
		password: DATA_HUB_ADMIN_PASSWORD,
		firstName: 'Grog',
		lastName: 'Strongjaw'
	};
};

export const scanlanShorthalt: () => TestUserCreation = () => {
	return {
		email: `${`scanlan-${getRandomString(6)}`}@example.com`,
		password: DATA_HUB_ADMIN_PASSWORD,
		firstName: 'Scanlan',
		lastName: 'Shorthalt'
	};
};
