import { CLICKHOUSE } from './urls';
import axios from 'axios';
import { expect } from 'playwright/test';

export const CLICKHOUSE_ADMIN_PASSWORD = process.env.CLICKHOUSE_ADMIN_PASSWORD;

export async function runQuery(query: string, username?: string, password?: string) {
	return (
		await axios.post<string>(CLICKHOUSE, query, {
			auth: { username: username || 'admin', password: password || CLICKHOUSE_ADMIN_PASSWORD }
		})
	).data;
}

export async function runQueryJson<Row>(query: string, username?: string, password?: string) {
	return (
		await axios.post<{
			meta: { name: string; type: string };
			rows: number;
			data: Row[];
			extremes: {
				min: Row;
				max: Row;
			};
			statistics: {
				elapsed: number;
				rows_read: number;
				bytes_read: number;
			};
		}>(`${CLICKHOUSE}?default_format=JSON`, query, {
			auth: { username: username || 'admin', password: password || CLICKHOUSE_ADMIN_PASSWORD }
		})
	).data;
}

export async function checkSQL(query: string, username?: string, password?: string) {
	expect(await runQuery(query, username, password)).toBeTruthy();
}
