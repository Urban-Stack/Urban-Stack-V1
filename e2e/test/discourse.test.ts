import test, { Browser, expect, Page } from 'playwright/test';
import { signInDiscourse } from './helper/discourse';
import {
	createTestUser,
	DATA_HUB_ADMIN_PASSWORD,
	DATA_HUB_ADMIN_USERNAME,
	User
} from './helper/keycloak';
import { DISCOURSE, UGH } from './helper/urls';
import { getRandomString, RandomTenantManager } from './helper/util';
import { graphql, checkedGraphqlRequest } from './helper/graphql';
import { discourseProfilePictureUrl, docsScreenshot, fixupTenantName } from './helper/screenshot';

const TENANT_MGR = new RandomTenantManager();

const CATEGORY_BOX_LOCATOR =
	"//div[contains(concat(' ',normalize-space(@class),' '),' category-box ')]";

test.describe('Discourse', () => {
	test.skip(
		({ browserName }) => browserName === 'firefox',
		'Discourse tests are unstable on Firefox, will be fixed'
	);

	async function createAndLoginUser(
		browser: Browser,
		groups: string[],
		username?: string
	): Promise<{ page: Page; user: User }> {
		const email = `${username ?? getRandomString(6)}@example.com`;
		const testUserConfig = {
			email,
			firstName: username,
			password: DATA_HUB_ADMIN_PASSWORD
		};
		const user = await createTestUser(testUserConfig, groups);
		const page = await browser.newPage();
		await page.goto(`${DISCOURSE}categories`);
		await signInDiscourse(page, testUserConfig);
		return { page, user };
	}

	async function createTopic(
		page: Page,
		category: string,
		topic: string,
		body: string,
		tags: string[]
	) {
		await page.goto(`${DISCOURSE}new-topic?category=${category}`);
		await page.waitForTimeout(2000);
		await page.getByPlaceholder('Gib einen Titel ein').fill(topic);
		await page.getByText('optionale Schlagwörter').click();
		for (const tag of tags) {
			await page.getByRole('searchbox', { name: 'Suchen oder erstellen' }).fill(tag);
			await page.getByRole('menuitemradio', { name: tag }).click();
		}
		// close tag dropdown
		await page.getByPlaceholder('Gib einen Titel ein').click();
		await page.locator('.ProseMirror').fill(body);
		await page.getByRole('button', { name: 'Thema erstellen' }).click();
		await expect(page.getByRole('button', { name: 'Lesezeichen setzen' })).toBeVisible();
	}

	async function checkLoadingFinished(page: Page) {
		await expect(page.locator("//div[@class='loading-indicator-container ready']")).toBeVisible();
	}

	test('changes', async ({ browser }) => {
		const { page } = await createAndLoginUser(browser, ['guetersloh/admin']);

		await test.step('Display "Chat" instead of "DN"', async () => {
			await expect(page.getByText('Neuen Chat starten', { exact: true })).toBeVisible();
		});

		await test.step('No direct messages', async () => {
			await expect(page.getByRole('link', { name: 'Posteingang' })).not.toBeVisible();
		});
	});

	test('deletes subcategories', async ({ page }) => {
		const tenantPostfix = getRandomString(6);
		const tenantName = TENANT_MGR.with(tenantPostfix);
		await checkedGraphqlRequest(
			graphql`
				mutation createTenant($tenantName: String!) {
					createTenant(tenant: $tenantName) {
						tenant
					}
				}
			`,
			{
				tenantName
			}
		);
		await page.goto(`${DISCOURSE}categories`);
		await signInDiscourse(page, {
			email: DATA_HUB_ADMIN_USERNAME,
			password: DATA_HUB_ADMIN_PASSWORD
		});
		await page.getByRole('button', { name: 'Neue Kategorie' }).click();
		await page
			.getByRole('textbox', { name: 'Name der Kategorie' })
			.fill(`subcategory for ${tenantPostfix}`);
		await page.getByLabel('Filtern nach: Keiner').click();
		await page.getByPlaceholder('Suchen …').fill(tenantName);
		await page.getByRole('menuitemradio', { name: tenantName, exact: true }).click();
		await page.getByRole('button', { name: 'Kategorie erstellen' }).click();
		await expect(page.getByRole('button', { name: 'Kategorie löschen' })).toBeVisible();
		await page
			.getByRole('textbox', { name: 'Name der Kategorie' })
			.fill(`subcategory for ${tenantPostfix} 2`);
		await checkedGraphqlRequest(
			graphql`
				mutation deleteTenant($tenantName: String!) {
					deleteTenant(tenant: $tenantName)
				}
			`,
			{
				tenantName
			}
		);
		// the subcategory is now deleted, so saving it causes an error
		await page.getByRole('button', { name: 'Kategorie speichern' }).click();
		await expect(
			page.getByText(
				'Ein Fehler ist aufgetreten: Die angeforderte URL oder Ressource konnte nicht gefunden werden.'
			)
		).toBeVisible();
	});

	test.fixme('Create category for tenant', async ({ browser }) => {
		const myTenantPostfix = getRandomString(6);
		const myTenantName = TENANT_MGR.with(myTenantPostfix);
		const myTenantDisplayName = `Das schöne, idyllische Dorf Knuffingen (${myTenantPostfix})`;
		const otherTenantPostfix = getRandomString(6);
		const otherTenantName = TENANT_MGR.with(otherTenantPostfix);
		const otherTenantDisplayName = `Das schöne, idyllische Dorf Knuffingen (${otherTenantPostfix})`;
		await checkedGraphqlRequest(
			graphql`
				mutation createTenant(
					$myTenantName: String!
					$myTenantDisplayName: String!
					$otherTenantName: String!
					$otherTenantDisplayName: String!
				) {
					my: createTenant(tenant: $myTenantName) {
						tenant
						patchAttributes(
							attributes: [
								{ key: "tenant-name", value: $myTenantDisplayName }
								{ key: "color-primary", value: "1c782c" }
							]
						) {
							key
						}
					}
					other: createTenant(tenant: $otherTenantName) {
						tenant
						patchAttributes(attributes: [{ key: "tenant-name", value: $otherTenantDisplayName }]) {
							key
						}
					}
				}
			`,
			{
				myTenantName,
				myTenantDisplayName,
				otherTenantName,
				otherTenantDisplayName
			}
		);

		const testTopic = `This is a test topic ${myTenantPostfix}`;
		const staffCategorySelector = (p: Page) =>
			p.locator('#main-outlet').getByRole('link', { name: 'Team' });

		const { page: memberPage } = await createAndLoginUser(browser, [myTenantName]);
		const { page: adminPage } = await createAndLoginUser(browser, [
			myTenantName,
			`${myTenantName}/admin`
		]);
		// member can see their tenant (but not the other tenant)
		await expect(memberPage.getByRole('link', { name: myTenantDisplayName })).toBeVisible();
		await expect(memberPage.getByRole('link', { name: otherTenantDisplayName })).not.toBeVisible();
		// member can't see staff
		await expect(staffCategorySelector(memberPage)).not.toBeVisible();

		// tenant category is correctly colored
		await expect(
			memberPage.locator(CATEGORY_BOX_LOCATOR).filter({ hasText: myTenantDisplayName })
		).toHaveAttribute('style', '--category-badge-color: #1c782c;');

		await memberPage.getByRole('link', { name: myTenantDisplayName }).click();
		// this ensures that the topic is created in the right category, otherwise it can be created in Allgemein due to a race condition
		await expect(
			memberPage.getByRole('link', { name: `Über die Kategorie ${myTenantDisplayName}` })
		).toBeVisible();
		// member can create a new topic
		await memberPage.getByRole('button', { name: 'Neues Thema' }).click();
		await memberPage.getByPlaceholder('Gib einen Titel ein').fill(testTopic);
		await memberPage.locator('.ProseMirror').fill('Hey everyone, this is my very first topic');
		// make sure everyone can create tags
		await memberPage.getByText('optionale Schlagwörter').click();
		await memberPage
			.getByPlaceholder('Suchen oder erstellen …')
			.fill(`schlagwort ${myTenantPostfix}`);
		await memberPage.getByRole('menuitemradio', { name: `schlagwort-${myTenantPostfix}` }).click();
		await memberPage.getByRole('button', { name: 'Thema erstellen' }).click();
		await expect(memberPage.getByRole('button', { name: 'Lesezeichen setzen' })).toBeVisible();

		// admin can see their tenant (but not the other tenant)
		await expect(adminPage.getByRole('link', { name: myTenantDisplayName })).toBeVisible();
		await expect(adminPage.getByRole('link', { name: otherTenantDisplayName })).not.toBeVisible();
		// admin can see staff
		await expect(staffCategorySelector(adminPage)).toBeVisible();
		await adminPage.getByRole('link', { name: myTenantDisplayName }).click();
		// admin has moderator so can delete the topic
		await adminPage.getByRole('link', { name: testTopic }).click();
		await adminPage.getByTitle('mehr anzeigen').click();
		await adminPage.getByTitle('Thema löschen').click();
		await expect(adminPage.getByTitle('Thema löschen')).not.toBeVisible();
		await adminPage.getByRole('link', { name: myTenantDisplayName }).click();
		await expect(
			adminPage.getByRole('link', { name: `Über die Kategorie ${myTenantDisplayName}` })
		).toBeVisible();
		await expect(adminPage.getByRole('link', { name: testTopic })).not.toBeVisible();

		await memberPage.close();
		await adminPage.close();
	});

	test('moderation screenshots', async ({ browser }) => {
		const postfix = getRandomString(6);
		const tenant = TENANT_MGR.with(postfix);
		const tenantDisplayName = `Knuffingen ${postfix}`;
		await checkedGraphqlRequest(
			graphql`
				mutation createTenant($tenant: String!, $tenantDisplayName: String!) {
					createTenant(tenant: $tenant) {
						patchAttributes(
							attributes: [
								{ key: "tenant-name", value: $tenantDisplayName }
								{ key: "color-primary", value: "1c782c" }
							]
						) {
							key
						}
					}
				}
			`,
			{
				tenant,
				tenantDisplayName
			}
		);

		const adminUsername = `mod-${getRandomString(6)}`;
		const normalUsername = `user-${getRandomString(6)}`;
		const { page: userPage } = await createAndLoginUser(browser, [tenant], normalUsername);
		const { page: adminPage } = await createAndLoginUser(
			browser,
			[`${tenant}/admin`],
			adminUsername
		);

		// create topic as admin, report as normal user
		const testTopic = 'Verbesserung der Radinfrastruktur durch Sensor-Überwachung';
		await createTopic(
			adminPage,
			tenant,
			`${testTopic} ${postfix}`,
			'Ich finde Waschmaschinen super',
			['fahrrad', 'sensor']
		);
		const fixupTopicTitle = (page: Page) =>
			page.getByText(testTopic).evaluate((el, topic) => (el.textContent = topic), testTopic);

		const wrenchBtn = adminPage.locator('.timeline-controls').getByRole('button');
		await wrenchBtn.click();
		await fixupTenantName(adminPage, postfix);
		await fixupTopicTitle(adminPage);
		const fixupUser = async () => {
			await expect(adminPage.getByText(adminUsername).first()).toBeVisible();
			await adminPage
				.locator('.post-avatar')
				.locator('img')
				.first()
				.evaluate(
					(el, imgUrl) => ((el as HTMLImageElement).src = imgUrl),
					discourseProfilePictureUrl('t')
				);
			await adminPage
				.getByText(adminUsername)
				.evaluateAll(
					(elements, adminUsername) =>
						elements.forEach(
							(el) => (el.textContent = el.textContent.replace(adminUsername, 'testuser'))
						),
					adminUsername
				);
		};
		await fixupUser();
		await docsScreenshot('discourse-moderate-topic-menu', wrenchBtn, {
			crop: false,
			highlightRadius: 20
		});

		await adminPage.getByTitle('mehr anzeigen').click();
		await adminPage.getByTitle('Administrative Aktionen').click();
		const noticeBtn = adminPage.getByRole('button', { name: 'Offizielle Mitteilung' });
		await docsScreenshot('discourse-add-official-notice', noticeBtn);
		await noticeBtn.click();
		await adminPage.getByRole('textbox').fill('Dies ist eine offizielle Mitteilung');
		await adminPage.getByRole('button', { name: 'Änderungen speichern' }).click();
		await checkLoadingFinished(adminPage);
		// bug? doesn't appear until after a reload
		await adminPage.reload();
		await checkLoadingFinished(adminPage);
		await fixupTenantName(adminPage, postfix);
		await fixupTopicTitle(adminPage);
		await fixupUser();
		await docsScreenshot('discourse-official-notice', adminPage);

		await userPage.goto(adminPage.url());
		await userPage.getByTitle('mehr anzeigen').click();
		await userPage.getByTitle('diesen Beitrag privat melden').click();
		await userPage.getByRole('radio', { name: 'Am Thema vorbei' }).check();
		await userPage.getByRole('button', { name: 'Beitrag melden' }).click();
		await expect(userPage.getByText('Du hast das als „am thema vorbei“ gemeldet')).toBeVisible();

		const reviewLink = adminPage.getByRole('link', { name: 'Überprüfen 1 ausstehend' });
		await adminPage.goto(DISCOURSE);
		await checkLoadingFinished(adminPage);
		await fixupTenantName(adminPage, postfix);
		await docsScreenshot('discourse-link-to-review', reviewLink, { crop: false });
		await reviewLink.click();

		await fixupTopicTitle(adminPage);
		await fixupTenantName(adminPage, postfix);
		// fixup admin user profile picture and name
		await adminPage
			.getByRole('img', { name: `${adminUsername} User` })
			.evaluateAll(
				(el, imgUrl) => el.forEach((e) => ((e as HTMLImageElement).src = imgUrl)),
				discourseProfilePictureUrl('a')
			);
		await adminPage
			.getByText(adminUsername, { exact: true })
			.evaluateAll((el) => el.forEach((e) => (e.textContent = 'anotheruser')));
		// fixup reporting user profile picture and name
		await adminPage
			.getByRole('link', { name: `Profil von ${normalUsername}` })
			.evaluate((el) => (el.textContent = 'testuser'));
		await adminPage.getByRole('img', { name: `${normalUsername} User` }).evaluate((el, imgUrl) => {
			(el as HTMLImageElement).src = imgUrl;
		}, discourseProfilePictureUrl('t'));

		await docsScreenshot('discourse-review-report', adminPage);

		await userPage.close();
		await adminPage.close();
	});

	test('base screenshots', async ({ browser }) => {
		const postfix = getRandomString(6);
		const tenant = TENANT_MGR.with(postfix);
		const tenantDisplayName = `Knuffingen ${postfix}`;
		await checkedGraphqlRequest(
			graphql`
				mutation createTenant($tenant: String!, $tenantDisplayName: String!) {
					createTenant(tenant: $tenant) {
						patchAttributes(
							attributes: [
								{ key: "tenant-name", value: $tenantDisplayName }
								{ key: "color-primary", value: "1c782c" }
							]
						) {
							key
						}
					}
				}
			`,
			{
				tenant,
				tenantDisplayName
			}
		);
		const { page: setupPage } = await createAndLoginUser(browser, [tenant]);
		const testTopic = 'Verbesserung der Radinfrastruktur durch Sensor-Überwachung';
		await createTopic(
			setupPage,
			tenant,
			`${testTopic} ${postfix}`,
			'Welche Ideen gibt es auf diesem Gebiet? Ich freue mich von euch zu hören!',
			['fahrrad', 'sensor']
		);
		await docsScreenshot('discourse-topic-more-options', setupPage.getByTitle('mehr anzeigen'), {
			highlightRadius: 20
		});
		await setupPage.getByTitle('mehr anzeigen').click();
		await docsScreenshot(
			'discourse-edit-topic',
			setupPage.getByTitle('diesen Beitrag bearbeiten'),
			{ highlightRadius: 20 }
		);
		await setupPage.close();
		const { page } = await createAndLoginUser(browser, [tenant]);
		await fixupTenantName(page, postfix);
		await docsScreenshot('discourse-main', page, { crop: false });
		const search = page.getByRole('button', { name: 'Suche', exact: true });
		const searchMenu = page.locator('.menu-panel');
		await docsScreenshot('discourse-search-start', search, { highlightRadius: 20 });
		await search.click();
		await page.getByRole('searchbox', { name: 'Suche' }).fill('fahrrad');
		await docsScreenshot('discourse-search-entered', search, { highlightRadius: 20, crop: false });
		await page.getByRole('link', { name: 'Suche fahrrad in allen Themen' }).click();
		await expect(
			page.getByRole('link', { name: 'Verbesserung der Radinfrastruktur' })
		).toBeVisible();
		await fixupTenantName(page, postfix);
		const fixupTopicTitle = () =>
			page
				.getByText(testTopic)
				.evaluateAll((el, topic) => el.forEach((e) => (e.textContent = topic)), testTopic);
		await fixupTopicTitle();
		await docsScreenshot('discourse-search-result', searchMenu, { highlight: false });
		// close search
		await search.click();

		const tenantCategory = page.locator('#main-outlet').getByText('Knuffingen', { exact: true });

		await docsScreenshot('discourse-tenant-category', tenantCategory);
		const userSettings = page.getByRole('button', { name: 'Benachrichtigungen und Konto' });
		await docsScreenshot('discourse-user-settings-1', userSettings, { highlightRadius: 35 });
		await userSettings.click();
		await docsScreenshot(
			'discourse-user-settings-bookmark',
			page.getByRole('tab', { name: 'Lesezeichen' }),
			{ highlightRadius: 25 }
		);
		const profile = page.getByTitle('Profil', { exact: true });
		await docsScreenshot('discourse-user-settings-2', profile, { highlightRadius: 25 });
		await profile.click();
		const settings = page.getByRole('link', { name: 'Einstellungen' });
		await docsScreenshot('discourse-user-settings-3', settings);
		// close user settings
		await userSettings.click();

		const createTopicBtn = page.getByRole('button', { name: 'Neues Thema' });
		await checkLoadingFinished(page);
		await page.evaluate(() => {
			// this popver is really inconsistent, trying to dismiss it frequently runs into a timeout, so just add a global style to hide it
			// also hide the internal username, it's only displayed when the settings are wrong
			const s = document.createElement('style');
			s.textContent = '.composer-popup-container, .second.username {display: none;}';
			document.head.appendChild(s);
		});
		await docsScreenshot('discourse-create-topic-button', createTopicBtn, { crop: false });
		await createTopicBtn.click();
		await page.getByRole('switch', { name: 'Zum Standard-Markdown-Editor' }).click();
		await docsScreenshot(
			'discourse-create-topic-change-category',
			page.getByLabel('Filtern nach: Allgemein')
		);
		await docsScreenshot('discourse-create-topic-tags', page.getByText('optionale Schlagwörter'));
		await page
			.getByRole('textbox', { name: 'Schreib hier. Verwende' })
			.fill('**Fett** *Kursiv* [Ein Link](https://example.com)\n> Zitat\n\n`Vorformatierter Text`');
		await docsScreenshot(
			'discourse-topic-creator',
			page.getByRole('button', { name: 'K', exact: true }),
			{ crop: false, highlightRadius: 15 }
		);
		await docsScreenshot(
			'discourse-create-topic-submit',
			page.getByRole('button', { name: 'Thema erstellen' })
		);
		await page.getByRole('textbox', { name: 'Schreib hier. Verwende' }).fill('');
		await page.getByRole('button', { name: 'Optionen' }).click();
		await docsScreenshot(
			'discourse-create-topic-create-poll',
			page.getByRole('button', { name: 'Umfrage erstellen' })
		);

		await page.getByRole('button', { name: 'Schließen' }).click();

		await tenantCategory.click();
		const topicToEnter = page.getByRole('link', { name: 'Verbesserung der Radinfrastruktur' });
		await expect(topicToEnter).toBeVisible();
		await checkLoadingFinished(page);
		await page
			.getByTitle('Test User')
			.evaluate(
				(el, imgUrl) => ((el as HTMLImageElement).src = imgUrl),
				discourseProfilePictureUrl('t')
			);
		await fixupTenantName(page, postfix);
		await fixupTopicTitle();
		await docsScreenshot('discourse-topic-list', page);
		await topicToEnter.click();
		await expect(page.getByRole('button', { name: 'Lesezeichen setzen' })).toBeVisible();
		// fixup stuff
		const fixupForTopic = async () => {
			await page.evaluate((imgUrl) => {
				// make user consistent
				const names = document.getElementsByClassName('names').item(0).children;
				names.item(0).textContent = 'testuser';
				document
					.getElementsByClassName('main-avatar')
					.item(0)
					.firstElementChild.setAttribute('src', imgUrl);
			}, discourseProfilePictureUrl('t'));
			await fixupTenantName(page, postfix);
			await fixupTopicTitle();
		};
		await checkLoadingFinished(page);
		await fixupForTopic();
		await docsScreenshot('discourse-topic', page, { highlight: false });
		await docsScreenshot(
			'discourse-topic-reply-post',
			page.getByRole('button', { name: 'Antworte auf' }),
			{ crop: false }
		);
		await docsScreenshot(
			'discourse-topic-share-post',
			page.getByRole('button', { name: 'Teilen' })
		);
		await docsScreenshot(
			'discourse-topic-set-bookmark',
			page.getByRole('button', { name: 'Lesezeichen setzen' })
		);
		await page.getByRole('button', { name: 'Normal' }).click();
		await page.getByRole('button', { name: 'Stummgeschaltet' }).scrollIntoViewIfNeeded();
		await fixupForTopic();
		await docsScreenshot(
			'discourse-topic-notification',
			page.getByRole('button', { name: 'Stummgeschaltet' }),
			{ crop: false, highlight: false, scroll: false }
		);
		await page.getByRole('button', { name: 'Melden' }).click();
		await page.getByRole('radio', { name: 'Unangemessen' }).check();
		await docsScreenshot(
			'discourse-topic-report-post-confirm',
			page.getByRole('button', { name: 'Thema melden' }),
			{ crop: false, highlight: false }
		);

		await page.goto(`${DISCOURSE}chat/direct-messages`);
		const createNewChat = page
			.locator('#main-chat-outlet')
			.getByTitle('Persönlichen Chat erstellen');
		await createNewChat.click();
		await page.getByRole('textbox', { name: 'Filter' }).fill('admin');
		await docsScreenshot('discourse-chat-search-user', page.getByText('Data Hub Admin'), {
			crop: false
		});
		await page.getByText('Data Hub Admin').click();
		await page.goto(`${DISCOURSE}chat/direct-messages`);
		await docsScreenshot('discourse-create-chat', createNewChat, {
			highlightRadius: 15,
			crop: false
		});

		await page.close();
	});

	test('request citytool', async ({ browser }) => {
		const postfix = getRandomString(6);
		const tenant = TENANT_MGR.with(postfix);
		const tenantDisplayName = `Knuffingen ${postfix}`;
		await checkedGraphqlRequest(
			graphql`
				mutation createTenant($tenant: String!, $tenantDisplayName: String!) {
					createTenant(tenant: $tenant) {
						patchAttributes(
							attributes: [
								{ key: "tenant-name", value: $tenantDisplayName }
								{ key: "color-primary", value: "1c782c" }
							]
						) {
							key
						}
					}
				}
			`,
			{
				tenant,
				tenantDisplayName
			}
		);
		const { page: adminPage } = await createAndLoginUser(browser, [`${tenant}/admin`]);
		const { page: userPage, user } = await createAndLoginUser(browser, [tenant]);

		await adminPage.goto(UGH);
		// expand sidebar
		await adminPage.getByTestId('app-sidebar-toggle').click();

		const {
			data: {
				tenant: { newTopicLink }
			}
		} = await checkedGraphqlRequest(
			graphql`
				query ($tenant: String!) {
					tenant(tenant: $tenant) {
						newTopicLink: requestCityToolLink(citytool: "Masterportal")
					}
				}
			`,
			{ tenant },
			user
		);

		await userPage.goto(`${DISCOURSE}${newTopicLink}`);
		await expect(userPage.getByRole('textbox', { name: 'Gib einen Titel ein' })).toHaveValue(
			`Anfrage Masterportal für ${tenantDisplayName}`
		);
		await userPage.locator('.ProseMirror').fill('Ich finde das Masterportal super');
		await expect(userPage.getByLabel('Neues Thema').getByText('City Tools Anfragen')).toBeVisible();
		await expect(userPage.getByLabel('Neues Thema').getByText(tenantDisplayName)).toBeVisible();
		await userPage.getByRole('button', { name: 'Thema erstellen' }).click();

		// admin gets notification
		await expect(
			adminPage.getByTestId('app-sidebar').getByRole('link', { name: 'Community' }).getByText('1')
		).toBeVisible();

		const {
			data: {
				tenant: { existingTopicLink }
			}
		} = await checkedGraphqlRequest(
			graphql`
				query ($tenant: String!) {
					tenant(tenant: $tenant) {
						existingTopicLink: requestCityToolLink(citytool: "Masterportal")
					}
				}
			`,
			{ tenant },
			user
		);

		expect(existingTopicLink).toBe(`/t/anfrage-masterportal-fuer-knuffingen-${postfix}`);
	});
});
