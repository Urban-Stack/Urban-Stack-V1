import { render } from '@testing-library/react';
import AppFooter from '@/app/AppFooter';

describe('properties', () => {
  it('contains correct menu entries', () => {
    const menuEntries = [
      ['Impressum', 'https://www.guetersloh.de/de/impressum.php'],
      ['Datenschutz', 'https://www.guetersloh.de/de/datenschutz.php'],
      ['Kontakt', 'https://www.guetersloh.de/de/kontakt/'],
    ];

    const component = render(<AppFooter />);

    menuEntries.forEach(([name, url]) => {
      const menuEntry = component.getByRole('link', { name });
      expect(menuEntry).toBeVisible();
      expect(menuEntry).toHaveAttribute('href', url);
    });
  });
});
