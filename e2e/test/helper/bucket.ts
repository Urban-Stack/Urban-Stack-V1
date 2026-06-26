import { S3 } from '@aws-sdk/client-s3';
import { STORAGE } from './urls';
import { STS } from '@aws-sdk/client-sts';
import {
	aquireTokenViaDeviceCode,
	DATA_HUB_ADMIN_PASSWORD,
	DATA_HUB_ADMIN_USERNAME
} from './keycloak';
import { Browser } from 'playwright';
import { inSeparateBrowser } from './util';

export const BUCKET_ADMIN_AK = process.env.BUCKET_ADMIN_AK;
export const BUCKET_ADMIN_SK = process.env.BUCKET_ADMIN_SK;

const awsOptions = { endpoint: STORAGE, region: 'none', forcePathStyle: true };

export function bucketAdminClient() {
	return new S3({
		...awsOptions,
		credentials: {
			accessKeyId: BUCKET_ADMIN_AK,
			secretAccessKey: BUCKET_ADMIN_SK
		}
	});
}

export async function bucketDatahubAdminClient(browser: Browser) {
	const token = await inSeparateBrowser(browser, (page) =>
		aquireTokenViaDeviceCode(
			page,
			DATA_HUB_ADMIN_USERNAME,
			DATA_HUB_ADMIN_PASSWORD,
			['buckets'],
			'id_token'
		)
	);

	const credentials = (
		await new STS(awsOptions).assumeRoleWithWebIdentity({
			RoleArn: 'arn:aws:iam::RGW99999999999999999:role/usercode',
			RoleSessionName: 'usercode',
			WebIdentityToken: token
		})
	).Credentials;

	return new S3({
		...awsOptions,
		credentials: {
			accessKeyId: credentials.AccessKeyId,
			secretAccessKey: credentials.SecretAccessKey,
			sessionToken: credentials.SessionToken
		}
	});
}
