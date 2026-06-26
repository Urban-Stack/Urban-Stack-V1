import test, { expect } from 'playwright/test';
import { DOCS } from './helper/urls';
import { hasLegalLinks } from './helper/util';

test('docs are deployed', async ({ page }) => {
	await page.goto(`${DOCS}`);

	expect(await page.title()).toBe('UrbanStack Dokumentation');
	await expect(page.getByRole('heading', { name: 'Willkommen beim UrbanStack' })).toBeVisible();
});

test('mermaid diagrams are rendered', async ({ page }) => {
	await page.goto(`${DOCS}entwicklung/dokumentation`);

	await expect(page.getByText('flowchart LR')).toHaveCount(1);
});

test('language is set to german', async ({ page }) => {
	await page.goto(`${DOCS}`);

	expect(await page.getAttribute('html', 'lang')).toBe('de');
});

test('has legal links', async ({ page }) => {
	await page.goto(DOCS);
	await hasLegalLinks(page);
});
