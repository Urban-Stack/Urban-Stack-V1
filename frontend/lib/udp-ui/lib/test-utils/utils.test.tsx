import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { createRender } from '@/lib/test-utils/utils.ts';

const DEFAULT_HREF = 'https://www.test.default/';
const OVERRIDE_HREF = 'https://www.test.overridden/';
const DEFAULT_TEXT = 'test text default';
const OVERRIDE_TEXT = 'test text override';

type TestComponentProps = {
  href: string;
  text?: string;
};

const TestComponent = ({ href, text }: TestComponentProps) => (
  <a href={href}>{text}</a>
);

describe('createRender', () => {
  it('creates render for default props given', () => {
    const renderComp = createRender(TestComponent, {
      href: DEFAULT_HREF,
      text: DEFAULT_TEXT,
    });

    renderComp();

    expect(screen.getByRole('link')).toHaveProperty('href', DEFAULT_HREF);
    expect(screen.getByRole('link')).toHaveTextContent(DEFAULT_TEXT);
  });

  it('creates render for required default props only given', () => {
    const renderComp = createRender(TestComponent, {
      href: DEFAULT_HREF,
    });

    renderComp();

    expect(screen.getByRole('link')).toHaveProperty('href', DEFAULT_HREF);
    expect(screen.getByRole('link')).toHaveTextContent('');
  });

  it('overrides required default props by passing to created render', () => {
    const renderComp = createRender(TestComponent, {
      href: DEFAULT_HREF,
    });

    renderComp({ href: OVERRIDE_HREF });

    expect(screen.getByRole('link')).not.toHaveProperty('href', DEFAULT_HREF);
    expect(screen.getByRole('link')).toHaveProperty('href', OVERRIDE_HREF);
  });

  it('overrides optional default props by passing to created render', () => {
    const renderComp = createRender(TestComponent, {
      href: DEFAULT_HREF,
      text: DEFAULT_TEXT,
    });

    renderComp({ text: OVERRIDE_TEXT });

    expect(screen.getByRole('link')).toHaveProperty('href', DEFAULT_HREF);
    expect(screen.getByRole('link')).toHaveTextContent(OVERRIDE_TEXT);
  });

  it('adds optional props not specified as default by passing to created render', () => {
    const renderComp = createRender(TestComponent, {
      href: DEFAULT_HREF,
    });

    renderComp({ text: OVERRIDE_TEXT });

    expect(screen.getByRole('link')).toHaveProperty('href', DEFAULT_HREF);
    expect(screen.getByRole('link')).toHaveTextContent(OVERRIDE_TEXT);
  });
});
