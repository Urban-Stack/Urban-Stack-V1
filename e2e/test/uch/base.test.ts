import { expect, test } from 'playwright/test';
import { UCH } from '../helper/urls';

test('access Citizen-Hub and get redirected to guetersloh', async ({ page }) => {
	await page.goto(UCH);

	await expect(page.getByRole('heading', { name: 'Herzlich Willkommen!' })).toBeVisible();
	await expect(page.getByText('Im Urban Citizen Hub der Stadt Gütersloh')).toBeVisible();
});

test('access specific tenant', async ({ page }) => {
	await page.goto(UCH + '/detmold');

	await expect(page.getByRole('heading', { name: 'Herzlich Willkommen!' })).toBeVisible();
	await expect(page.getByText('Im Urban Citizen Hub der Stadt Detmold')).toBeVisible();
});
