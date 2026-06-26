import {
  buildCategoryOptions,
  CITYTOOL_CATEGORY_ORDER,
} from '@/app/citytools/_internal/categories';

describe('buildCategoryOptions', () => {
  it('marks selected categories as checked', () => {
    const selected = ['Apps & Tools', 'Office'];

    const options = buildCategoryOptions(selected);
    expect(options.length).toEqual(CITYTOOL_CATEGORY_ORDER.length);

    expect(options).toEqual([
      expect.objectContaining({
        id: 'Apps & Tools',
        label: 'Apps & Tools',
        checked: true,
      }),
      expect.objectContaining({
        id: 'Bürgerservices',
        label: 'Bürgerservices',
        checked: false,
      }),
      expect.objectContaining({
        id: 'Datenanalyse',
        label: 'Datenanalyse',
        checked: false,
      }),
      expect.objectContaining({
        id: 'Fachverfahren',
        label: 'Fachverfahren',
        checked: false,
      }),
      expect.objectContaining({
        id: 'Geoinformation',
        label: 'Geoinformation',
        checked: false,
      }),
      expect.objectContaining({
        id: 'Intelligente Automation',
        label: 'Intelligente Automation',
        checked: false,
      }),
      expect.objectContaining({
        id: 'Office',
        label: 'Office',
        checked: true,
      }),
    ]);
  });

  it('returns deselected elements by default', () => {
    const options = buildCategoryOptions();
    expect(options.length).toEqual(CITYTOOL_CATEGORY_ORDER.length);

    options.forEach((option) => expect(option.checked).toBeFalsy());
  });
});
