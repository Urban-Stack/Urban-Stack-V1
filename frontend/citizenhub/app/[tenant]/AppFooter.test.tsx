import { render } from '@testing-library/react';
import AppFooter from '@/app/[tenant]/AppFooter';

describe('properties', () => {
  it('contains correct menu entries', () => {
    const legalNoticeUrl = 'https://www.guetersloh.de/de/impressum.php';
    const privacyUrl = 'https://www.guetersloh.de/de/datenschutz.php';
    const contactUrl = 'https://www.guetersloh.de/de/kontakt/';
    const menuEntries = [
      ['Impressum', legalNoticeUrl],
      ['Datenschutz', privacyUrl],
      ['Kontakt', contactUrl],
    ];

    const component = render(
      <AppFooter
        legalNoticeUrl={legalNoticeUrl}
        privacyUrl={privacyUrl}
        contactUrl={contactUrl}
      />,
    );

    menuEntries.forEach(([name, url]) => {
      const menuEntry = component.getByRole('link', { name });
      expect(menuEntry).toBeVisible();
      expect(menuEntry).toHaveAttribute('href', url);
    });
  });
});
