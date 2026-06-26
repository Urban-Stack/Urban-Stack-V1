import { render, screen } from '@testing-library/react';
import BucketSelector from './BucketSelector';
import { useRouter, useSearchParams } from 'next/navigation';
import { Project } from '@/app/_lib/resource-api/project';

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  usePathname: jest.fn().mockReturnValue('/s3manager'),
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe('BucketSelector', () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    mockReplace.mockReset();
    (useRouter as jest.Mock).mockReset();
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
  });

  const projects: Project[] = [
    { name: 'P1', tenant: 'T1', _tag: 'Project' },
    { name: 'P2', tenant: 'T2', _tag: 'Project' },
  ];

  it('disables select if no projects exist', () => {
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());

    render(<BucketSelector projects={[]} />);

    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('sets the first project as bucket if none is in search params', () => {
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());

    render(<BucketSelector projects={projects} />);

    expect(mockReplace).toHaveBeenCalledWith('/s3manager?bucket=T1.P1');
    expect(screen.getByRole('combobox')).not.toBeDisabled();
    expect(screen.getByRole('combobox')).toHaveValue('T1.P1');
  });

  it('sets the first project if the given bucket does not exist', () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('bucket=invalid_bucket'),
    );

    render(<BucketSelector projects={projects} />);

    expect(mockReplace).toHaveBeenCalledWith('/s3manager?bucket=T1.P1');
    expect(screen.getByRole('combobox')).not.toBeDisabled();
    expect(screen.getByRole('combobox')).toHaveValue('T1.P1');
  });

  it('sets the bucket given by the search params if it exists', () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('bucket=T2.P2'),
    );

    render(<BucketSelector projects={projects} />);

    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.getByRole('combobox')).not.toBeDisabled();
    expect(screen.getByRole('combobox')).toHaveValue('T2.P2');
  });
});
