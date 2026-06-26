import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import UdpArticlePreviewCard from './UdpArticlePreviewCard';
import { UdpArticlePreviewCardTestIds } from '@/lib/components/molecules/post-preview/testIds';

const mockDate = new Date(2023, 8, 26);

const defaultProps = {
  title: 'Sample Title',
  date: mockDate,
  href: '/',
  children: <p>Sample content</p>,
};

describe('UdpArticlePreviewCard', () => {
  it('renders correctly with given props', () => {
    const component = render(
      <UdpArticlePreviewCard {...defaultProps}>
        Sample content
      </UdpArticlePreviewCard>,
    );

    expect(component.getByText('26. September 2023')).toBeInTheDocument();
    expect(component.getByText('Sample content')).toBeInTheDocument();
    expect(component.getByText('Weiterlesen')).toBeInTheDocument();
  });

  it('merges custom className correctly', () => {
    const component = render(
      <UdpArticlePreviewCard {...defaultProps} className='custom-class'>
        Sample content
      </UdpArticlePreviewCard>,
    );

    const container = component.getByTestId(UdpArticlePreviewCardTestIds.self);
    expect(container).toHaveClass('custom-class');
  });

  it('renders with imageSrc', () => {
    const component = render(
      <UdpArticlePreviewCard
        {...defaultProps}
        imageSrc='https://example.com/image.jpg'
      >
        Sample content
      </UdpArticlePreviewCard>,
    );

    const img = component.container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img?.getAttribute('src')).toBe('https://example.com/image.jpg');
    expect(img?.getAttribute('alt')).toBe('Titelbild des Artikels');
  });

  it('renders with fallback image if imageSrc is not provided', () => {
    const component = render(
      <UdpArticlePreviewCard {...defaultProps} fallbackImage>
        Sample content
      </UdpArticlePreviewCard>,
    );

    const fallback = component.getByTestId(
      UdpArticlePreviewCardTestIds.fallback,
    );
    expect(fallback).toBeInTheDocument();
  });

  it('renders imageSrc and ignores fallbackImage when both are provided', () => {
    const component = render(
      <UdpArticlePreviewCard
        {...defaultProps}
        imageSrc='https://example.com/image.jpg'
        fallbackImage
      >
        Sample content
      </UdpArticlePreviewCard>,
    );

    const img = component.container.querySelector('img');
    const fallback = component.queryByTestId(
      UdpArticlePreviewCardTestIds.fallback,
    );

    expect(img).toBeInTheDocument();
    expect(fallback).not.toBeInTheDocument();
  });

  it('shows a top border if no imageSrc and no fallbackImage', () => {
    const component = render(
      <UdpArticlePreviewCard {...defaultProps}>
        Sample content
      </UdpArticlePreviewCard>,
    );

    const container = component.getByTestId(UdpArticlePreviewCardTestIds.self);
    expect(container).toHaveClass('border-t-4');
    expect(container).toHaveClass('border-primary-700');
  });

  it('renders the link with correct href and target', () => {
    const component = render(
      <UdpArticlePreviewCard {...defaultProps}>
        Sample content
      </UdpArticlePreviewCard>,
    );

    const button = component.getByRole('button', { name: /Weiterlesen/ });
    expect(button).toHaveAttribute('href', '/');
    expect(button).toHaveAttribute('target', '_blank');
  });
});
