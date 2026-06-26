import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import FilterButton from './FilterButton';

describe('snapshot', () => {
  it('matches snapshot when `selected` is false', () => {
    const component = render(
      <FilterButton selected={false} onClick={() => {}}>
        Click me
      </FilterButton>,
    );

    expect(component).toMatchSnapshot();
  });

  it('matches snapshot when `selected` is true', () => {
    const component = render(
      <FilterButton selected={true} onClick={() => {}}>
        Click me
      </FilterButton>,
    );

    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const component = render(
      <FilterButton
        selected={true}
        onClick={() => {}}
        className='my-custom-class'
      >
        Click me
      </FilterButton>,
    );

    expect(component).toMatchSnapshot();
  });

  it('matches snapshot when disabled', () => {
    const component = render(
      <FilterButton selected={false} disabled={true} onClick={() => {}}>
        Click me
      </FilterButton>,
    );

    expect(component).toMatchSnapshot();
  });
});
