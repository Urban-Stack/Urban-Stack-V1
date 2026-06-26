'use client';

import { FormEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { UdpSearchBar, UdpSearchBarProps } from 'udp-ui/components';
import { useDebouncedCallback } from 'use-debounce';

export const DEBOUNCE_IN_MS = 300;

interface AppSearchBarProps extends Pick<
  UdpSearchBarProps,
  'placeholder' | 'disabled'
> {
  paramKey: string;
}

const AppSearchBar = ({ paramKey, ...restProps }: AppSearchBarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchText: string = searchParams.get(paramKey) ?? '';

  const onSearch = useDebouncedCallback((searchText: string) => {
    const params = new URLSearchParams(searchParams);
    if (searchText) {
      params.set(paramKey, searchText);
    } else {
      params.delete(paramKey);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, DEBOUNCE_IN_MS);

  const handleSearch = (e: FormEvent<HTMLInputElement>): void => {
    onSearch(e.currentTarget.value);
  };

  return (
    <UdpSearchBar
      defaultValue={searchText}
      onInput={handleSearch}
      {...restProps}
    />
  );
};

export default AppSearchBar;
